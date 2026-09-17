import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdmin, localeFromPath, routeMatches } from './lib/auth/policy';

const intlMiddleware = createMiddleware(routing);
const protectedRoutes = ['/dashboard', '/admin', '/quiz', '/exams', '/stats', '/profile', '/subscribe', '/years', '/depot', '/reset-password'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = localeFromPath(pathname);
  const path = pathname.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';
  let response = intlMiddleware(request);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = intlMiddleware(request);
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  function redirect(path: string) {
    const result = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach(cookie => result.cookies.set(cookie));
    result.headers.set('Cache-Control', 'private, no-store');
    return result;
  }
  if (protectedRoutes.some(route => routeMatches(path, route)) && !user) return redirect(`/${locale}/login`);
  if (routeMatches(path, '/admin') && !isAdmin(user)) return redirect(`/${locale}/dashboard?error=unauthorized`);
  if (authRoutes.includes(path) && user) return redirect(`/${locale}/dashboard`);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/((?!api|auth/|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
};
