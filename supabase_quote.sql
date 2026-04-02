-- ============================================================
-- MIGRATION: Quote Agri Hub Tables (Version Sécurisée)
-- ============================================================

-- 1. Création des tables (Si elles n'existent pas)
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  fixed_rate DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'FCFA' CHECK (currency IN ('EUR', 'USD', 'FCFA')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Note: On utilise 'fixed_fee' au lieu de 'fixed_rate' pour stocker le montant monétaire fixe du devis.

-- 2. Activation de la RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS (Basées sur le texte de 'role' pour éviter les erreurs d'Enum)
-- Note: 'profiles.role' est casté en ::text pour compatibilité avec l'enum existant

-- Service Categories
DROP POLICY IF EXISTS "Service categories are viewable by everyone" ON public.service_categories;
CREATE POLICY "Service categories are viewable by everyone" ON public.service_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can modify service categories" ON public.service_categories;
CREATE POLICY "Only admins can modify service categories" ON public.service_categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- Services
DROP POLICY IF EXISTS "Active services are viewable by everyone" ON public.services;
CREATE POLICY "Active services are viewable by everyone" ON public.services FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));
DROP POLICY IF EXISTS "Only admins can modify services" ON public.services;
CREATE POLICY "Only admins can modify services" ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- Quote Requests
DROP POLICY IF EXISTS "Everyone can create quote requests" ON public.quote_requests;
CREATE POLICY "Everyone can create quote requests" ON public.quote_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view all quote requests" ON public.quote_requests;
CREATE POLICY "Admins can view all quote requests" ON public.quote_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));
DROP POLICY IF EXISTS "Admins can modify quote requests" ON public.quote_requests;
CREATE POLICY "Admins can modify quote requests" ON public.quote_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- Quote Items
DROP POLICY IF EXISTS "Everyone can create quote items" ON public.quote_items;
CREATE POLICY "Everyone can create quote items" ON public.quote_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view all quote items" ON public.quote_items;
CREATE POLICY "Admins can view all quote items" ON public.quote_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- App Settings
DROP POLICY IF EXISTS "Everyone can read app settings" ON public.app_settings;
CREATE POLICY "Everyone can read app settings" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
CREATE POLICY "Admins can manage app settings" ON public.app_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role::text = 'admin'));

-- 4. Fonctions de mise à jour automatique des dates
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_service_categories_updated_at ON public.service_categories;
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Données par défaut
INSERT INTO public.service_categories (name, description, icon) VALUES
('Ferme porcine', 'Services de planification et gestion pour élevage porcin', '🐷'),
('Volaille', 'Solutions pour élevage de volailles et aviculture', '🐔'),
('Production végétale', 'Services de conseil en agriculture et production végétale', '🌱'),
('Plans d''affaires agricoles', 'Élaboration de business plans et études de faisabilité', '📊')
ON CONFLICT DO NOTHING;

INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES
('fixed_rate_percentage', '15', 'Taux fixe en pourcentage (obsolète)'),
('quote_fixed_fee', '5000', 'Montant fixe forfaitaire pour chaque demande de devis (FCFA)'),
('company_name', 'Porc''Ivoire Agri', 'Nom de l''entreprise'),
('company_email', 'contact@porcivoire.ci', 'Email de contact de l''entreprise'),
('company_phone', '+225 07 00 00 00 00', 'Téléphone de contact')
ON CONFLICT (setting_key) DO NOTHING;
