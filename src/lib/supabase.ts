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

// Session Cleanup Logic: Immediately check for stale tokens that cause 400 errors.
(async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error && (error.message.includes('400') || error.message.includes('refresh_token_not_found'))) {
      console.warn('Stale session detected, clearing storage...');
      // Clear all possible Supabase keys from localStorage to break the loop
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase.auth.token') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Optionally reload to start fresh
      window.location.reload();
    }
  } catch (e) {
    // Ignore initialization errors here; let the app handle auth state
  }
})();

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
