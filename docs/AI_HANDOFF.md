# MedQCM continuation guide

Updated 2026-09-18. Read AGENTS.md and installed Next.js docs before editing. Never expose credentials or force-push.

## Release status — read first

Recovery/payment implementation `b8582f7` and rollout documentation `4c97c25` were pushed to main. GitHub’s Vercel status for `4c97c25` reports “Deployment has completed”; the new pages are serving in production. Both new migrations were applied successfully in Supabase SQL Editor with owner approval on 2026-09-18. Do not rerun these migrations. Full owner-led account and controlled receipt acceptance remain pending.

- Repository: https://github.com/hitokiribatosai/MedQcm
- Website: https://qcmmed.vercel.app (`/fr`, `/en`).
- Supabase: `ieancvwcctvnvgbimfhs`.
- Authorized administrator: `admineqcmed@gmail.com`, trusted `app_metadata.role=admin`.
- SMTP delivery was confirmed previously. Owner enters all new passwords and follows auth email links; never request credentials in chat.

## What exists

| Area | Status |
| --- | --- |
| Accounts | Email registration, confirmation, login, recovery/password change, profile metadata and logout implemented. Full owner-led production credential acceptance remains. |
| Quiz/history/stats | Six sample questions across four modules, exact-set multi-select scoring, immutable completed snapshots/results, durable history and account-scoped statistics. |
| Recovery (new release) | Server-saved answers and current question, stable ordering, unfinished-session resume/abandon, optimistic revisions to reject conflicting tabs, serialized autosaves and save-failure warning/retry. |
| Timed samples (new release) | 90 seconds/question, database deadline, running answer keys private, last persisted draft scored after expiry, repeated completion safe. Clearly labeled unreviewed samples. |
| Payments (new release) | Private receipts, pending queue, trusted admin review, audited atomic/idempotent approval, expiry entitlements and server-side premium quiz start checks. Collection remains closed. |
| PDFs | Year → filtered module → file → title → optional professor/faculty → review. Local drafts only; no publishing or persistent document uploads. |
| Other admin/marketing | Prototype imports/questions/reports, simulated dashboard features and unsupported claims still need work. Do not call them operational. |

## Database rollout

Already applied manually in Supabase SQL Editor:

1. `supabase/migrations/202609180001_quiz_history.sql`
2. `supabase/migrations/202609180002_training_catalog.sql`

Also applied successfully on 2026-09-18, in this order:

3. `supabase/migrations/202609190001_session_recovery.sql`
4. `supabase/migrations/202609190002_receipts_subscriptions.sql`

Each migration is transactional. Inspect live schema before running: these are one-time migrations, not idempotent scripts. Verify new columns/functions/policies and a **private** `payment-receipts` bucket afterward. The migrations replace start/finish wrappers and revoke student access to underlying core functions. New API calls use the five-argument start signature. Deploy only after both migrations succeed; verify actual Vercel production revision, not just Git push.

Manual applications are not recorded in the Supabase CLI ledger. Reconcile history before adopting CLI deployments. `db/schema.ts` is an older scaffold, not the source of truth. Do not run `drizzle push` against production without reconciliation. Do not roll back by dropping tables containing attempts or receipts; use an additive correction or an explicitly planned restore.

## Implementation map

- `lib/quiz/engine.ts`, `types.ts`: scoring/deadline helpers and persisted attempt types.
- `lib/data/curriculum-metadata.ts`: public navigation metadata without embedded answer keys. Runtime client imports must use this file. `curriculum.ts` contains legacy sample keys; type-only imports are safe. Update metadata when adding catalog modules; public counts currently describe the six seeds, not a live content inventory.
- `app/api/quiz/route.ts`: same-origin authenticated start/save/finish/abandon and attempt/unfinished-session reads.
- `app/[locale]/(dashboard)/quiz/[moduleId]/page.tsx`: recovery, queued draft autosave, revision handling, timer and samples.
- Quiz results, dashboard and stats pages: owner-scoped completed snapshots and summary.
- `app/api/subscriptions/route.ts`: authenticated config/history, receipt submission/review and 60-second private proof URLs. Review is protected in both API and database.
- `components/subscriptions/SubscriptionPanel.tsx`: student form and pending admin queue. Admin shows oldest 100 pending requests; reviewed audit remains in DB. Student shows most recent 100 requests. Add pagination/history filters as volume grows.
- `stores/quizStore.ts`: legacy, unused by current engine; do not reconnect it accidentally.

