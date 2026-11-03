# MedQCM project handover

## Second-year first publication batch — 2026-11-03

Published **75 French Immunologie practice QCMs** to existing second-year module `mod-y2-immunologie`, batch `second-year-immuno-2026-11-03`: 59 from PDF pages 1–8 and 16 from pages 222–229. Stems/options and all answer sets were visually reconciled with source pages and OCR errors repaired. Source keys are preserved, including multiple-correct and seven-option questions. Owner-approved practice provenance is recorded; no independent medical reviewer or source licence was invented. No explanatory prose was imported. Students can submit proposed corrections from results.

Full transactional dry run and committed import passed database validation and student-role quiz completion/report checks; test attempts/reports were rolled back. The 700 pre-existing question versions and six historical attempts were unchanged. Targeted encrypted pre-change snapshot saved in ignored `.backups/pre-second-year-*.enc` (not a full DB/Storage backup). No schema migration or application redeployment needed: both hosts share the live database. Private scripts/evidence: `../qcm-extraction-second-year/README.md`, `publication-receipt.json`, `dry-run.json`; a fresh-connection student quiz/report check also passed and is recorded in `owner-live-verification.json`. Never replay the applied publication batch.

**This does not complete the second-year PDFs.** The 1,440-page Immunologie compilation includes an unrelated multi-subject textbook starting at PDF page 242, excluded from the immunology module. Remaining scanned annales, true/false grids, clinical cases and inline-answer sections need reliable extraction/reconciliation; preliminary parser success is not publication approval. One visually checked question has no correct choice in its source and is held because the current engine requires at least one. The owner confirmed on 2026-11-03: keep the 131-page Anatomie pathologique PDF for **third year**, mapped to existing `mod-y3-anapath`, despite its Desktop folder name. It is extracted locally only; do not create a second-year Anatomie pathologique module. Continue the second-year work with Immunologie only. No Anatomie pathologique content or other-year curriculum was changed. Private README lists page ranges, candidate counts, known hazards and continuation steps. First-year publication remains 620, with its previous 73 drafts private.

## Owner-approved practice publication — 2026-11-01

The owner explicitly chose publication of doctor-sourced QCMs under owner responsibility, followed by student error reports and corrections, without an independent reviewer account. This supersedes the earlier independent-review-only requirement for practice publication; do not fabricate medical reviewer identities or source licences.

Applied additive migration `202611010001_owner_publication.sql` and published **620** first-year questions in one live transaction: Cytologie 114, Embryologie 248, Biochimie 258. **73 flagged drafts remain private**; none of the problematic corrected-PDF changes was mass-imported. Published payloads were unchanged, all six historical attempts were preserved by fingerprint, and an encrypted pre-change snapshot of affected tables/functions/constraints is stored in ignored `.backups/pre-owner-publication-20261101.enc`. This is a targeted rollback snapshot, not a fresh full database/Storage backup. Do not rerun this migration/publication blindly.

The new `publish_owner` action requires trusted admin role, a substantive owner note, structurally valid content, an active non-archived curriculum and no unresolved extraction flag. It records owner identity/time/note, leaves independent reviewer fields empty, and preserves immutable published versions. Ordinary independent approval still exists. `curriculum_overview.reviewed` and admin reviewed-question counts no longer falsely classify owner-published content as independently reviewed. Independently reviewed exam paths exclude owner-approved practice banks; the curriculum remains provisional. Student results already support answer/explanation/typo reports with free-text proposed corrections; admin review and versioned amendments remain the correction route.

Validation: dedicated owner-publication tests (role denial, truthful metadata, quiz completion/reporting, cross-student isolation, revision, flagged hold, withdrawal/history) and the full architecture database suite passed. TypeScript, lint and OpenNext production build passed. Live dry run passed before commit. Private receipts: `../qcm-extraction-first-year/owner-publication-receipt.json` and `owner-live-verification.json` (only claim live student verification when that receipt exists).

Cloudflare deployed successfully with variables preserved: Worker `221eb024-548f-4c57-be20-f73ba58c3ee9`. Both production health endpoints returned OK. Fresh-connection student-role transactions verified quiz start/completion and report submission in all three modules; those test writes were rolled back. GitHub push succeeded through `a9b7215` after initial connection timeouts. GitHub reported the Vercel deployment pending for that commit; do not claim its interface rollout complete without checking the deployment status. The latest source adds owner-publication controls and French/English practice-content disclosure. Other years, PDFs, pricing and payment collection were not changed.

## Publication requested — live preflight 2026-11-01

Owner requested first-year QCM publication. Read-only Supabase REST check confirmed all 693 imported versions remain drafts, all 693 lack rights references and reviewer IDs, and 73 retain extraction flags. The three active target modules belong to a draft curriculum release. No item meets the existing independent-review/publication requirements; no publication or bypass was performed. A private queue of 620 unflagged (NOT medically approved) IDs and 73 flagged IDs is saved in `../output/review/first-year-publication-queue.json`; actual snapshot in `../qcm-extraction-first-year/publication-preflight.json`. Need documented source permission, an independent review completed by a real reviewer, and validated curriculum before the normal publication RPC can succeed.

