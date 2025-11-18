import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    console.warn('Supabase URL/Key が設定されていないため、モック用のクライアントを使用します。');
  }

  return createClient(url ?? 'http://localhost', serviceKey ?? 'public-anon-key', {
    auth: {
      persistSession: false,
    },
  });
}