## Verified evidence

- Previous live production: signed-in admin opened protected screens, completed a three-question anatomy quiz with a multi-select answer and two unanswered questions; result was 1/3, 6.7/20. Refresh retained the result; stats showed the same session. This controlled test remains in the owner account.
- Current release: production webpack build, TypeScript and lint on changed functional code pass.
- Nine auth/scoring helper tests pass; three built-server route tests pass, including forged demo access rejection, foreign-origin mutation rejection and unsigned quiz/subscription requests.
- `tests/database/recovery-payments.mjs` uses real PostgreSQL semantics through PGlite with minimal mocked auth/storage schemas. It verifies saved draft/revision recovery, conflicting revisions, private timed keys, expiry scoring from stored answers, ownership, abandonment, closed collection, private receipt paths, server prices, admin-only approval, retry idempotence, expiry and premium quiz-start enforcement.
- Database tests are not a replacement for real Supabase Storage uploads, production browsers or payment acceptance. Both live migrations returned success. Live verification confirmed all six draft columns, denied private-schema/core-function client access, permitted draft saves, receipt RLS, both storage policies, private bucket and closed collection. All three API/auth route tests also pass against production.

Commands:

```sh
npx tsc --noEmit
npx next build --webpack
node --experimental-strip-types --test tests/auth-policy.test.mjs tests/quiz-engine.test.mjs
TEST_APP_URL=http://localhost:3101 node --test tests/auth-routes.test.mjs
PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node tests/database/recovery-payments.mjs
```

Start the built server on the chosen local port for route tests. PGlite is a test-only package; install in a temporary directory if needed. Changed-code lint passes; broad repository lint may still have prototype baseline failures. Do not claim those were fixed.

## Live rollout acceptance completed

- Vercel reported success for `4c97c25`; new subscription and admin queue pages served successfully.
- Payments show closed with 4 500 / 2 800 DA planned offers; no receipt form is exposed while closed. Admin pending queue loads with no fabricated requests.
- Timed physiology sample `a57b45a2-6bb3-49a7-9a56-5eb8b8ac3d64` saved the selected answer. Reload restored the checked answer and continued the existing deadline. Expiry automatically finalized it at 90 seconds with 1/1 (20/20), then displayed corrections. This controlled test remains in the owner's account.
- A rollback transaction exercised authenticated live start/save/finish RPCs successfully without retaining that extra test attempt.
- A subsequent small fix preserves `sample=1` on the result page's restart link.
- Still pending: owner-led signup/password flows, second real student isolation, network-failure/conflicting-tab browser scenarios, and a controlled real Storage upload/receipt review before paid launch.

## Limits and decisions

- Only responses acknowledged as saved survive closing the page. Failed/offline saves are visibly warned; there is no offline outbox. A conflicting-tab revision requires reload before further editing.
- Server clock decides timed expiry. Client timer uses the server deadline but client clock can change display; it cannot grant extra server time. After expiry, only the last persisted draft counts. Finalization occurs on save/get/finish; there is no background scheduler finalizing dormant sessions at the exact deadline.
- Exact-set grading gives one point only for the complete correct selection; unanswered remain in the denominator. This is not an official exam scoring specification.
- Completed timed results reveal corrections to their owner. This is not a proctored or high-stakes exam system. Questions must still undergo medical review; `exam_ready=false` remains for seeds.
- Ordinary practice provides explanations/keys for learning. Sample labels must remain until reviewed content replaces seeds.
- `payment_configuration.accepting_payments=false` by default and instructions empty. **Do not accept real transfers.** Confirm recipient details, refund/support process and duration rules first. Annual 4 500 DA / semester 2 800 DA; database defaults 365/180 days are provisional, not confirmed commercial terms.
- Receipt files: private JPG/PNG/PDF, max 5 MiB, immutable through student policies; submission uses stable IDs and one pending request per account. Student uploads can leave unsubmitted orphan objects; define quota/retention and trusted cleanup before broad paid launch. MIME limits do not constitute malware scanning.
- Admin approval extends from later of current expiry or now, once, with reviewer/time/note audit. Rejection grants no entitlement. Metadata editable by students does not grant admin or premium access.
- Premium checks apply to catalog rows explicitly marked `requires_subscription=true`; all existing samples default false. Access to an already-started attempt is retained. Any future paid PDF/content operation must enforce entitlement server-side too; navigation locks alone do not protect content.

