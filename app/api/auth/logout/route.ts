import { isSameOrigin } from '@/lib/auth/origin';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) return NextResponse.json({ error: 'Déconnexion impossible. Réessayez.' }, { status: 500 });
  const response = NextResponse.json({ success: true });
  for (const name of ['demo_session', 'demo_role', 'user_role']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
