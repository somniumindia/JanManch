import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';
export const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('PASTE_YOUR_SUPABASE_URL_HERE')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
};
