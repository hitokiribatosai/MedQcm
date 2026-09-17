export function isAdmin(user: { app_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === 'admin';
}

export function localeFromPath(path: string) {
  return /^\/en(?:\/|$)/.test(path) ? 'en' : 'fr';
}

export function routeMatches(path: string, route: string) {
  return path === route || path.startsWith(`${route}/`);
}

// Explicit destinations prevent open redirects, including encoded URL variants.
export function authDestination(next: string | null, locale: string) {
  const allowed = [`/${locale}/dashboard`, `/${locale}/profile`, `/${locale}/reset-password`];
  return next && allowed.includes(next) ? next : `/${locale}/dashboard`;
}
