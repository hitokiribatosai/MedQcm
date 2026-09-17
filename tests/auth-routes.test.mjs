import { test } from 'node:test';
import assert from 'node:assert/strict';
const origin = process.env.TEST_APP_URL;

test('production routes reject forged demo access and unsafe auth requests', { skip: !origin }, async () => {
  for (const path of ['/fr/admin', '/fr/admin/questions', '/fr/profile', '/fr/years', '/fr/depot', '/en/dashboard', '/fr/reset-password']) {
    const res = await fetch(origin + path, { redirect: 'manual', headers: { cookie: 'demo_session=true; demo_role=admin; user_role=admin' } });
    assert.equal(res.status, 307, path);
    assert.equal(new URL(res.headers.get('location'), origin).pathname, path.startsWith('/en/') ? '/en/login' : '/fr/login', path);
  }
  assert.equal((await fetch(origin + '/api/auth/logout')).status, 405);
  assert.equal((await fetch(origin + '/api/auth/logout', { method: 'POST', headers: { origin: 'https://evil.test' } })).status, 403);
  const callback = await fetch(origin + '/auth/callback?next=https://evil.test', { redirect: 'manual' });
  assert.equal(new URL(callback.headers.get('location'), origin).pathname, '/fr/login');
  const login = await fetch(origin + '/fr/login?error=auth_callback');
  assert.equal(login.status, 200);
  const html = await login.text();
  assert.ok(html.includes('Lien invalide'));
  assert.ok(!html.includes('Admin (test)'));
});
