import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authDestination } from '@/lib/auth/policy';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'fr';
  const code = url.searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(authDestination(url.searchParams.get('next'), locale), url.origin), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }
  }
  return NextResponse.redirect(new URL(`/${locale}/login?error=auth_callback`, url.origin));
}
