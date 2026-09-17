# MedQCM: continuation guide for the next AI

Last updated: 2026-09-17.

## Mission and starting point

Continue building a reliable medical QCM application backed by Supabase. The owner is still preparing PDFs and content; show honest empty states until reviewed content exists. Do not invent official exams, faculty approval, activity, or usage figures.

- Repository: https://github.com/hitokiribatosai/MedQcm
- Production: https://qcmmed.vercel.app/en (also `/fr`)
- Supabase project: `ieancvwcctvnvgbimfhs`
- Completed auth implementation: `06442f2` (`fix(auth): replace demo access with verified Supabase sessions`).
- Configuration and verification details: [AUTH_SETUP.md](AUTH_SETUP.md).

The owner authorized the authentication work and production URL setup. The stages below are a proposed continuation plan, not a claim that they are implemented. Confirm the next requested milestone with the owner if the new task does not specify one. Never infer authorization to grant admin access, delete data, or send messages to third parties.

## Current fix list and implementation order

Status reflects code through `ec500cb`. Implemented does not mean live end-to-end verified.

| Work item | Current status | Next action |
| --- | --- | --- |
| Authentication, permissions, profile, password changes | Implemented; live acceptance tests pending | Complete stage 2 with controlled identities; verify Google UI matches provider availability. |
| Quiz engine | Outstanding — next coding priority | Complete stage 3: scoring, timer, submission, counts, unavailable modules, and results consistency. |
| Persistent quiz history | Outstanding — follows engine | Establish schema/RLS in stage 4, then save and retrieve durable attempts in stage 5A. |
| Live activity and statistics | Outstanding — follows history | Replace mock/session-only data with completed attempts in stage 5B. |
| Exams hub | Route, curriculum filters, and preparation state implemented | Enable sessions only after engine verification and reviewed question availability. |
| Student PDF alert | Replaced with a native status dialog; fake reminders removed | Keep preparation state until actual files exist; notifications require a separate real delivery feature. |
| Landing/subscription pricing | Shared pricing implemented; annual price 4 500 DA | Preserve shared values and verify French/English presentation. |
| Receipts and admin subscriptions | Outstanding | Implement stage 7: private uploads, pending requests, admin decisions, and server-enforced entitlement. |
| PDF/question publishing | Outstanding; content still being prepared | Implement stage 8 when source content is available. |

**Execution order:** establish current state → fix quiz engine → persistent data/permissions → persistent history → statistics → enable eligible exams → receipts/subscriptions → PDF publishing. Authentication acceptance remains a prerequisite for trusting live user-owned data; local engine fixes can proceed while user-led email tests are pending. Do not redo completed pricing, dialog, or hub work.

## Follow-up correction to the visible-fixes sprint

The exam hub now lists real curriculum modules with search and year filters, but intentionally offers no exam launch until question banks and timer/scoring are verified. It no longer advertises fabricated official exams, question counts, or ignored count parameters. Implement stage 3 before enabling launches, including parsing and validating any future count parameter.

The student PDF dialog uses native modal focus containment and Escape dismissal with focus restoration. Its fake reminder subscription was removed; document placeholders no longer show invented sizes/page counts or promise paid downloads. Practice links appear only for modules with actual questions. New navigation preserves locale, and the landing annual-price copy supports French and English. The existing quiz engine and its timer/scoring issues remain a separate outstanding stage; these UI corrections do not claim to fix that engine.

## 1. Establish the current state

1. Read `AGENTS.md`, this guide, and `docs/AUTH_SETUP.md`. Read the relevant installed Next.js documentation before changing code, as AGENTS requires.
2. Inspect `git status`, recent commits, and remote changes; preserve other work. Do not reset the checkout or force-push.
3. Inspect the current code before acting on the findings below; another contributor may already have fixed them.
4. Verify Vercel points to the intended revision and public Supabase project variables. Keep `.env.local` ignored. Never put a service-role key in a browser bundle or documentation.
5. Inspect the actual Supabase schema and policies before proposing migrations. No database or storage migrations were applied in this sprint.

## 2. Complete authentication acceptance before live data rollout

Already implemented: verified Supabase sessions, server admin guards, real profile metadata, real password changes, confirmation/recovery callback, safer logout, removal of demo access, and basic regression tests. Do not rebuild these from scratch.

Key files: `proxy.ts`, `lib/auth/policy.ts`, `lib/auth/server.ts`, `lib/auth/logout.ts`, `lib/supabase/`, `components/auth/`, `app/auth/callback/route.ts`, the profile page, and guarded layouts.

