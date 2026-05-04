import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function createServerSupabaseClient(): SupabaseClient {
  if (serverClient) return serverClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  serverClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}

export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required',
    );
  }
  browserClient = createClient(url, key);
  return browserClient;
}
