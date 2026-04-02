-- Table de liaison entre Promotions et Produits
CREATE TABLE IF NOT EXISTS public.promotion_products (
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, product_id)
);

-- RLS
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour le calcul des prix dans le panier
DROP POLICY IF EXISTS "Anyone can view promotion products" ON public.promotion_products;
CREATE POLICY "Anyone can view promotion products" ON public.promotion_products FOR SELECT USING (true);

-- Gestion Admin
DROP POLICY IF EXISTS "Admins can manage promotion products" ON public.promotion_products;
CREATE POLICY "Admins can manage promotion products" ON public.promotion_products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_promotion_products_promo ON public.promotion_products(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_product ON public.promotion_products(product_id);