1. Use owner-controlled test identities and the live site. Have the owner enter passwords and use their email links; never request secrets in chat.
2. Register, receive confirmation, and complete the link in the initiating browser (PKCE needs its browser verifier). Confirm successful login and rejection of a wrong password.
3. Save profile fields, reload, and sign in from another browser. A second account must see only its own profile.
4. Change the password; verify mismatched confirmation fails and a fresh login accepts only the new password.
5. Request password recovery, complete it in the initiating browser, and verify the new password. Test invalid/expired links and helpful error messages.
6. Log out and verify protected pages redirect. Check student access to admin is denied, including forged legacy cookies and editable `user_metadata.role`.
7. Test admin access only with an explicitly authorized trusted admin account. The only role source is `app_metadata.role`; no admin account was granted in this work.
8. Hide the Google option while its provider is disabled, or configure Google if requested. Test both French and English paths.

Acceptance: all flows work against the intended deployment; no demo bypass or cross-account profile exposure. Mail inbox receipt alone does not satisfy this stage.

## 3. Correct quiz behavior before storing authoritative results

Recheck these earlier findings in the current implementation:

1. Multi-answer results may read only `selectedOptionId` instead of `selectedOptionIds`. Define and test scoring for exact matches, partial choices, unanswered questions, and single-answer questions.
2. Timer expiry may mark the store complete without submitting. Route manual finish and expiry through one idempotent completion path (repeated calls must produce only one attempt). Include the current uncommitted selection, lock editing after completion, and prevent double-click/expiry races.
3. Non-exam duration may use a fixed question-count estimate. Track real start/completion timestamps. In timed mode, derive remaining time from a deadline rather than assuming each interval tick equals one elapsed second. Define refresh/resume behavior explicitly and retain the same question/option order when resuming.
4. Empty or unknown modules may fall back to unrelated questions. Show a clear unavailable/content-in-preparation state.
5. Review mistake ordering and randomization. Do not describe simple mistake-first ordering as spaced repetition; use an unbiased shuffle where needed.

6. Parse and validate the requested mode and question count at quiz setup. Reject invalid values or show the actual supported count; never advertise more questions than exist. Keep the hub launch controls disabled until this contract works.
7. Extract scoring into one testable function used consistently by completion and results rendering. Preserve all selected option IDs and the question version; avoid recomputing a historical result against subsequently edited questions. Document the scoring rule without calling it official unless verified.
8. Preserve the current locale on results/exit navigation and show recoverable errors when a result cannot be saved. Separate completion from persistence status so a network retry does not restart the quiz.

Start with `stores/quizStore.ts`, `app/[locale]/(dashboard)/quiz/[moduleId]/page.tsx`, and `app/[locale]/(dashboard)/quiz/results/page.tsx`.

Acceptance: tests cover single/multiple answers, unanswered questions, invalid counts, empty modules, background/expired timers, duplicate finish calls, and consistent result rendering. Expiry completes once, elapsed time is credible, and unavailable modules never serve unrelated content.

## 4. Establish persistent data and permissions

1. Inventory the existing Drizzle schema, current Supabase tables, and frontend types. Choose one versioned migration workflow rather than applying competing schema systems.
2. Resolve curriculum slug IDs versus database UUIDs explicitly. Model attempts, answers, multiple selections, start/completion timestamps, and stable attempt IDs.
3. Add foreign keys, constraints, and indexes suited to actual queries. Define server-side score calculation before accepting client submissions as authoritative.
4. Apply least-privilege row-level security: students access their own attempts and payment requests; privileged operations require trusted admin authorization at the operation itself.
5. Prevent answer-key exposure where exam rules require it. Do not assume a protected page protects its underlying API.
6. Test policies as two separate students and an authorized admin, including direct API requests. Keep privileged server credentials server-only.

Acceptance: migrations are reviewable and repeatable; cross-account reads/writes fail; users cannot forge paid status, roles, or scores. Do not blindly run destructive schema synchronization on live data.

## 5. Connect persistent history, then statistics

### 5A. Persistent history

1. After stage 4, add an authenticated server operation that accepts a stable attempt ID and selected answers. Resolve the owner from the verified session; validate module/question membership and calculate the score server-side.
2. Write the attempt and answers atomically with a uniqueness rule for retries. Store mode, question version/order, all selected option IDs, total/answered/correct counts, timestamps, duration, and completion status. Finalized attempts must not be freely editable by students.
3. Replace single-attempt session storage as the source of truth. Local state can support an in-progress draft or retry, but must be scoped to the authenticated account and must never silently import another user's or anonymous history.
4. Load the results page by attempt ID and provide a paginated history query restricted to the current user. Handle loading, empty, missing, forbidden, and failed-save states explicitly.
5. Test refresh, a second device/browser, sign-out/account switching, network failure followed by retry, and attempted access to another student's attempt.

