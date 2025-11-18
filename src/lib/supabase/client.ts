import { createClient } from '@supabase/supabase-js';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Supabase URL / Key が設定されていません。ブラウザクライアントはモックモードになります。');
  }

  return createClient(url ?? 'http://localhost', anonKey ?? 'public-anon-key');
}
