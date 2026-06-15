-- ============================================================
-- FIX SCRIPT: Signup 500 + Promotions
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- ---------------------------------------------------------------
-- PART 1: Fix signup 500 error
-- The handle_new_user trigger must be SECURITY DEFINER and
-- the profiles table must allow the trigger to INSERT.
-- We also ensure the `email` column exists.
-- ---------------------------------------------------------------

-- 1a. Ensure email column exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 1b. Drop the existing broken policies that block trigger inserts
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- 1c. Allow the trigger (SECURITY DEFINER) to insert new profiles.
--     We use a permissive policy so the trigger's INSERT can succeed.
--     Triggers with SECURITY DEFINER bypass RLS, but having an explicit
--     service-level INSERT policy prevents edge-case failures.
DROP POLICY IF EXISTS "Service can insert profiles" ON public.profiles;
CREATE POLICY "Service can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 1d. Recreate the handle_new_user trigger function (up-to-date version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1e. Make sure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------
-- PART 2: Fix promotions — ensure schema and seed data exist
-- ---------------------------------------------------------------

-- 2a. Ensure is_featured column exists
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2b. Ensure description column exists (some versions of schema omit it)
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS description TEXT;

-- 2c. Update RLS: allow public reads of all active promotions
DROP POLICY IF EXISTS "Public can check promotions" ON public.promotions;
DROP POLICY IF EXISTS "Public can read active promotions" ON public.promotions;
CREATE POLICY "Public can read active promotions" ON public.promotions
  FOR SELECT USING (is_active = true);

-- 2d. Seed sample promotions so the homepage sections render
INSERT INTO public.promotions (code, description, discount_percent, valid_from, valid_until, is_active, is_featured)
VALUES
  ('BIENVENUE10', 'Remise de bienvenue pour les nouveaux clients', 10, now(), now() + INTERVAL '90 days', true, false),
  ('FETEPORC25', '🥩 Offre Spéciale — Fête du Porc ! Profitez vite !', 25, now(), now() + INTERVAL '7 days', true, true),
  ('ETE15', '☀️ Promo Été — 15% sur toute la boutique', 15, now(), now() + INTERVAL '30 days', true, false)
ON CONFLICT (code) DO UPDATE
  SET is_active = true,
      valid_until = EXCLUDED.valid_until,
      is_featured = EXCLUDED.is_featured,
      description = EXCLUDED.description;

-- ---------------------------------------------------------------
-- PART 3: Ensure promotion_products table exists with correct RLS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promotion_id, product_id)
);

ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read promotion_products" ON public.promotion_products;
CREATE POLICY "Public can read promotion_products" ON public.promotion_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage promotion_products" ON public.promotion_products;
CREATE POLICY "Admins can manage promotion_products" ON public.promotion_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin')
  );
