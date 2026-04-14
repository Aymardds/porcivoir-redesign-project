-- Migration: Add invoice tracking to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP WITH TIME ZONE;
