# MedQCM project handover

## Current architecture implementation — 2026-10-21

**Read this section before the historical snapshot below.** Development is on `codex/architecture-foundation`, based on `e9585d2`. The new schema and application are not yet verified on production; do not deploy the application before its three migrations. Payments remain closed and no medical content has been approved.

The owner approved implementing the architecture, including curriculum/content publishing, learning integrity, scoped subscriptions, secure documents and operations. Supabase remains the backend; Cloudflare and Vercel remain the website hosts.

### Implemented in this branch

- Database-owned curriculum releases, stable year/module/course IDs, source verification and a draft Oran programme imported from existing navigation.
- Versioned QCM draft → independent medical review → publication → revision/withdrawal. Six original questions remain samples; old private drafts are preserved. Completed attempt snapshots and scores remain unchanged, with withdrawal notices.
- Reviewed exam definitions with total duration, question count, attempt limits and immutable rule snapshots. Existing autosave, conflict detection and history remain in place.
- Fixed academic periods and immutable offers scoped to one year, all medicine years (excluding residency), one module, or residency. The student selects the scope before submitting private proof. Payment managers approve once, revoke with audit reasons, and cannot grant access by changing a profile year. No prices or commercial terms were invented and no paid offers are seeded.
- Durable private PDF uploads with scan leases, retries, independent review and entitled short-lived downloads. Publication fails closed until a trusted scanner has attested the bytes. The scanner is implemented, not yet configured as a hosted service.
- Separate staff capabilities, administrative audit records, mutation budgets, readiness monitoring, encrypted database/file backup and restore tooling. Scheduled operations are disabled until secrets and owner notifications are configured.
- Database-driven student screens and administrative workspaces for curriculum, content, exams, offers and audit; historical exposure and current question counts are shown separately in statistics.

### Verification and deployment status

Local acceptance passed on 2026-10-21: all four PGlite suites, 11 unit/operations tests, TypeScript, lint, OpenNext build and five HTTP auth/access smoke tests. The production dependency audit reports zero known findings after source-map-js and sharp updates; five existing dev-only findings remain. GitHub PR: https://github.com/hitokiribatosai/MedQcm/pull/1 (draft). The initial GitHub verification run passed. The new Playwright workflow uses disposable Supabase containers and synthetic accounts; the initial run failed at the module dropdown test locator. The trace showed the page loaded normally; semantic combobox locators now replace the exact nested-label selectors. Check the rerun result before calling browser integration accepted. PGlite mocks managed Auth/Storage schemas; the script tests mock CLI exports/scanning binaries and do not establish an actual disaster-recovery drill. Production acceptance has not been repeated during this implementation. On 2026-10-22, signed-in live preflight confirmed the new schema is absent, 3 accounts, 5 attempts, 0 receipts, 0 Storage objects, and collection closed. Free-plan automatic backups are unavailable. A manual export is possible without upgrading; the private ignored `.env.operations` template awaits the existing database URI/password and server key. Vercel automatically created a branch preview, which still points at the existing schema and is not production acceptance.

The new migrations are `202610200001_curriculum_versions.sql`, `202610200002_access_exams.sql`, and `202610200003_documents_operations.sql`. Historical production migrations through `202610050002` were manually applied. Inspect live schema and preserve a restorable backup before applying new SQL. Never blindly replay the historical migration directory against production.

### Continue here

1. Run/check feature-branch CI and disposable browser acceptance; fix failures before merging. Keep production collection closed.
2. Follow [operations](docs/OPERATIONS.md): verify a real backup/restore, inspect existing schema, apply the three new migrations in order, then deploy the matching application to each host and check `/api/health` and signed-in flows.
3. Configure protected operations secrets, scanner, schedules and failure notifications, then verify they actually run. A workflow file is not an active service.
4. Obtain verified Oran programme/source rights and independent reviewers. Publish a small reviewed pilot. Agree exact academic dates/prices/refunds, retention/deletion, operator details and legal pages before opening payments.
5. Complete fresh-account email/recovery acceptance, accessibility, translations, real-device/mobile, load and pilot tests. No PDFs or approved QCMs have been supplied by the owner.

Architecture diagrams and data contracts: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Deployment, scans, backups and remaining operational limits: [docs/OPERATIONS.md](docs/OPERATIONS.md).

Additional commands:

```sh
node tests/database/architecture.mjs
node --test tests/operations.test.mjs
# Docker + Supabase CLI required; synthetic local environment only:
supabase start
node scripts/ops/run-integration.mjs
```

## Historical snapshot — superseded where noted above

**Snapshot:** 2026-10-12, based on repository `main` at `21f0cc3`, the source tree, and prior owner conversations. Recheck Git and deployments on every new session. The latest documented live acceptance is dated **2026-10-06**; this document does not assert that the live services were retested on 2026-10-12.

## Purpose and current status

MedQCM is a French/English QCM practice app for medical students in Algeria. The goal is to organize practice by study year and module, save private learning history, offer reviewed timed exams and course documents, and eventually support manually verified subscriptions. The owner chose **Oran University** as the intended curriculum authority, but has not supplied an applicable official syllabus, medically reviewed QCM bank or licensed course PDFs. The app is a **content pilot**, not ready for public medical-content or paid launch.

