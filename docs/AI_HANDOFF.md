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

## Follow-up correction to the visible-fixes sprint

The exam hub now lists real curriculum modules with search and year filters, but intentionally offers no exam launch until question banks and timer/scoring are verified. It no longer advertises fabricated official exams, question counts, or ignored count parameters. Implement stage 3 before enabling launches, including parsing and validating any future count parameter.

The student PDF dialog uses native modal focus containment and Escape dismissal with focus restoration. Its fake reminder subscription was removed; document placeholders no longer show invented sizes/page counts or promise paid downloads. Practice links appear only for modules with actual questions. New navigation preserves locale, and the landing annual-price copy supports French and English. The existing quiz engine and its timer/scoring issues remain a separate outstanding stage; these UI corrections do not claim to fix that engine.

## 1. Establish the current state

1. Read `AGENTS.md`, this guide, and `docs/AUTH_SETUP.md`. Read the relevant installed Next.js documentation before changing code, as AGENTS requires.
2. Inspect `git status`, recent commits, and remote changes; preserve other work. Do not reset the checkout or force-push.
3. Inspect the current code before acting on the findings below; another contributor may already have fixed them.
4. Verify Vercel points to the intended revision and public Supabase project variables. Keep `.env.local` ignored. Never put a service-role key in a browser bundle or documentation.
5. Inspect the actual Supabase schema and policies before proposing migrations. No database or storage migrations were applied in this sprint.

## 2. Finish authentication acceptance testing first

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
2. Timer expiry may mark the store complete without submitting. Route manual finish and expiry through one idempotent completion path.
3. Non-exam duration may use a fixed question-count estimate. Track real start/completion timestamps and define behavior for background tabs, refresh, and resumed attempts.
4. Empty or unknown modules may fall back to unrelated questions. Show a clear unavailable/content-in-preparation state.
5. Review mistake ordering and randomization. Do not describe simple mistake-first ordering as spaced repetition; use an unbiased shuffle where needed.

Acceptance: deterministic scoring tests cover multiple selections; expiry completes once; elapsed time is credible; unavailable modules never serve unrelated content.

## 4. Establish persistent data and permissions

1. Inventory the existing Drizzle schema, current Supabase tables, and frontend types. Choose one versioned migration workflow rather than applying competing schema systems.
2. Resolve curriculum slug IDs versus database UUIDs explicitly. Model attempts, answers, multiple selections, start/completion timestamps, and stable attempt IDs.
3. Add foreign keys, constraints, and indexes suited to actual queries. Define server-side score calculation before accepting client submissions as authoritative.
4. Apply least-privilege row-level security: students access their own attempts and payment requests; privileged operations require trusted admin authorization at the operation itself.
5. Prevent answer-key exposure where exam rules require it. Do not assume a protected page protects its underlying API.
6. Test policies as two separate students and an authorized admin, including direct API requests. Keep privileged server credentials server-only.

Acceptance: migrations are reviewable and repeatable; cross-account reads/writes fail; users cannot forge paid status, roles, or scores. Do not blindly run destructive schema synchronization on live data.

## 5. Persist history and build truthful statistics

1. Replace single-attempt session storage with durable, user-owned attempt history. Avoid importing anonymous mistakes into an unrelated authenticated account.
2. Derive recent activity, accuracy, time, streaks, and weak modules from completed attempts. Define timezone and incomplete-attempt handling.
3. Display human-readable module names and meaningful empty states for new users.
4. Verify refresh, another browser, and a second account; retrying a submission must not duplicate history.

Acceptance: completing a quiz updates history and stats, persists across devices, and remains isolated by user.

## 6. Complete visible student-facing fixes

1. Build `/[locale]/exams` so the sidebar destination works. Start with a polished preparation state and available filters; attach the timed simulator after stage 3. Use an official countdown only when a verified date exists.
2. Replace the depot PDF browser alert with an accessible modal or status badge. Say the document is being prepared unless faculty validation is actually established.
3. Put pricing in one shared source. The requested annual price is **4 500 DA / an**; confirm other plans before changing their amounts. Synchronize landing and subscription pages.
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

## Suggested next prompt

“Read AGENTS.md, docs/AUTH_SETUP.md and docs/AI_HANDOFF.md in MedQcm. Start with stage 2: verify and finish the live authentication flows on https://qcmmed.vercel.app using my controlled test accounts. Preserve existing changes, never expose credentials, and tell me which checks require my browser interaction. Then report the evidence and propose the next milestone.”
