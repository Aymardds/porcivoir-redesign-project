-- ============================================================
-- Migration: order_notification_subscribers
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_notification_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  label       text NOT NULL DEFAULT '',
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_notification_subscribers ENABLE ROW LEVEL SECURITY;

-- Lecture : admin + commercial
CREATE POLICY "allow_read_subscribers"
  ON public.order_notification_subscribers
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'commercial')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'commercial')
  );

-- Insertion : admin + commercial
CREATE POLICY "allow_insert_subscribers"
  ON public.order_notification_subscribers
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'commercial')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'commercial')
  );

-- Mise à jour : admin + commercial
CREATE POLICY "allow_update_subscribers"
  ON public.order_notification_subscribers
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'commercial')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'commercial')
  );

-- Suppression : admin uniquement
CREATE POLICY "allow_delete_subscribers"
  ON public.order_notification_subscribers
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_order_notif_active ON public.order_notification_subscribers(active);
CREATE INDEX IF NOT EXISTS idx_order_notif_email  ON public.order_notification_subscribers(email);

-- ============================================================
-- Service Role Policy (pour la Edge Function send-order-email)
-- La fonction appelle Supabase avec la clé service_role,
-- donc elle contourne le RLS automatiquement.
--
-- Template email suggéré pour type 'new_order_team' dans
-- la Edge Function send-order-email :
--
-- Objet: 🛒 Nouvelle commande #{{order.id}} — {{order.client_name}}
-- Corps:
--   Une nouvelle commande vient d'être passée sur la boutique.
--   Client    : {{order.client_name}} ({{order.client_email}})
--   Téléphone : {{order.phone_contact}}
--   Adresse   : {{order.shipping_address}}, {{order.shipping_city}}
--   Total     : {{order.total_amount}} FCFA
--   Articles  : {{order.items}}
--   Méthode   : {{order.payment_method}}
-- ============================================================