The current live catalog is described in the repository as **six unreviewed sample questions** across four modules. The year/module tree is draft navigation, not an approved faculty curriculum. No PDF has been published. Payment collection is configured closed. Do not present planned plans, sample exams or draft questions as finished products.

## Stack and architecture

| Area | Implementation |
| --- | --- |
| Web | Next.js 16.3.8 App Router, React 19.2.8, TypeScript, Tailwind CSS 4, `next-intl` (`fr`/`en`) |
| UI and forms | `lucide-react`, Framer Motion, Recharts, React Hook Form, Zod, Sonner; Zustand remains a dependency, but `stores/quizStore.ts` is legacy and unused by the current quiz flow |
| Identity and data | Supabase Auth, PostgreSQL, Storage, SSR cookie client; SQL migrations under `supabase/migrations/` are the schema source of truth |
| Hosting | Vercel at <https://qcmmed.vercel.app> and Cloudflare Worker `app` at <https://app.medqcm.workers.dev>, built with OpenNext and Wrangler |
| Verification | Node tests, PGlite database suites, TypeScript, ESLint, OpenNext build and GitHub Actions (`.github/workflows/ci.yml`) |

Important paths and flow:

- `app/[locale]/` contains localized landing, auth, student and admin routes; `components/` contains shared UI. `lib/i18n/` controls routing and messages.
- `proxy.ts` refreshes Supabase cookies and redirects protected routes. Server layouts and API handlers enforce authorization again; admin trust comes from Supabase **app metadata**, never user-editable profile metadata or an email comparison. See `lib/auth/` and `docs/AUTH_SETUP.md`.
- `app/api/quiz/route.ts` calls database RPCs for starting, saving, finishing and retrieving private attempts. `lib/quiz/` holds scoring/types. SQL functions enforce owner isolation, timing, draft revisions and scoring; running answer keys stay server-side.
- `lib/data/curriculum-metadata.ts` is public browser-safe draft navigation. `lib/data/curriculum.ts` contains legacy sample answer keys; do not import it into client runtime code. The database catalog, rather than static metadata, owns actual question/attempt data. New catalog modules need a reviewed navigation mapping.
- `app/api/modules`, `/exams`, `/reports`, `/admin/questions` and `/subscriptions` serve data-backed module/exam discovery, owner reports, private admin question drafts and private receipt review. The matching pages live under `app/[locale]/`.
- `app/[locale]/admin/depot/page.tsx` builds **in-memory PDF draft rows only**. Its file selector does not upload or persist PDF bytes. `app/[locale]/admin/import/page.tsx` explicitly says automated PDF extraction is unavailable. The student depot displays document availability, not published files.
- `wrangler.jsonc` defines Cloudflare Worker `app`, enables Node compatibility, and preserves dashboard-managed variables with `keep_vars: true`. `.github/workflows/ci.yml` runs type, lint, unit and database tests plus a Cloudflare build.

## Implemented and last verified

- Supabase email signup/confirmation, login, password recovery/change, profile metadata and logout have code paths. The most recent release did **not** repeat full fresh-account production acceptance; see below.
- Multi-select QCMs use server-side exact-set scoring. Completed result snapshots, private history and statistics persist. Draft answers and position autosave; a student can resume or abandon an interrupted attempt. Revisions detect another-tab conflicts. Timed samples use a server deadline and last saved answers at expiry; missed/unanswered questions feed a retry queue. The six seeds remain educational samples.
- Reviewed exam discovery is implemented, with a review/source gate in SQL. Existing timed samples remain labeled samples; no approved exam bank is published.
- Admin can save and remove **private QCM drafts**. Student question reports have an owner-scoped submission path and admin review queue/audit fields. Drafts do not publish to the student catalog.
- Private receipt and subscription schema, Storage policies, pending admin queue, review RPCs, entitlement records and server-side premium quiz start checks are implemented. The feature is **closed** via `payment_configuration.accepting_payments=false`; real receipt handling and commercial rules are unaccepted.
- Student and admin pages were revised to remove invented usage/medical/PDF/import claims; the left dashboard sidebar was fixed to stay visible while scrolling. Basic English labels and mobile student navigation were improved.
- On 2026-10-06, owner-approved migrations through `202610050002_question_reports.sql` were reported applied to the live Supabase project. Previous checks found three Auth users, five attempts, zero receipts and closed collection. CI passed for app commit `a9653d5`; Vercel reported that commit deployed, Cloudflare Worker was deployed, route smoke tests passed on both, and an admin viewed real counts. These are **dated observations**, not a fresh deployment check. More detail: `docs/AI_HANDOFF.md` and `docs/LAUNCH_CHECKLIST.md`.

## Unverified or incomplete work

