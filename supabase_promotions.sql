-- Table des Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percent DECIMAL(5,2), -- Ex: 15.00 pour 15%
  discount_amount DECIMAL(10,2), -- Ex: 5000.00 pour 5000 FCFA
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER, -- Limite globale (Optionnel)
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour le panier
DROP POLICY IF EXISTS "Public can check promotions" ON public.promotions;
CREATE POLICY "Public can check promotions" ON public.promotions
FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Gestion Admin
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
CREATE POLICY "Admins can manage promotions" ON public.promotions
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- Trigger Update At
DROP TRIGGER IF EXISTS update_promotions_updated_at ON public.promotions;
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Données initiales (EXEMPLES)
INSERT INTO public.promotions (code, description, discount_percent, valid_until) VALUES
('BIENVENUE10', 'Remise de bienvenue pour les nouveaux clients', 10, '2026-12-31 23:59:59+00')
ON CONFLICT DO NOTHING;
