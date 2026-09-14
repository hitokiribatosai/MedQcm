import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL('/fr/login', url.origin));
  
  response.cookies.set('demo_session', '', { path: '/', maxAge: 0 });
  response.cookies.set('demo_role', '', { path: '/', maxAge: 0 });
  response.cookies.set('user_role', '', { path: '/', maxAge: 0 });

  return response;
}
