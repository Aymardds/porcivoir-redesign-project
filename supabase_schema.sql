-- Active: Supabase SQL Editor
-- Supabase Full E-commerce Schema

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'editor', 'stock_manager', 'seo');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- 2. Profiles (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    role user_role DEFAULT 'customer'::user_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Toggle RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Categories
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Products
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    sku TEXT UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    customer_name TEXT, -- For guest checkout
    customer_phone TEXT, -- For guest checkout
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_area TEXT NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'cod', -- 'cod' or 'online'
    payment_id TEXT, -- CinetPay transaction ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Order Items
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- 7. Promotions
CREATE TABLE public.promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER,
    discount_amount DECIMAL(10,2),
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Automate Profile Creation on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create an order (Guest checkout support)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Allow admins to manage all orders 
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