## Next steps in order

1. Deployment and live schema checks are complete for `4c97c25`. Preserve the applied schema and continue the acceptance checks below. Do not rerun migrations.
2. Repeat live quiz acceptance: answer, wait for “Enregistré”, refresh, resume same order/index/selection; abandon another draft. Test a timed sample through expiry, background-tab return and failed-save retry. Verify correction keys are absent while running and results/history update once. Use a second owner-controlled student account to verify result isolation.
3. Owner-led account checklist in both locales: signup/confirmation, login, profile edit/reload, password change then login, recovery link then login, logout then protected-route rejection. Owner completes new-credential entry/submission themselves.
4. Payment staging acceptance with two students and the authorized admin: enable test-only configuration, upload a clearly marked dummy receipt, confirm other student cannot read it, inspect admin signed proof, approve once, retry approval, test rejection and expiry. Use a staging project or explicitly approved controlled production workflow; keep real collection closed.
5. Confirm real payment destination, commercial durations and support/refund instructions. Set verified configuration, choose premium catalog rows, audit every paid operation, add upload abuse controls/retention and queue pagination. Only then open collection.
6. Review medical samples and grading policy. Publish a small provenanced catalog. Test realistic exam counts and timer behavior, enable reviewed exam rows and wire ordinary exam launches deliberately; the current setup keeps non-sample launches in preparation.
7. Build real PDF storage, access, draft/review/published workflow and admin publishing/import/report features. Preserve year/module/title/professor/faculty fields. Owner collects permitted reviewed content.
8. Remove unsupported marketing/gamification claims; finish mobile, keyboard/accessibility, French/English, monitoring, rate limits/email delivery, backups/restore, privacy/retention and load checks. Run an invited pilot before broad launch.

## Parallel Cloudflare preview (2026-09-18)

The `cloudflare-preview` branch adds OpenNext/Wrangler configuration and manual build/preview/deploy commands. Worker `app`, version `501f2f00-13d0-4876-9a75-3ffa291c0764`, is deployed at https://app.medqcm.workers.dev/fr. The older `medqcm-preview` Worker is retained temporarily for rollback. Vercel and its Supabase Site URL remain unchanged. Both hosts use the same database. See `docs/CLOUDFLARE_TEST.md` for measured public-route timings and the remaining signed-in/email acceptance checklist. All three live auth/API rejection tests pass on both hosts; Cloudflare signed-in recovery/admin flows and exact Supabase callback allowlisting are still pending. No automatic Cloudflare Git deployment is configured.

Future commercial decisions from the owner: academic subscriptions September to September; receipt contact `paymedqcm@gmail.com` with copy control requested; proposed Résidanat, all-years, semester, module-QCM and possibly own-year tiers. These are not implemented in the current preview. Confirm exact prices, academic cutoff and actual transfer destination before changing payment configuration. Keep collection closed.

## Next AI prompt

“Read AGENTS.md, docs/AUTH_SETUP.md and docs/AI_HANDOFF.md. Verify actual deployed revision and whether the two recovery/payment migrations were applied before doing anything else. Complete live recovery/timed-sample tests and owner-led account acceptance. Keep payment collection closed until verified recipient/duration decisions and controlled two-student/admin receipt tests pass. Preserve existing data and contributors’ changes, never expose credentials, and report implementation separately from production verification. Then tackle reviewed content, PDF/admin publishing and launch operations.”
