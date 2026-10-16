-- ============================================================
-- Migration: add roles[] array to profiles
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Ajouter la colonne roles (tableau de texte)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT '{}';

-- 2. Initialiser roles[] depuis le role existant pour tous les profils
UPDATE public.profiles
  SET roles = ARRAY[role]
  WHERE roles = '{}' OR roles IS NULL;

-- 3. Trigger pour maintenir la synchronisation roles[] <-> role (primary)
--    Quand roles[] est mis à jour, role = premier élément (admin prioritaire)
CREATE OR REPLACE FUNCTION sync_primary_role()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Si roles[] contient 'admin', le rôle primaire est toujours admin
  IF 'admin' = ANY(NEW.roles) THEN
    NEW.role := 'admin';
  ELSIF array_length(NEW.roles, 1) > 0 THEN
    NEW.role := NEW.roles[1];
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_primary_role ON public.profiles;
CREATE TRIGGER trg_sync_primary_role
  BEFORE INSERT OR UPDATE OF roles ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_primary_role();

-- 4. Index GIN pour requêtes performantes sur le tableau
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN(roles);

-- 5. Activer la réplication Realtime pour synchronisation instantanée des rôles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Cas où la publication n'existe pas encore dans ce projet
    NULL;
END $$;

-- 6. Politiques RLS pour gestion des profils par l'équipe
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lecture : chacun son profil + admin/commercial peuvent lire tous les profils
DROP POLICY IF EXISTS "allow_read_profiles" ON public.profiles;
CREATE POLICY "allow_read_profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR auth.jwt() ->> 'role' IN ('admin', 'commercial')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'commercial')
    OR 'admin' = ANY(roles)
  );

-- Mise à jour : admin uniquement pour modifier les rôles
DROP POLICY IF EXISTS "allow_update_roles" ON public.profiles;
CREATE POLICY "allow_update_roles"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- 7. Vérification finale
SELECT id, email, role, roles FROM public.profiles LIMIT 5;

