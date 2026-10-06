# MedQCM launch checklist

This is an acceptance checklist, not a claim that the site is ready for public or paid launch. Keep `payment_configuration.accepting_payments=false` until the payment items below pass. The six current QCMs are unreviewed samples and no course PDFs are published.

## Verified on 2026-10-06

- Three additive learning, private QCM draft, and question-report migrations applied in order to the live Supabase project after owner approval. Database checks preserved 3 accounts and 5 attempts; payment collection remains closed with 0 receipts.
- GitHub CI passed for app commit `a9653d5`; Vercel reports that commit deployed, and Cloudflare deployed its Worker bundle. Local, Cloudflare, and Vercel route/access smoke tests each passed 5/5. The signed-in admin overview loaded real counts on both domains. Cloudflare loaded module progress, mistake review, the draft editor, and the empty report queue.
- The auth URL allowlist includes both production domains' callback and password-reset paths. Fresh registration, confirmation, password recovery, second-student isolation, a real Storage upload, and receipt approval/expiry are **not yet accepted** in production. The free Supabase project has no scheduled backups.

## Release gate

1. Confirm the Supabase project is running, the private `payment-receipts` bucket exists, and the numbered SQL migrations in `supabase/migrations/` match the live schema. Existing production migrations were applied manually; do not rerun them blindly or use the old Drizzle scaffold.
2. Run `npm ci`, TypeScript, lint, unit/database tests and a production build. Run `TEST_APP_URL=<preview URL> node --test tests/auth-routes.test.mjs` against both the Next.js and Cloudflare Workers builds.
3. Deploy a commit to Vercel and Cloudflare. Verify the exact commit in each provider, then check `/fr`, `/en`, login, protected-route redirects, admin gating, dashboard, quiz, history, review and stats. Check desktop and mobile navigation.
4. Test with **two owner-controlled student accounts and one admin account**. The owner enters credentials and follows confirmation/recovery email links. Test registration, confirmation, login, profile save/reload, password change, password recovery and logout in both languages. Confirm one student cannot read another's attempts or reports.
5. In a staging project, or a controlled production test explicitly agreed by the owner, submit a clearly marked dummy receipt, verify only its owner and admin can access the private proof, approve/reject, retry review, and test entitlement expiry and premium access. Keep public collection closed while testing.
6. Record the outcome, dates, URLs and account roles used for tests without recording passwords, proof images or private identifiers in Git.

## Content gate

- Obtain the applicable Oran University academic-year programme and faculty-approved year → module → course mapping. The current map is draft navigation.
- Obtain permission to publish each PDF, with its author/faculty, title, version and source. Build a private upload, review and publish workflow before showing any document to students.
- Obtain a medically reviewed QCM bank with answer keys, explanations, provenance, reviewer and review date. Resolve disputed reports and approve scoring rules before marking any catalog row `exam_ready=true`.
- Pilot a small reviewed set, including timed and interrupted sessions, before expanding the catalog.

## Business and operations gate

- Confirm the legal operator name, contact address, support inbox, privacy policy, terms and refund process with local counsel as appropriate. Do not invent this information in public pages.
- Confirm receipt destination, any CCP/BaridiMob account details, prices, plan scope, September-to-September renewal and semester boundaries. Existing 365/180-day database defaults are provisional. Define the exact server-side entitlement rules before opening payments.
- Define receipt retention, orphan-upload cleanup, rate/size limits and incident handling. PDF/JPG/PNG MIME checks are not malware scanning.
- Arrange scheduled database and Storage backups with a **tested restore**. The current Supabase dashboard reports no scheduled backups on the free project; a paused project interrupts auth and data-backed features. Decide whether paid hosting or an independent export procedure is needed before public launch.
- Add uptime/error alerts for both deployments and Supabase, verify SMTP delivery limits, and run a small invited pilot. Recheck accessibility, mobile layouts, translations and load behavior with real content.

## Safe rollback

For an app regression, redeploy the previous known-good commit. For database defects, make an additive correcting migration after inspecting live data; do not drop attempts, reports, receipts or entitlements to roll back. Restore from a verified backup only with an agreed data-loss window.
