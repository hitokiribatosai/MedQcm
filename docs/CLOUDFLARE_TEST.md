# Parallel Cloudflare test deployment

Status (2026-09-18): deployed from `cloudflare-preview`, source commit `8979e87`, Worker version `0b6b708e-9331-4faa-9f01-52cdc2740e78`. Live preview: https://medqcm-preview.medqcm.workers.dev/fr . Vercel remains live at https://qcmmed.vercel.app . OpenNext 1.20.6 / Wrangler 4.135.0 build succeeded with Next.js 16.3.5. All three auth/API protection tests passed on both live hosts and on the local Workers runtime. Approximately 1.82 MiB compressed Worker bundle. Node.js proxy support is experimental in this adapter, so signed-in acceptance remains essential.

The Cloudflare French landing page was visibly verified in the browser. Public FR/EN landing and login routes returned 200; signed-out exams redirected (307), subscriptions API rejected unsigned access (401). No owner-led Cloudflare login, quiz recovery, admin acceptance or email callback test has been completed yet. Deployment is manual; pushing the branch alone does not redeploy Cloudflare.

## Initial comparison

Three sequential response-header measurements per route from this workstation, median milliseconds:

| Route | Vercel | Cloudflare |
| --- | ---: | ---: |
| /fr | 351 | 174 |
| /en | 253 | 180 |
| /fr/login | 238 | 308 |
| /fr/exams (signed out) | 193 | 188 |
| /api/subscriptions (signed out) | 256 | 313 |

Results are mixed and the sample is small. This does not establish a winner, capacity, or student experience in Algeria. Compare authenticated requests and repeat from representative networks before selecting a host. Asset upload required two network retries, then the Worker deployed successfully. Keep both deployments for testing.

Vercel remains the established deployment. Cloudflare uses a separate Worker named `medqcm-preview`. Both use the existing Supabase project; account/quiz changes on either host affect the same database. No new database migration is needed. Use only owner-controlled test identities. Keep collection closed.

## Commands

- `npm run cf:build`: builds Next.js with webpack and adapts output for Workers.
- `npm run cf:preview`: runs the built app in the Workers runtime.
- `npm run cf:deploy`: deploys the previously built artifact after Cloudflare authorization.

Only the existing public Supabase URL and publishable/anon key are needed; these public client values are configured in Wrangler vars. Never add a service-role key or SMTP password. Build artifacts, `.dev.vars` and Wrangler local credentials must stay out of Git. Keep normal Vercel build behavior unchanged.

## Before live auth testing

Add exact Cloudflare `/auth/callback` redirect destinations to Supabase, matching the French/English and recovery destinations already allowed for Vercel. Preserve Vercel URLs and the current Supabase Site URL until a final host is chosen. Read app callback validation and AUTH_SETUP before editing the allowlist.

## Acceptance and comparison

1. Run `TEST_APP_URL=<origin> node --test tests/auth-routes.test.mjs` against both hosts.
2. Owner signs in separately on the Cloudflare hostname; browser sessions are not shared between domains. Confirm protected/admin routes and logout.
3. Save a sample draft, refresh, recover identical selections/index/order and finish. Verify the same result/history from Vercel.
4. Complete a timed sample through expiry and background-tab return; check hidden running keys and one completed result.
5. Verify subscription collection stays closed and the real admin queue loads. Receipt acceptance remains a separate controlled test.
6. Test email callback/recovery with owner-entered credentials after adding exact allowlisted URLs.
7. Run `node scripts/compare-hosts.mjs <vercel-origin> <cloudflare-origin>` from the same network. This measures response-header latency for public routes with three sequential samples; it is not a load test or proof of performance for Algerian students. Repeat from representative networks and inspect errors and authenticated quiz save timings.
8. Compare actual runtime/request usage, deployment reliability, rollback and monthly cost before choosing. Do not automatically switch DNS or remove either deployment.
