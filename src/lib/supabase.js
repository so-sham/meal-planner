import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let _supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    _supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('NourishPlan: Failed to initialize Supabase client:', err);
  }
} else {
  console.warn(
    'NourishPlan: Supabase credentials missing. Auth and cloud sync disabled.'
  );
}

export const supabase = _supabase;
