-- Activer l'extension pour les UUID si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CREATION DES TABLES
-- ==========================================

-- Table des Modèles de Devis Modulaires
CREATE TABLE IF NOT EXISTS public.quote_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    fee_amount INTEGER NOT NULL DEFAULT 25999, -- Frais de dossier en FCFA
    imprevus_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table des Lignes de Travaux (Lots) rattachées à un Modèle
CREATE TABLE IF NOT EXISTS public.quote_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.quote_templates(id) ON DELETE CASCADE,
    lot_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'm²',
    unit_price INTEGER NOT NULL, -- Prix unitaire en FCFA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table des Devis Instantanés générés par les clients
CREATE TABLE IF NOT EXISTS public.instant_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Si connecté
    client_email VARCHAR(255),
    client_name VARCHAR(255),
    template_id UUID REFERENCES public.quote_templates(id) ON DELETE SET NULL,
    input_quantity INTEGER NOT NULL, -- La superficie totale saisie (ex: 100)
    total_ht INTEGER NOT NULL,
    imprevus_amount INTEGER NOT NULL,
    total_ttc INTEGER NOT NULL,
    fee_amount INTEGER NOT NULL, -- Historique du prix payé pour générer
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, failed
    transaction_id VARCHAR(255),
    snapshot JSONB NOT NULL, -- Archive figée de TOUTES les lignes pour le PDF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- ==========================================
-- 2. SECURITE RLS (Row Level Security)
-- ==========================================

ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_quotes ENABLE ROW LEVEL SECURITY;

-- Les modèles sont lisibles par tous (public), modifiables par admin
CREATE POLICY "Public can read active templates" ON public.quote_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON public.quote_templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'stock_manager')
    )
);

-- Les items de modèles sont lisibles par tous, modifiables par admin
CREATE POLICY "Public can read template items" ON public.quote_template_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage template items" ON public.quote_template_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'stock_manager')
    )
);

-- Les devis instantanés : un client voit les siens, l'admin voit tout
CREATE POLICY "Users can create their instant quotes" ON public.instant_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own instant quotes" ON public.instant_quotes FOR SELECT USING (
    user_id = auth.uid() OR client_email = current_setting('request.jwt.claims', true)::json->>'email'
);
CREATE POLICY "Admins can read all instant quotes" ON public.instant_quotes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'stock_manager')
    )
);
CREATE POLICY "Public can read their quote via ID" ON public.instant_quotes FOR SELECT USING (true); -- Utile si accès direct via lien partagé


-- ==========================================
-- 3. INSERTION DU MODELE "INFRASTRUCTURES"
-- ==========================================

DO $$
DECLARE
    infrastructure_template_id UUID := 'bbbbbbbb-8888-4444-aaaa-111111111111';
BEGIN
    -- 1. Créer le template "Infrastructures et Équipements"
    INSERT INTO public.quote_templates (id, name, fee_amount, imprevus_percentage)
    VALUES (infrastructure_template_id, 'Infrastructures et Équipements', 25999, 5.0)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        fee_amount = EXCLUDED.fee_amount;

    -- 2. Vider les anciens items s'ils existent pour ce template (pour éviter les doublons en cas de run multiple)
    DELETE FROM public.quote_template_items WHERE template_id = infrastructure_template_id;

    -- 3. Insérer les Lots de Travaux fournis
    INSERT INTO public.quote_template_items (template_id, lot_name, description, unit, unit_price)
    VALUES
        (infrastructure_template_id, 'Gros Œuvre (surface)', 'Terrassement, fondations, murs en parpaings (hauteur 1,20m + grillage), dallage béton lissé.', 'm²', 25000),
        (infrastructure_template_id, 'Charpente / Couverture', 'Charpente bois traitée ou métallique, tôles bac alu.', 'm²', 12000),
        (infrastructure_template_id, 'Aménagements Intérieurs', 'Séparations des loges, couloir de service, logettes maternité.', 'm²', 1500),
        (infrastructure_template_id, 'Plomberie & Abreuvement', 'Pipettes automatiques inox, bacs réserve eau, tuyauterie PVC.', 'm²', 3500),
        (infrastructure_template_id, 'Assainissement', 'Caniveaux evacuation, fosse a lisier, puisard.', 'm²', 8500),
        (infrastructure_template_id, 'Équipements de Biosécurité', 'Pediluves entree, cloture perimetrale, point de lavage.', 'm²', 4000);

END $$;
