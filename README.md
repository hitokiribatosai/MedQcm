# MedQCM

MedQCM is a French/English medical QCM practice app for students in Algeria. It is in a **content pilot**, not a medically validated public launch. The current catalog contains six unreviewed sample questions. The year/module navigation is a draft pending confirmation against the applicable Oran University programme. No course PDFs are published.

## What works

- Supabase email accounts, confirmation, login, recovery, profile metadata and password change.
- Multi-select practice, server-scored results, saved attempts, resume/abandon, timed samples, history, statistics and review of missed questions. Running answer keys stay private.
- Admin-only QCM drafts and a durable question-report review queue. Drafts are not published to students until medical review and a separate publishing workflow exist.
- Private receipt submission, admin review and server-enforced subscription entitlements. **Payment collection is disabled** until recipient, terms and acceptance tests are confirmed.
- Exam discovery for reviewed catalog content. The existing timed questions are labeled as samples, not official exams.

PDF publishing, medically reviewed QCMs, approved exams and paid subscriptions remain pending. Do not present draft navigation or sample content as an official faculty resource.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, `next-intl` and Supabase Auth/Postgres/Storage. Supabase SQL migrations are the database source of truth; the old Drizzle scaffold was removed.

## Local setup

```sh
git clone https://github.com/hitokiribatosai/MedQcm.git
cd MedQcm
npm ci
```

Create `.env.local` with the project's **public** Supabase URL and publishable/anon key (see `lib/supabase/`). Never commit service-role keys or credentials. Apply the numbered SQL migrations in `supabase/migrations/` to a dedicated Supabase project in order; consult [the handoff](docs/AI_HANDOFF.md) before touching an existing production database, where several migrations were already applied manually.

```sh
npm run dev
```

Open `http://localhost:3000/fr` or `/en`.

## Verification

```sh
npx tsc --noEmit
npm run lint -- --quiet
npx next build --webpack
node --experimental-strip-types --test tests/auth-policy.test.mjs tests/quiz-engine.test.mjs
node tests/database/recovery-payments.mjs
node tests/database/learning-progress.mjs
node tests/database/admin-content.mjs
```

The database tests use `@electric-sql/pglite` from dev dependencies. Start the built server and set `TEST_APP_URL` to run `tests/auth-routes.test.mjs`. The current Cloudflare preview is [app.medqcm.workers.dev](https://app.medqcm.workers.dev); [Vercel](https://qcmmed.vercel.app) is a second deployment. Check the deployed revision before interpreting either as current.

For rollout status, accepted limitations and next steps, read [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) and the [launch checklist](docs/LAUNCH_CHECKLIST.md).
