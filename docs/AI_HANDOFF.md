# MedQCM continuation guide

Updated 2026-09-18. Read this status before implementing more work.

## Current state

- Repository: https://github.com/hitokiribatosai/MedQcm
- Website: https://qcmmed.vercel.app (French `/fr`, English `/en`).
- Supabase project: `ieancvwcctvnvgbimfhs`.
- Authentication implementation: `06442f2`; Google button removed in `845ced6`.
- Read `AGENTS.md` and the installed Next.js documentation before code changes. Preserve other contributors' work and never force-push.

| Feature | Status |
| --- | --- |
| Email login, signup, confirmation, password recovery/change, profile metadata, logout | Implemented. SMTP delivery confirmed. Full owner-led browser acceptance testing remains. |
| Trusted admin route protection | Implemented with `app_metadata.role`. No admin role was assigned in this work. |
| Learning quiz engine | Replaced broken fallback flow with actual module questions, multiple selections, exact-set scoring, navigation, feedback, finalization, and retryable saves. |
| Persistent history | Implemented and backed by Supabase; completed attempts have their own result URL and question snapshot. |
| Statistics and activity | Implemented from completed attempts: lifetime counts, weighted accuracy, duration, paginated recent history. Dashboard summary uses the same database function. |
| Exams | Preparation hub only. Both UI and database prevent starting unreviewed exams. Timed production exams are NOT finished. |
| PDF depot | Native status dialog, no fake reminders. Real PDFs and publication workflow pending. |
| Pricing | Shared annual 4 500 DA and semester 2 800 DA configuration. |
| Payments | Not operational. Removed fabricated bank destinations and admin requests; disabled receipt form/submission. No real payment should be sent yet. |
| Remaining admin screens, content imports, reports, gamification | Still contain prototype behavior; do not describe them as operational. |

## Database changes already applied

With the owner's confirmation, these versioned SQL migrations were applied in Supabase on 2026-09-18:

1. `supabase/migrations/202609180001_quiz_history.sql`
2. `supabase/migrations/202609180002_training_catalog.sql`

The public schema was empty before applying them. They create:

- `training_catalog`: server-managed question snapshots, no direct student/anonymous access.
- `training_attempts`: owner-scoped read policy, no direct student inserts/updates/deletes.
- `start_training_attempt`: verifies the authenticated owner, validates mode/count, snapshots a randomized question set, and reuses a stable attempt ID on retries.
- `finish_training_attempt`: locks the attempt, validates selected options, computes exact-set scores against the stored snapshot, and makes completed results immutable on repeated submissions.
- `training_summary`: reads the current user's completed attempts under row-level security.

Six existing sample questions were copied across four modules: `mod-y1-anat-general` (3), `mod-y2-cardio` (1), `mod-y3-semio-cardio` (1), `mod-y4-cardio-sca` (1). They have not been medically reviewed. All catalog rows have `exam_ready=false`. The training setup clearly labels this limitation.

These migrations were applied manually through SQL Editor, not through the Supabase CLI's migration ledger. Inspect live schema before any CLI deployment and reconcile migration history; do not blindly rerun these `CREATE`/`INSERT` migrations. `db/schema.ts` is an older Drizzle scaffold and is NOT the source of truth for these tables. Do not use `drizzle push` against production until schemas are deliberately reconciled.

## Implementation map

- `lib/quiz/engine.ts`: exact-set scoring, URL mode/count parsing, deadline calculation.
- `lib/quiz/types.ts`: persisted attempt shape.
- `app/api/quiz/route.ts`: same-origin, authenticated, validated start/finish endpoint using user-scoped Supabase RPCs. No service key is required. Same-origin validation uses the destination Host header to handle local Next.js URL normalization; logout shares the same tested helper.
- `app/[locale]/(dashboard)/quiz/[moduleId]/page.tsx`: learning session UI and retry handling.
- `app/[locale]/(dashboard)/quiz/results/page.tsx`: owner-checked persisted results, every selected option, unanswered counts, question snapshot review.
- `app/[locale]/(dashboard)/stats/page.tsx`: lifetime summary and paginated activity; timestamps displayed in Africa/Algiers.
- `app/[locale]/(dashboard)/dashboard/page.tsx`: summary connected to the same persisted data.
- `stores/quizStore.ts`: legacy store, no longer imported by the quiz UI. Do not accidentally reconnect it; its old timer behavior is not the current implementation.

## Current limits to preserve honestly

