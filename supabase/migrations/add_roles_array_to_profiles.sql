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

-- 4. Index GIN pour requêtes sur le tableau
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN(roles);

-- 5. Vérification
SELECT id, email, role, roles FROM public.profiles LIMIT 5;
