import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/dashboard', '/admin', '/quiz', '/exams', '/stats', '/profile', '/subscribe'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to check route type
  const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';

  const isProtected = protectedRoutes.some(r => pathnameWithoutLocale.startsWith(r));
  const isAdminRoute = adminRoutes.some(r => pathnameWithoutLocale.startsWith(r));
  const isAuthRoute = authRoutes.some(r => pathnameWithoutLocale.startsWith(r));

  // Run intl middleware first to handle locale routing
  const response = intlMiddleware(request);

  // Set up Supabase server client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch {
    user = null;
  }

  const isDemoSession = request.cookies.get('demo_session')?.value === 'true';
  const demoRole = request.cookies.get('demo_role')?.value || 'student';
  const userRole = user?.app_metadata?.role || (isDemoSession ? demoRole : 'student');
  const isAuthenticated = !!user || isDemoSession;

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const locale = pathname.startsWith('/en') ? 'en' : 'fr';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Enforce admin-only access for admin routes
  if (isAdminRoute && userRole !== 'admin') {
    const locale = pathname.startsWith('/en') ? 'en' : 'fr';
    return NextResponse.redirect(new URL(`/${locale}/dashboard?error=unauthorized`, request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    const locale = pathname.startsWith('/en') ? 'en' : 'fr';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
};
