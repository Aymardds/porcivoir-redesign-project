-- ============================================================
-- MIGRATION: Fix order_items table for guest checkout
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Drop the old order_items table (if it exists) and recreate cleanly
DROP TABLE IF EXISTS order_items CASCADE;

-- 2. Recreate order_items with columns matching the frontend
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name  TEXT NOT NULL,
  product_slug  TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10, 2) NOT NULL,
  total_price   NUMERIC(10, 2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable RLS on order_items (admin client bypasses it anyway, but belt-and-suspenders)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (used via service role key, but good to have)
CREATE POLICY "Allow insert order_items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Allow public reads for order lookup
CREATE POLICY "Allow read order_items" ON order_items
  FOR SELECT USING (true);


-- ============================================================
-- BONUS: Also ensure orders table has RLS policies
-- (the service role key bypasses these, but good practice)
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow insert orders'
  ) THEN
    CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow read orders'
  ) THEN
    CREATE POLICY "Allow read orders" ON orders FOR SELECT USING (true);
  END IF;
END $$;
