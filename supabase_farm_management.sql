-- Farm Management Schema for Porcivoire

-- Enums
CREATE TYPE animal_type AS ENUM ('truie', 'verrat', 'porcelet', 'porc_charcutier');
CREATE TYPE animal_status AS ENUM ('au_lait', 'croissance', 'reproduction', 'vendu', 'decede');

-- 1. Farms
CREATE TABLE public.farms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Animals / Herd
CREATE TABLE public.animals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    type animal_type NOT NULL,
    status animal_status NOT NULL,
    identifier TEXT, -- Tag or name
    birth_date DATE,
    weight DECIMAL(10,2), -- in kg
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Feed Inventory
CREATE TABLE public.feed_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    feed_type TEXT NOT NULL, -- e.g., 'Croissance', 'Maternité'
    quantity_kg DECIMAL(10,2) DEFAULT 0 NOT NULL,
    last_restock_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Feed Consumption Log
CREATE TABLE public.feed_consumptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    feed_inventory_id UUID REFERENCES public.feed_inventory(id) ON DELETE CASCADE NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    consumption_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Veterinary Records
CREATE TABLE public.veterinary_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE, -- Nullable if group treatment
    treatment_date DATE NOT NULL,
    treatment_type TEXT NOT NULL, -- e.g., 'Vaccin', 'Déparasitage', 'Soin blessure'
    description TEXT,
    cost DECIMAL(10,2),
    veterinarian_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Livestock Sales
CREATE TABLE public.livestock_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE RESTRICT NOT NULL,
    sale_date DATE NOT NULL,
    buyer_info TEXT,
    price DECIMAL(10,2) NOT NULL,
    weight_at_sale DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_farms_modtime BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_animals_modtime BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_feed_inventory_modtime BEFORE UPDATE ON public.feed_inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_sales ENABLE ROW LEVEL SECURITY;

-- Farms Policies
CREATE POLICY "Users can view their own farms" ON public.farms FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own farms" ON public.farms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own farms" ON public.farms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all farms" ON public.farms FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Animals Policies
CREATE POLICY "Users can view their farm animals" ON public.animals FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can insert animals in their farm" ON public.animals FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can update animals in their farm" ON public.animals FOR UPDATE USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all animals" ON public.animals FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Feed Inventory Policies
CREATE POLICY "Users can view their feed inventory" ON public.feed_inventory FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can manage feed inventory" ON public.feed_inventory FOR ALL USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all feed inventory" ON public.feed_inventory FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Feed Consumptions Policies
CREATE POLICY "Users can view their feed consumptions" ON public.feed_consumptions FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can manage feed consumptions" ON public.feed_consumptions FOR ALL USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all feed consumptions" ON public.feed_consumptions FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Veterinary Records Policies
CREATE POLICY "Users can view their vet records" ON public.veterinary_records FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can manage vet records" ON public.veterinary_records FOR ALL USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all vet records" ON public.veterinary_records FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Livestock Sales Policies
CREATE POLICY "Users can view their sales" ON public.livestock_sales FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can manage sales" ON public.livestock_sales FOR ALL USING (
    EXISTS(SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can view all sales" ON public.livestock_sales FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
