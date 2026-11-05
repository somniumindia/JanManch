import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.exchangeCodeForSession(code);
      } catch (err) {
        console.error('Error exchanging code for session in /auth/callback:', err);
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
