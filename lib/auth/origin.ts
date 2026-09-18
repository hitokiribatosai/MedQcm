// Next.js can normalize request.url to localhost in a local server. The Host
// header still names the browser's destination; browsers cannot override it.
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  try {
    const url = new URL(request.url);
    const expected = `${url.protocol}//${request.headers.get('host') || url.host}`;
    return new URL(origin).origin === expected && origin === new URL(origin).origin;
  } catch {
    return false;
  }
}
