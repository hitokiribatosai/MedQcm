export async function logout(locale: string) {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error('Déconnexion impossible. Réessayez.');
  // Discard private client/router state on logout.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/${locale}/login`);
}
