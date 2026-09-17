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

Live account/email tests require a configured Supabase test project and test identities. No production accounts, roles, or settings were changed by the local implementation.

## Project configuration checked on 2026-09-16

- Project: MedQcm (ieancvwcctvnvgbimfhs).
- Local .env.local now contains the project URL and public publishable key; this file is ignored by Git.
- Public Auth settings endpoint returned HTTP 200: email enabled, signup enabled, email confirmation required, Google disabled.
- Minimum password length saved as 8 and verified in the dashboard.
- Gmail custom SMTP configured on 2026-09-17; user confirmed Supabase displayed saved successfully, and the enabled state was verified. Sender: Medqcm.service@gmail.com; host: smtp.gmail.com; port: 465. Email delivery and recovery-flow verification remain pending. Credentials are kept in Supabase, not in the repository.
- Existing Site URL: https://medqcm-rahal-abdelillahs-projects.vercel.app/. Main-domain selection and approval for new callback destinations are pending; no redirect URLs changed yet.
- No users, administrator roles, database tables, or storage policies were changed.

## Email send test — 2026-09-17

Supabase accepted a passwordless authentication email request to Medqcm.service@gmail.com through the configured SMTP service. The request allowed creation of a standard test account (MedQCM Email Test); no administrator role was granted. The user confirmed inbox receipt. This verifies request acceptance, not inbox delivery or the application callback/recovery flow.

The public site https://medqcm-gamma.vercel.app was verified on 2026-09-17. The previously configured main site redirects unauthenticated visitors to Vercel sign-in. Updating the main URL and callback allowlist is pending approval.
