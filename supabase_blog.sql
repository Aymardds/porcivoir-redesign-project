-- ============================================================
-- MIGRATION: Création de la table 'blogs' et configuration
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Active le Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 1. Politique : Tout le monde (public) peut lire les articles publiés
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" ON public.blogs
FOR SELECT
USING (is_published = true);

-- 2. Politique : Les administrateurs peuvent lire tous les articles (publiés ou non)
DROP POLICY IF EXISTS "Admins can view all blogs" ON public.blogs;
CREATE POLICY "Admins can view all blogs" ON public.blogs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'seo')
  )
);

-- 3. Politique : Les administrateurs peuvent insérer des articles
DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
CREATE POLICY "Admins can insert blogs" ON public.blogs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- 4. Politique : Les administrateurs peuvent modifier des articles
DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
CREATE POLICY "Admins can update blogs" ON public.blogs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- 5. Politique : Les administrateurs peuvent supprimer des articles
DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;
CREATE POLICY "Admins can delete blogs" ON public.blogs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);
