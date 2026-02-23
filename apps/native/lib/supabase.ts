import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Start simple. We'll add secure persistent storage after basic flows are ported.
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
