-- ============================================================
-- FIX SCRIPT: Permissions for stock_manager and other roles
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- 1. Ensure the user_role enum has 'stock_manager' (Uncomment if needed, but usually it exists)
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'stock_manager';

-- 2. Update Orders Policies
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and Stock Managers can manage orders" ON public.orders;
CREATE POLICY "Admins and Stock Managers can manage orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
);

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins and Stock Managers can manage order items" ON public.order_items;
CREATE POLICY "Admins and Stock Managers can manage order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
);

-- 3. Update Products Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins and Stock Managers can manage products" ON public.products;
CREATE POLICY "Admins and Stock Managers can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
);

-- 4. Update Categories Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins and Stock Managers can manage categories" ON public.categories;
CREATE POLICY "Admins and Stock Managers can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
);
