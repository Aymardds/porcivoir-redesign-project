import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Supabase Anon Key is missing. Supabase integration might not work.');
}

// Public client — used for reads (products, categories, etc.)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Admin client — bypasses RLS for trusted server-side operations like order creation.
// NOTE: Never expose this key to end users or in public-facing code beyond order writes.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: 'sb-admin-auth',
    },
  }
);
