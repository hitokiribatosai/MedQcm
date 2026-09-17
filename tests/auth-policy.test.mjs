import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdmin, authDestination, routeMatches, localeFromPath } from '../lib/auth/policy.ts';

test('only trusted app metadata grants admin access', () => {
  assert.equal(isAdmin(null), false);
  assert.equal(isAdmin({ app_metadata: {} }), false);
  const spoofed = { email: 'admin@example.com', user_metadata: { role: 'admin' }, app_metadata: { role: 'student' } };
  assert.equal(isAdmin(spoofed), false);
  assert.equal(isAdmin({ app_metadata: { role: 'admin' } }), true);
});
test('callback rejects external, encoded and unexpected redirect destinations', () => {
  for (const next of ['https://evil.test', '//evil.test', '/\\evil.test', '/fr/admin', '/fr/dashboard?next=evil', '/%2f%2fevil.test', null]) {
    assert.equal(authDestination(next, 'fr'), '/fr/dashboard');
  }
  assert.equal(authDestination('/en/reset-password', 'en'), '/en/reset-password');
});
test('protected routes match complete path segments', () => {
  assert.equal(routeMatches('/admin/questions', '/admin'), true);
  assert.equal(routeMatches('/admin', '/admin'), true);
  assert.equal(routeMatches('/administrator', '/admin'), false);
  assert.equal(localeFromPath('/en/profile'), 'en');
  assert.equal(localeFromPath('/english'), 'fr');
});