Acceptance: a completed quiz survives refresh and another browser; retries produce one record; partial writes and cross-account reads/writes fail; unsaved results are clearly identified.

### 5B. Live activity and statistics

1. Read completed attempts from the history API/database rather than hardcoded data or the latest session-storage entry. Update/invalidate queries after a successful completion.
2. Define each metric before implementing it: accuracy denominator, total completed questions, elapsed study time, streak timezone/day boundary, and weak-module ranking with a minimum evidence threshold. Exclude abandoned attempts consistently.
3. Populate the recent activity timeline with module names, completion dates, mode and score. Use stable ordering and pagination or a bounded recent list.
4. Derive charts and summary cards from the same data source. New users see zeros and helpful empty states, never fabricated activity.
5. Use fixed test histories to verify aggregates, repeated attempts, unanswered questions, date boundaries, and empty histories. Verify a newly finished quiz updates the timeline and summary without requiring logout.

Acceptance: displayed metrics agree with stored completed attempts, persist across devices, update after completion, and remain isolated by user.

## 6. Complete visible student-facing fixes

1. Preserve the implemented `/[locale]/exams` preparation hub and filters. Attach the timed simulator only after stage 3 and reviewed question availability. Use an official countdown only when a verified date exists.
2. Preserve the implemented native PDF status dialog and absence of fake reminders. Say the document is being prepared unless faculty validation is actually established.
3. Preserve the implemented shared pricing source in `lib/config/pricing.ts`. The requested annual price is **4 500 DA / an**; confirm other plans before changing their amounts. Synchronize landing and subscription pages.
4. Check French/English navigation, keyboard interaction, mobile layout, loading/error states, and unsupported marketing figures.

Acceptance: no dead primary navigation, fake download success, blank pricing, or fabricated availability.

## 7. Connect receipts and subscriptions end to end

1. Store receipts in a private bucket with ownership policies, upload size/type validation, and controlled admin viewing.
2. Create a user-owned pending payment record using server-validated plan and amount. Show submission failures and prevent duplicate requests.
3. Read real pending records in the admin subscriptions queue.
4. Make approval/rejection authorized, atomic, and idempotent. Record who acted and when, and define subscription start/expiry behavior.
5. Enforce subscription access server-side. Never trust client state or editable user metadata as proof of payment.

Acceptance: a student's receipt reaches the admin queue; authorized approval grants the correct entitlement once; other students cannot retrieve the receipt or approve payments.

## 8. Add the PDF and question publishing workflow

1. Replace simulated import/save actions with durable storage and processing state.
2. Add extraction/OCR only as needed, with retryable jobs and clear failures.
3. Preserve source document, page references, and content versions. Separate draft questions from published questions.
4. Require human review of medical questions and explanations before publication; store corrections and user reports.
5. Pilot one module with a small reviewed question set before expanding the catalog.

Acceptance: only reviewed content appears to students, provenance is available, and failed imports do not create partially published material.

## 9. Validate and deliver each milestone

Run checks proportionate to the changes:

```sh
node --experimental-strip-types --test tests/auth-policy.test.mjs
npx tsc --noEmit
npm run build
```

With a separate local built server at port 3100 and test configuration:

```sh
TEST_APP_URL=http://localhost:3100 node --experimental-strip-types --test tests/*.test.mjs
```

The route test includes logout requests; run it against a local test instance. Inspect the tests before changing their target. Use Node 22.6+ for the strip-types command.

- Run targeted lint and meaningful new tests for the behavior changed. Repository-wide lint already has unrelated failures; document them rather than disabling checks globally.
- Check the diff for secrets and unrelated edits. Use small coherent commits and ordinary pushes within the owner's requested scope.
- Record migration/deployment steps and verify the deployed behavior on the actual public URL.
- Update this guide with what passed, what remains, and the next concrete action. Distinguish local tests, live read-only checks, and live authenticated tests.

The corrective UI commit passed TypeScript, targeted lint, three authentication policy tests, and `npx next build --webpack`. Default Turbopack builds hit a local worker/port permission restriction; this was not a verified application compile failure. Validate the deployment separately.

## Suggested next prompt

“Read AGENTS.md, docs/AUTH_SETUP.md and docs/AI_HANDOFF.md in MedQcm. Start with stage 3: fix and test the quiz engine. Then implement stage 4 and stage 5 in order: persistent data and permissions, durable user-owned history, and live statistics. Preserve completed UI/auth work and other contributors’ changes. Keep exams in preparation until the engine and reviewed question banks are ready. Never expose credentials. Report tests, migrations, outstanding live authentication checks, and deployment status after each milestone.”
