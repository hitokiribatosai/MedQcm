# MedQCM continuation guide

Updated 2026-10-06. Read AGENTS.md and installed Next.js docs before editing. Never expose credentials or force-push.

## 2026-10-06 release-preparation update

This release includes the earlier learning/exam commit (`4c4a475`) plus launch-preparation changes. At the start of this update, GitHub `origin/main` was `5beb6fc`. **Verify the latest commit and deployed revision before continuing; do not assume local code is live.** The Supabase free project was found paused on 2026-10-05 and was resumed after explicit owner approval. Its SQL Editor showed quiz history and receipts present, but `training_module_progress()`, `question_drafts`, and `question_reports` absent. Live migration execution was awaiting the owner's action-time confirmation when this note was written. Payment collection remained closed (`accepting_payments=false`, blank instructions, provisional 365/180-day settings); the dashboard showed three auth accounts and no scheduled backups.

Current code changes:

- `202609280001_learning_progress.sql` from the local commit, plus `202610050001_admin_questions.sql` and `202610050002_question_reports.sql`, are tested in PGlite. The new admin QCM editor saves **private drafts only**. The new report form creates owner-scoped reports from completed quiz results, with an admin review queue and audit fields. The admin overview uses database counts. Do not publish draft questions without medical review.
- Public landing, student dashboard, course library, admin imports/depot, profile and topbar no longer show invented growth, gamification, PDF, exam or AI-import claims. The student PDF page now reports absence of documents rather than generating synthetic file cards. English account/profile labels and mobile student navigation were improved.
- Next.js was updated to 16.3.8. Unused Capacitor/Drizzle dependencies and scaffold were removed. The production-dependency `npm audit --omit=dev` reports zero known vulnerabilities; five high audit findings remain in the dev-only ESLint dependency chain with no non-breaking upstream fix at this time.
- OpenNext 1.20.8 and Wrangler 4.147.0 are now declared with `wrangler.jsonc` for Worker `app`; `npm run cf:build` succeeds. A local Worker run passed the five route tests and protected-route redirects before the final UI-only changes. Cloudflare dashboard/CLI authentication expired and needs owner sign-in before live deploy. The app is still served from both Cloudflare and Vercel at their existing URLs.
- `.github/workflows/ci.yml` and `docs/LAUNCH_CHECKLIST.md` provide repeatable checks and explicit launch gates.

Latest local verification: TypeScript, lint, Webpack Next build inside OpenNext, nine auth/quiz tests, three PGlite database suites and five local Worker route tests passed. Re-run final checks after further changes, then apply migrations **in order** only after comparing the live schema and obtaining action-time approval for the access changes. Push only after live schema succeeds. Cloudflare deployment needs authenticated access; do not broaden OAuth grants silently. Verify Vercel and Cloudflare revisions and signed-in behavior afterward. Do not call the site public-launch-ready until the medical content, legal/operator/payment decisions, backups and owner-led account/payment acceptance in `docs/LAUNCH_CHECKLIST.md` are complete.

## 2026-09-28 learning and exam update

The owner chose Oran University as the intended curriculum authority, but has no official syllabus, course PDFs, or medically reviewed QCM bank yet. Treat `lib/data/curriculum-metadata.ts` as **draft navigation**, not an approved faculty programme. The six seeded questions remain unreviewed samples. Do not copy competitor questions, claim official sourcing, or set `exam_ready=true` until a named medical reviewer checks the questions, explanations, scoring, and provenance.

Potential primary reference: [Oran 1 Faculty of Medicine 2025/26 first-year timetable](https://facmed.univ-oran1.dz/les-d%C3%A9partements/m%C3%A9decine/p%C3%A9dagogie/810-emploi-du-temps-des-cours-magistraux-l-annee-de-medecine-armee-universitaire-2025-2026.html). This is a timetable, not confirmation of the full 2026/27 syllabus or permission to republish course PDFs. Obtain the applicable academic year and faculty-approved year → module → course list before replacing draft metadata.

This update adds:

- `supabase/migrations/202609280001_learning_progress.sql`: owner-scoped module progress, latest missed/unanswered question queue, retry attempts, catalog overview, and reviewed exam discovery. It requires reviewer ID, review time, and source reference before an exam can be marked ready, and resets review when catalog questions change. The four seed modules' unverified source labels become “Exemple non validé”; completed attempt snapshots remain untouched. **One-time migration; apply only after checking the live schema.**
- `/[locale]/review`: corrections and a retry session from the student's own completed answers. A correct completed retry removes the question from the queue.
- `/[locale]/stats`: real module-level session count, accuracy, and distinct questions seen, alongside existing history.
- `/[locale]/exams`: discovers reviewed, published exams from the database; timed sample links remain labeled as samples. New exams use the existing 90-seconds-per-question server timer and private answer keys.
- `/api/modules`: safe count/review metadata for the module and quiz screens; no answer keys. The year screen now describes the draft programme and stops advertising invented QCM totals, XP, ranking, and inaccessible premium lessons. PDF placeholders no longer use invented official titles.

The catalog now supports the path from source → medical review → `exam_ready`, but **the actual Oran programme/course taxonomy, content review, and admin import/publishing UI remain to be built**. New catalog modules outside the static navigation need a reviewed taxonomy mapping before they can appear in the year screens. No PDFs are uploaded or published. The owner may gather the content later; do not mark these steps complete prematurely.

Validation: `node tests/database/learning-progress.mjs` exercises owner isolation, per-module metrics, wrong/unanswered queue, retry correctness, and exam discovery. PGlite is now a dev dependency. Run it with `recovery-payments.mjs`, `admin-content.mjs`, TypeScript, ESLint and a production build before deployment.

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
| Other admin/marketing | Private QCM drafts, reports and real admin metrics are implemented locally but require the new migrations and rollout. PDF import/publishing remains unavailable. |

## Database rollout

Already applied manually in Supabase SQL Editor:

1. `supabase/migrations/202609180001_quiz_history.sql`
2. `supabase/migrations/202609180002_training_catalog.sql`

Also applied successfully on 2026-09-18, in this order:

3. `supabase/migrations/202609190001_session_recovery.sql`
4. `supabase/migrations/202609190002_receipts_subscriptions.sql`

Each migration is transactional. Inspect live schema before running: these are one-time migrations, not idempotent scripts. Verify new columns/functions/policies and a **private** `payment-receipts` bucket afterward. The migrations replace start/finish wrappers and revoke student access to underlying core functions. New API calls use the five-argument start signature. Deploy only after both migrations succeed; verify actual Vercel production revision, not just Git push.

Manual applications are not recorded in the Supabase CLI ledger. Reconcile history before adopting CLI deployments. The old Drizzle scaffold was removed; SQL migrations are the source of truth. Do not roll back by dropping tables containing attempts or receipts; use an additive correction or an explicitly planned restore.

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

## Next AI prompt

“Read AGENTS.md, docs/AUTH_SETUP.md and docs/AI_HANDOFF.md. Verify actual deployed revision and whether the two recovery/payment migrations were applied before doing anything else. Complete live recovery/timed-sample tests and owner-led account acceptance. Keep payment collection closed until verified recipient/duration decisions and controlled two-student/admin receipt tests pass. Preserve existing data and contributors’ changes, never expose credentials, and report implementation separately from production verification. Then tackle reviewed content, PDF/admin publishing and launch operations.”