The owner’s corrected review PDF was compared on 2026-10-30: 14 changed answer sets plus one unresolved key, with 19 sheets needing further attention. F051 substitutes Q138 for Q143; F028 contradicts its updated option; F005/F007 still lack figures. Do not mass-import its claimed “validated” content. Detailed private report: `../output/review/Comparaison_73_QCM_2026-10-30.md`. No corrected-PDF edits have been applied to live questions.

## French transcription repairs — 2026-10-29

Applied 92 verified content corrections to the existing first-year PDF draft batch in a live transaction. This includes French césures/ligatures, Cytologie Q45/p49's misplaced sub-stem, and complete reconstruction of Biochimie Q13/p640 (BCE), Q113/p655 (BCD), Q130/p657 (CDE), Q218/p666 (ABDE). All educational text remains French. No source PDF, app code, other year, publication status or reviewer identity was changed.

73 drafts now carry French review notes: 64 remaining two-column items and 9 context/explanation/scientific issues. Three flagged drafts also received typography fixes, so 162 unique versions were updated. Do not apply the larger raw OCR candidate plan: it still misreads symbols/numbers and medical words. The entire bank is not corrected or medically verified. The 693 imported questions remain private drafts, not student content.

The dry run and database validator passed; no administrator edits conflicted. Before-values were saved privately, an audit event recorded, all 162 resulting rows read back, and all six training attempts verified unchanged by count and hash in the transaction. Connectivity timed out intermittently before a successful application; do not blindly rerun the apply script. Fresh-connection verification confirmed 693/693 drafts accessible through the paginated admin workspace and denied to student workspace/direct reads. Both deployments share this database; no application redeploy was needed. Details and receipts: private sibling `../qcm-extraction-first-year/repairs/README.md`, `live-receipt.json`, `before-live-update.json`. Local regression checks cover original snapshot matching, stable option IDs, complete keys, sub-stem placement and decimal preservation. Keep extracted book content out of Git.

## First-year QCM review findings — 2026-10-29

**Do not publish the 693-draft batch as a verified bank.** A follow-up screen of all imported payloads and targeted visual/source checks confirmed extraction defects and errors in source corrections. Four Biochimie keys lost letters: Q13/p640 → BCE, Q113/p655 → BCD, Q130/p657 → CDE, Q218/p666 → ABDE. Q13 also mixes its stem with Q9's choices across columns; changing its key alone is insufficient. All 68 imported items from Biochimie PDF pages 639–669 require a complete column-aware recheck. Other defects include Google Books interface text, misplaced sub-stems and standalone questions that depend on missing context.

Source issues include Biochimie Q299 (p772/773: guanine → uric acid, not the printed urea), an inaccurate Cytologie Q13 explanation about osmosis/channels (p5), outdated/generalised emergency-contraception wording in Embryologie Q859 (p120/132), and inconsistent glycolysis versus complete-oxidation scope in Biochimie Q283 (p93/121). Scientific references and proposed French corrections are recorded in the private sibling file `../qcm-extraction-first-year/review/RAPPORT_REVUE.md`.

The automated screen flagged 79 records (not 79 confirmed errors); seven key discrepancies were inspected, four confirmed and three false positives dismissed. No live drafts were edited or published during the review. The whole bank has NOT received exhaustive visual/medical validation. Continue with traceable reconstruction of affected drafts, preserve current administrator edits, and independently review before publication. Keep all educational content in French as requested by the owner. Earlier claims of structurally checked drafts do not establish transcription accuracy.


## First-year PDF draft import — 2026-10-29

The owner supplied three Desktop PDFs and requested first-year QCM extraction only. All 1,076 pages were processed locally. **693 private drafts** were inserted in one live transaction: Cytologie 117, Embryologie 249, Biochimie 327. Batch `first-year-pdfs-2026-10-28` records source hashes/page numbers and an audit event. No questions were published and no PDF files were uploaded. The seven existing question versions and six current attempts were preserved.

All payloads passed database validation; fresh-connection checks confirmed draft-only status, paginated admin access to all 693 and denial of student workspace/direct reads. Four visually checked source/key fixtures and two parser regression checks passed. This is **not** line-by-line or medical verification, nor a complete conversion of every question. There are 204 quarantined paired candidates, 19 excluded exact duplicates, and additional unresolved parsing blocks (not a unique-question count). Missing keys, diagrams, cropped scans and shared options require follow-up. Rights references remain blank and difficulty defaults to medium.

Biochimie uses existing `mod-y1-biochimie-struct`; its compilation contains metabolic topics beyond that module's current display title. Confirm course/module placement before publication. No curriculum or other-year changes were made. Review a small pilot with source permissions and an independent medical reviewer before publishing. Both hosts use the same database; no application redeployment is needed for this draft import. Browser sign-in/student quiz acceptance was not repeated.

Private local extraction outputs and scripts are in the sibling `../qcm-extraction-first-year/` directory, outside this repository. Start with its `EXTRACTION_REPORT.md`, `import-receipt.json` and `verification.json`. Do not commit source PDFs, extracted book content or credentials. The importer refuses to repeat an existing batch. Older claims that no PDFs have been supplied are superseded by this entry.


