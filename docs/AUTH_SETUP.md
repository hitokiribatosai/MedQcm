# Authentication setup and verification

## Configuration

Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local and the deployment environment. Use the Supabase public/anon key, never a service-role key. This change needs no custom table migration: editable profile fields are stored in the authenticated user's Supabase user_metadata.

In Supabase Auth URL configuration, set the production Site URL and allow the application's /auth/callback URL (including its locale and next query parameters), plus localhost callbacks for development. Enable email/password authentication and email confirmation. Configure production SMTP. Enable Google and configure its provider credentials only if Google login is desired.

Registration, OAuth and password recovery use the SSR PKCE callback. Keep the confirmation/recovery email templates compatible with Supabase's ConfirmationURL. The PKCE verifier is stored in the initiating browser: complete these flows in that browser; expired links or a different browser may require requesting a fresh link.

Password recovery returns through /auth/callback?locale=fr&next=/fr/reset-password (or en). Configure your Supabase password policy consistently with the form's minimum of eight characters. If secure password change requires reauthentication, Supabase's error is displayed; the user must sign in again before retrying.

## Roles and boundaries

Only auth.users.raw_app_meta_data.role = "admin" grants administrator access. Assign this to a verified account through a trusted Supabase administrative operation. Never put privileges in user_metadata, email matching, a browser cookie, or a public signup form. Existing demo cookies grant no access.

The proxy verifies users and refreshes cookies. Server layouts independently guard the student and admin areas. Future APIs and server actions must call requireUser/requireAdmin at the data operation; a layout is not sufficient protection for an API.

This sprint does not connect the existing mock question/payment tables. Before exposing those through Supabase's data API, add migrations, grants, and tested row-level security policies. Never use editable profile metadata to decide subscription access or roles. The Drizzle users.role column is not the authentication role source in this implementation.

Email is read-only in the profile. Name, avatar, faculty, year and preferences persist in Supabase metadata. Existing anonymous localStorage profiles are intentionally not imported into real accounts. Preference persistence does not implement the separate future notification-delivery feature.

## Verification

- Run node --experimental-strip-types --test tests/auth-policy.test.mjs (Node 22.6+), npx tsc --noEmit, and npm run build with the public Supabase configuration.
- With a local built server running, run TEST_APP_URL=http://localhost:3100 node --experimental-strip-types --test tests/*.test.mjs to check real route responses against forged demo cookies and unsafe logout requests. Use a local test instance only.
- Register a test account, complete confirmation, sign in, and verify wrong passwords fail.
- Verify a student cannot open /fr/admin, including with forged demo_session/demo_role cookies or user_metadata.role set to admin.
- Verify a trusted admin can access the admin area and sees the admin sidebar link.
- Save a profile, reload and sign in from another browser: the values should persist. Another account must see its own profile.
- Change a password: mismatched confirmation must fail; the old password must fail on a fresh login and the new password must work.
- Request password recovery and complete it in the initiating browser. Expired/invalid callbacks must show an error.
- Sign out and confirm protected pages redirect to login. GET /api/auth/logout must not mutate a session; cross-origin POST must fail.

## Live configuration — 2026-09-17

- Repository implementation: commit `06442f2` on `main`.
- Public website: https://qcmmed.vercel.app (French `/fr`, English `/en`).
- Supabase project: MedQcm (`ieancvwcctvnvgbimfhs`).
- Site URL saved and verified: `https://qcmmed.vercel.app`.
- Five exact redirect URLs added and verified:
  - `https://qcmmed.vercel.app/auth/callback`
  - `https://qcmmed.vercel.app/auth/callback?locale=fr`
  - `https://qcmmed.vercel.app/auth/callback?locale=en`
  - `https://qcmmed.vercel.app/auth/callback?locale=fr&next=/fr/reset-password`
  - `https://qcmmed.vercel.app/auth/callback?locale=en&next=/en/reset-password`
- Five older Vercel redirect entries remain. Assess active deployments before removing them. Localhost callbacks were not added during this production configuration step.
- Local `.env.local` contains the public project configuration and is ignored by Git. Verify matching variables in Vercel before deployment; never commit credentials.
- Public Auth settings: email and signup enabled, email confirmation required, Google disabled. Minimum password length saved as 8.
- Gmail custom SMTP enabled: sender `Medqcm.service@gmail.com`, host `smtp.gmail.com`, port 465. Credentials remain in Supabase.

## Verified results and remaining checks

Supabase accepted a passwordless authentication email request to the owner's mailbox and the owner confirmed inbox receipt. This created a standard test account named MedQCM Email Test; no administrator role was granted. This proves mail delivery for that request, not the application's full registration or password-recovery flow.

The public English landing and login pages returned HTTP 200. Opening the callback without a code redirected to the French login page with an authentication error, as expected. These checks do not establish the exact deployed commit or successful code exchange.

Local type checking, production build, targeted authentication lint, and all four authentication tests passed during implementation. Repository-wide lint has existing failures outside this change.

Still required: live registration/confirmation, password login/change/recovery, profile persistence and account isolation, logout, and positive/negative role checks using controlled test identities. Google login remains disabled in Supabase; the UI option was removed in commit `845ced6`.

On 2026-09-18, the quiz-history tables, owner-scoped read policy, server-scored RPCs and six-question training catalog were applied. See AI_HANDOFF.md for migration details. No payment/storage policies or administrator assignments were applied. Follow [AI_HANDOFF.md](AI_HANDOFF.md) for the next implementation stages.