1. **Production acceptance:** Repeat fresh signup/confirmation/login/profile/password-change/reset/logout in both locales using owner-controlled accounts. Test a second student against history/reports/receipts; check mobile and failed-network quiz recovery. Prior SMTP delivery of one email proves delivery for that request only. Verify current commit on **both** hosts after future deployments.
2. **Medical content and curriculum:** Obtain the applicable Oran University academic-year syllabus and approved year → module → course mapping. Gather permissioned QCMs with source, answers, explanations, medical reviewer and review date. Decide official scoring before enabling `exam_ready`. Six seeds are unreviewed. Do not copy competitor content without explicit rights and review.
3. **PDF workflow:** Implement durable private upload, malware/content checks, source permissions, admin review, publication and student access control. Current admin depot form only creates browser-memory draft rows. No PDF exists in the student library.
4. **Payment launch:** Keep collection closed while confirming recipient, prices, plan scope, support/refunds and September-to-September or semester rules. The code currently exposes annual/semester plans with provisional 365/180-day duration defaults; the owner's later ideas about residency, all-years, year-only and module-only tiers are **not finalized or implemented**. Stage a controlled two-student/admin proof upload, isolation, review, retry and expiry test before opening payments. Add receipt retention, orphan cleanup and queue pagination.
5. **Operations and quality:** Establish scheduled database and Storage backups with a restore drill (the 2026-10-06 checklist says the free Supabase project lacked scheduled backups), monitoring/alerts, email-rate review, privacy/terms/operator details, accessibility, translations, mobile/load checks and an invited pilot.
6. **Possible test artifact:** In a later admin-browser test, a dummy question draft titled “TEST TECHNIQUE — À SUPPRIMER” was reportedly saved privately. The conversation does not establish that it was deleted. Inspect the current admin draft list before treating it as cleaned up; do not publish it. This is a historical uncertainty, not a verified present database row.

## Decisions and constraints

- Supabase remains the current backend. A future migration to a custom backend was discussed, but **no switch was chosen**. Auth, RLS, SQL RPCs and private Storage form one security boundary; a replacement requires a planned data/auth migration.
- SQL migrations were applied manually in production and may not appear in the Supabase CLI ledger. Inspect the live schema before any deployment; **do not blindly rerun migrations**, drop data or assume local tests replace Supabase Storage testing.
- Student answer history is owner-scoped; admin privileges require trusted `app_metadata.role=admin`. Server APIs and SQL must enforce access, even if the UI hides a control. Keep answer keys out of client bundles during active attempts.
- Exact-set grading and 90-second-per-question sample timing are current implementation choices, **not** faculty-approved examination rules. A timed attempt scores its last persisted answers; failed/offline saves are warned but there is no offline outbox or background finalization scheduler.
- The owner plans manual payment verification, not a direct CCP/BaridiMob/Eddahabia integration for now. Do not accept real transfers until the business and production test gates pass.
- Cloudflare and Vercel are dual test deployments. Neither should be called the definitive production host solely from a Git push; check each provider's revision and end-to-end behavior. Preserve Cloudflare's dashboard variables when deploying.

## Setup and verification

Use Node 22, `npm ci`, then configure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and the **public** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy anon key). Never commit `.env.local`, service-role keys or credentials. Use a dedicated Supabase project for a fresh installation and apply the numbered SQL migrations in order. For an existing project, inspect schema/ledger first. See `README.md` and `docs/AUTH_SETUP.md` for Auth callback and SMTP requirements.

```sh
npm run dev                         # http://localhost:3000/fr or /en
npx tsc --noEmit
npm run lint -- --quiet
node --experimental-strip-types --test tests/auth-policy.test.mjs tests/quiz-engine.test.mjs
node tests/database/recovery-payments.mjs
node tests/database/learning-progress.mjs
node tests/database/admin-content.mjs
npm run build                       # Next.js production build
npm run cf:build                    # OpenNext/Cloudflare bundle
```

For HTTP smoke tests, start the built app and run `TEST_APP_URL=<local-or-preview-URL> node --test tests/auth-routes.test.mjs`. Inspect the CI workflow for its exact checks. A docs-only edit need not claim or repeat production acceptance. The last verified results are in `docs/LAUNCH_CHECKLIST.md`; future sessions must record their own results and dates.

## Next session: first actions

1. Read `AGENTS.md`, this file, `docs/AI_HANDOFF.md` and `docs/LAUNCH_CHECKLIST.md`; inspect `git status`, `git log`, relevant source and current remote/deployment state. Summarize facts versus dated or unknown claims, then follow the owner's current request.
2. If asked to advance launch readiness, verify current production Auth and quiz isolation with owner-controlled test accounts. Keep payments closed.
3. Validate the Oran curriculum and medically review a small question set; implement a deliberate draft → reviewed → published flow and test that only reviewed content enters practice/exams.
4. Build and test the durable PDF review/publishing pipeline when permissioned documents become available; in parallel, finish payment staging, backup/restore, monitoring, legal and pilot gates.

For the full acceptance plan and historical implementation details, use `docs/LAUNCH_CHECKLIST.md` and `docs/AI_HANDOFF.md`. Update this handover after meaningful work without silently converting planned features or dated checks into completed ones.