- Active selections are held in memory. Refresh/exit abandons unsaved selections; the setup warns users and active sessions register a browser unload warning. Completed results persist across devices. Do not claim resumable drafts.
- A failed finish keeps selections on the current page, freezes editing, and offers save retry using the same attempt ID. Do not refresh before retrying.
- Training score is exact set = one point, otherwise zero; unanswered questions stay in the denominator. It is not an official exam grading scheme.
- Stored session duration is server start-to-completion time, capped at 24 hours; it is not a measurement of active focus time.
- Practice answers and explanations are available to the client. This is appropriate for learning, not a secure proctored examination.
- Timed exam launch is gated. Deadline helper/expiry plumbing exists, but exam UI, backend deadline enforcement, hidden answer keys, and end-to-end timeout testing must be finished before unlocking it.
- No invented streaks or weak-topic claims in statistics. Advanced charts, streak definitions and weak-topic ranking remain optional future work. Other existing curriculum/gamification pages still require an audit of prototype numbers and English translations.
- Subscription payment flow is intentionally unavailable until verified payment details, private storage, approval and entitlement enforcement exist.

## Next steps, in order

### 1. Live browser acceptance

Use owner-controlled test accounts. Complete signup/confirmation, login, profile persistence, password change/recovery, and logout. Have the owner enter new credentials and follow email links; do not ask for secrets in chat. Check French and English routes.

Complete a sample anatomy session with single and multiple selections, finish, view results, refresh, visit statistics, and sign in from a second browser. Retry a failed save and verify it does not duplicate history. Test a second account cannot open the first account's result URL. Test positive admin access only with an explicitly authorized admin account.

### 2. Reviewed content and timed exams

1. Review/correct the sample medical questions and establish document/page provenance; existing source labels are inherited sample data, not verified citations.
2. Add a small curated module through versioned catalog updates. Retain old attempt snapshots.
3. Implement resumable drafts if desired with account-scoped ownership, stable question/option order, explicit abandonment, and reliable save states.
4. Before enabling exams, use server deadlines, hide answer keys until completion, capture last selections, prevent expiry/manual-submit races, test background tabs/refresh, and validate requested count against available questions.
5. Only then connect the hub's launch controls and enable reviewed catalog entries. Do not simply flip `exam_ready`.

### 3. Payments and subscriptions

1. Obtain owner-verified payment recipient details; never restore the sample RIP/CCP numbers.
2. Add private receipt storage, file validation, ownership policies and authorized admin viewing.
3. Create pending requests with server-validated plan amounts and stable retry IDs.
4. Implement an authenticated admin queue and atomic, idempotent approval/rejection with an audit trail.
5. Store expiry/entitlements and enforce access at data operations; do not trust client flags or editable profile metadata.
6. Test two students and an authorized admin before enabling the payment UI.

### 4. PDF publishing and remaining prototypes

Replace simulated imports/saves and local-only reports with real records. Add draft/review/published states, extraction/OCR jobs where needed, provenance, errors/retries, and medically reviewed questions. Add notifications only when subscriptions and actual delivery exist. Audit remaining admin dashboard figures, learning-map progress, landing marketing claims, mobile/accessibility and translations.

## Validation and evidence

- TypeScript and targeted lint for the new quiz code.
- Five engine tests: multi-selection, unanswered denominator, deadline catch-up, invalid/clamped counts, nonmutating shuffle.
- Four auth policy/origin tests and two local route regression tests.
- Isolated PostgreSQL (PGlite) migration tests: catalog seed, retry identity, exact scoring, immutable finish, owner isolation, denied direct writes, private catalog, disabled exams and anonymous denial.
- Live Supabase transaction verified a 3/3 anatomy result, immutable retry, and cross-account read denial; all test changes were rolled back. This was database verification, not a browser login simulation.
- Production build uses `npx next build --webpack` here because Turbopack workers hit a local port permission restriction.

Commands:

```sh
node --experimental-strip-types --test tests/auth-policy.test.mjs tests/quiz-engine.test.mjs
npx tsc --noEmit
npx next build --webpack
```

Database test requires `@electric-sql/pglite` installed in an isolated directory (no production connection):

```sh
PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node tests/database/quiz.mjs
```

For route tests, use a separate local built server only:

```sh
TEST_APP_URL=http://localhost:3100 node --experimental-strip-types --test tests/auth-routes.test.mjs
```

Update this guide after each milestone and distinguish code/build checks, live database verification, deployed checks, and authenticated browser testing. Do not claim every item is finished because the build passes.
