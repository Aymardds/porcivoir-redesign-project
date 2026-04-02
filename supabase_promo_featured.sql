-- Migration pour le compte à rebours dynamique
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Un seul code peut être mis "à la une" à la fois pour faciliter l'affichage principal
-- (Ceci est une contrainte optionnelle, mais pratique pour le Countdown principal)
-- CREATE UNIQUE INDEX idx_featured_promotion ON public.promotions (is_featured) WHERE (is_featured = true);