## Production rollout — 2026-10-23

The new architecture is **deployed**, superseding the pre-deployment notes below. PR #1 was merged into `main` as `47b5252ec6b08568da672e0df044636d2b1315a0`; GitHub's verification check passed. Cloudflare runs application source `308b8fb`, Worker version `9552ff0b-bd7f-4b4e-9136-ccfacfb3123f`. Vercel reported a successful production deployment for merge commit `47b5252`.

- The three `20261020000*` migrations were applied once, in one production transaction, after the encrypted backup and local restore/migration rehearsal passed. **Do not rerun them.** Schema health is `202610200003`; three accounts and five attempts were preserved, including every original attempt field. There are 111 draft curriculum modules, six sample questions and no published questions; payments remain closed.
- `/api/health` returned HTTP 200 on both hosts. All five live route/auth-access smoke tests passed on each host. Signed-in administrator checks confirmed both admin dashboards; Cloudflare also loaded the new curriculum, offers, question and PDF workspaces and the existing history/statistics. The historical technical-test question is confirmed to remain a private draft; it was not published or deleted.
- Production checks confirmed private question-version reads, no student self-assignment of access grants and private PDF/receipt buckets. Full fresh signup/email/recovery, new quiz mutations, two-student isolation and receipt transactions were **not repeated on production** during this rollout; isolated integration covered the content/quiz/payment workflows.
- Vercel's health response still labels its release `development` because `NEXT_PUBLIC_RELEASE_SHA` is not configured there. Its deployed commit was verified through the provider's GitHub status. Cloudflare health identifies `308b8fb`.
- Hosted scanner, scheduled backups and monitoring/notifications are **not active**. A PDF cannot publish until scanning and independent review pass. The backup is local/encrypted; an independent offsite copy and protected scheduled operations remain launch gates. Content, commercial/legal terms and pilot testing remain pending.

Continue with hosted operations and the remaining acceptance/content gates; the database/application rollout itself is complete. See [architecture](docs/ARCHITECTURE.md), [operations](docs/OPERATIONS.md) and [launch checklist](docs/LAUNCH_CHECKLIST.md).

## Architecture implementation and rehearsal — 2026-10-21/22

**Historical implementation record; the rollout status above supersedes deployment statements here.** Development is on `codex/architecture-foundation`, based on `e9585d2`. The new schema and application are not yet verified on production; do not deploy the application before its three migrations. Payments remain closed and no medical content has been approved.

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

Local acceptance passed on 2026-10-21: all four PGlite suites, 11 unit/operations tests, TypeScript, lint, OpenNext build and five HTTP auth/access smoke tests. The production dependency audit reports zero known findings after source-map-js and sharp updates; five existing dev-only findings remain. GitHub PR: https://github.com/hitokiribatosai/MedQcm/pull/1 (draft). The initial GitHub verification run passed. The Playwright workflow uses disposable Supabase containers and synthetic accounts. On 2026-10-22 both GitHub `verify` and `integration` checks passed for `323ae95`. The browser scenario covers independent content review/publication, quiz save/reload/results, cross-student isolation and receipt approval with a separate payment-manager session. Earlier test-locator/session defects were corrected. This establishes isolated acceptance, not live production acceptance. PGlite mocks managed Auth/Storage schemas; the script tests mock CLI exports/scanning binaries and do not establish an actual disaster-recovery drill. Production acceptance has not been repeated during this implementation. On 2026-10-22, signed-in live preflight confirmed the new schema is absent, 3 accounts, 5 attempts, 0 receipts, 0 Storage objects, and collection closed. Free-plan automatic backups are unavailable. A manual export is possible without upgrading; the owner filled the private ignored `.env.operations` file. The server key was verified against Auth administration and Storage on 2026-10-22 without displaying secrets; the database password was corrected by removing placeholder brackets and the TLS-verified connection succeeded. An encrypted pre-migration archive and encrypted Storage-policy/table-fingerprint snapshot are saved locally under ignored `.backups/` (never commit these). The archive was restored into a separate local Supabase PostgreSQL 17 instance using its local superuser; all seven public table fingerprints matched, with 3 Auth accounts, 5 attempts and both Storage policies restored. The three new migrations then passed on that restored copy; all original attempt columns remained identical, schema health is `202610200003`, 111 draft modules exist and payments remain closed. A real restore exposed and fixed the `psql` target-address argument in the backup script; the two operations tests pass. Production migrations/deployments are still pending. Vercel automatically created a branch preview, which still points at the existing schema and is not production acceptance.

The new migrations are `202610200001_curriculum_versions.sql`, `202610200002_access_exams.sql`, and `202610200003_documents_operations.sql`. Historical production migrations through `202610050002` were manually applied. Inspect live schema and preserve a restorable backup before applying new SQL. Never blindly replay the historical migration directory against production.

### Continue here

1. Feature-branch CI and disposable browser acceptance passed for `323ae95`. The live credentials and local restore/migration rehearsal now pass. Keep production collection closed; repeat CI if application changes are made.
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
