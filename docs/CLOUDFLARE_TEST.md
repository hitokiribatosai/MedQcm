# Parallel Cloudflare test deployment

Status (2026-09-19): deployed from `cloudflare-preview` as Worker `app`, version `a46ab195-ca5b-4506-b18d-73f0c6a676bf`. Current Cloudflare address: https://app.medqcm.workers.dev/fr . The older `medqcm-preview` Worker remains available temporarily for rollback. Vercel remains live at https://qcmmed.vercel.app . OpenNext 1.20.6 / Wrangler 4.135.0 build succeeded with Next.js 16.3.5. All three auth/API protection tests passed on both live hosts and on the local Workers runtime. Approximately 1.82 MiB compressed Worker bundle. Node.js proxy support is experimental in this adapter, so signed-in acceptance remains essential.

The Cloudflare French landing page was visibly verified in the browser. Public FR/EN landing and login routes returned 200; signed-out exams redirected (307), subscriptions API rejected unsigned access (401), and all three live access-protection tests passed. Exact French/English signup and recovery callback URLs for `app.medqcm.workers.dev` are allowlisted in Supabase while every Vercel URL and the Vercel Site URL remain preserved. Deployment is manual; pushing the branch alone does not redeploy Cloudflare.

Signed-in browser acceptance also passed: a new student account registered and logged in; an existing registered address now visibly returns `Email already registered`; practice attempt `77ad30b6-6935-4084-8fe3-309e3a456077` saved, survived refresh with the same answer and attempt, completed at 1/3 (6.7/20), and appeared in account history/statistics. A student was redirected away from `/fr/admin`. The authorized admin opened the Cloudflare admin area and the real pending-payment queue returned zero requests. Collection remained closed, so no receipt was uploaded or reviewed. The reset request UI returned `Email envoyé !`, but the owner has not yet completed a real reset-link/password/login exchange on Cloudflare.

On 2026-09-22, timed sample `3a593946-76db-4370-b31f-7b435626b4e3` saved one selected answer, recovered it after refresh without resetting the deadline, and automatically finalized at 90 seconds. The result showed 1/1 (20/20), one 90-second session, and account persistence. This controlled attempt remains in the admin account.

Acceptance uncovered and removed simulated dashboard totals, fabricated pending receipts, placeholder PDFs, and the profile's fictional Pass Pro/streak/gems. The live admin overview now reads the real pending queue, and both document views truthfully report no published PDFs. Admin question management, reports, PDF persistence and AI extraction remain prototypes.

## Initial comparison

Three sequential response-header measurements per route from this workstation, median milliseconds:

| Route | Vercel | Cloudflare |
| --- | ---: | ---: |
| /fr | 343 | 86 |
| /en | 231 | 77 |
| /fr/login | 245 | 81 |
| /fr/exams (signed out) | 112 | 51 |
| /api/subscriptions (signed out) | 193 | 51 |

Results are mixed and the sample is small. This does not establish a winner, capacity, or student experience in Algeria. Compare authenticated requests and repeat from representative networks before selecting a host. Asset upload required two network retries, then the Worker deployed successfully. Keep both deployments for testing.

Vercel remains the established deployment. Cloudflare uses a separate Worker named `app`; `medqcm-preview` is retained only for rollback during acceptance. Both use the existing Supabase project; account/quiz changes on either host affect the same database. No new database migration is needed. Use only owner-controlled test identities. Keep collection closed.

## Commands

- `npm run cf:build`: builds Next.js with webpack and adapts output for Workers.
- `npm run cf:preview`: runs the built app in the Workers runtime.
- `npm run cf:deploy`: deploys the previously built artifact after Cloudflare authorization.

Only the existing public Supabase URL and publishable/anon key are needed; these public client values are configured in Wrangler vars. Never add a service-role key or SMTP password. Build artifacts, `.dev.vars` and Wrangler local credentials must stay out of Git. Keep normal Vercel build behavior unchanged.

## Acceptance and comparison

1. Run `TEST_APP_URL=<origin> node --test tests/auth-routes.test.mjs` against both hosts.
2. Owner sign-in, protected student/admin routing and student logout have passed on Cloudflare. Repeat after material auth changes.
3. Practice draft save, refresh recovery, completion and history/statistics have passed on Cloudflare. Cross-host display from Vercel and conflicting-tab/offline scenarios remain.
4. Timed sample save, refresh, expiry and one completed result passed on Cloudflare. A separate background-tab return and running-key inspection remain.
5. Subscription collection stayed closed and the real admin queue loaded with zero requests. Receipt acceptance remains a separate controlled test.
6. Signup/login passed and the callbacks are allowlisted. Complete a real recovery link, owner-entered password and subsequent login before declaring recovery accepted.
7. Run `node scripts/compare-hosts.mjs <vercel-origin> <cloudflare-origin>` from the same network. This measures response-header latency for public routes with three sequential samples; it is not a load test or proof of performance for Algerian students. Repeat from representative networks and inspect errors and authenticated quiz save timings.
8. Compare actual runtime/request usage, deployment reliability, rollback and monthly cost before choosing. Do not automatically switch DNS or remove either deployment.
