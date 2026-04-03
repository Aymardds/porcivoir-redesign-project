-- ============================================================
-- Script de Migration: Promotions Complètes
-- À EXÉCUTER dans l'éditeur SQL Supabase
-- ============================================================

-- 1. Ajouter la colonne is_featured si elle n'existe pas encore
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. Créer la table de liaison Promotion <-> Produits
CREATE TABLE IF NOT EXISTS public.promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promotion_id, product_id)
);

-- 3. RLS pour promotion_products
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read promotion_products" ON public.promotion_products
FOR SELECT USING (true);

CREATE POLICY "Admins can manage promotion_products" ON public.promotion_products
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin')
);

-- 4. Mettre à jour la politique de lecture des promotions
-- (Permettre la lecture de TOUTES les promo actives pour l'affichage admin)
DROP POLICY IF EXISTS "Public can check promotions" ON public.promotions;
CREATE POLICY "Public can read active promotions" ON public.promotions
FOR SELECT USING (is_active = true);

-- 5. Exemple: Créer une promo à la une avec compte à rebours
-- Remplacez les valeurs selon vos besoins
INSERT INTO public.promotions (
  code, 
  description, 
  discount_percent, 
  valid_from,
  valid_until, 
  is_active,
  is_featured
) VALUES (
  'FETEPORC25',
  '🥩 Offre Spéciale — Fête du Porc ! Profitez vite !',
  25,
  now(),
  now() + INTERVAL '7 days',
  true,
  true
) ON CONFLICT (code) DO UPDATE SET is_featured = true, valid_until = now() + INTERVAL '7 days';
