# MedQCM operations and release procedure

## Separate staging

A separate Cloudflare or Vercel URL pointing to production Supabase is not an isolated staging environment. `supabase/config.toml` defines a local disposable Supabase stack. Install Docker and the Supabase CLI, then use `supabase start`; apply pending migrations to the local database, never an implicitly linked production database. `scripts/ops/run-integration.mjs` reads local configuration, builds the site with local public credentials, and runs browser tests with synthetic accounts. It refuses a non-local Supabase URL. `.github/workflows/staging.yml` runs the disposable stack on pull requests without production credentials.

Local prerequisites were not initially present on the development machine. A passing PGlite suite verifies SQL behavior with mocked Auth/Storage schemas; it does not establish real hosted Auth, Storage, SMTP or scanner acceptance. The separate staging job is the next integration gate.

## Release order

1. Back up existing database and Storage; verify that the archive can be decrypted and restored to a separate disposable project.
2. Keep `payment_configuration.accepting_payments=false`. Compare the live schema with the migration files. Historical production migrations were applied manually; reconcile the migration ledger before using CLI pushes. Do not blindly rerun old migrations.
3. Apply `202610200001_curriculum_versions.sql`, `202610200002_access_exams.sql`, then `202610200003_documents_operations.sql`. Verify the sample count, existing attempts/receipts, private buckets and capability functions. No new paid offer is seeded; no medical sample is published by the migration.
4. Deploy the corresponding commit to each selected host, passing `NEXT_PUBLIC_RELEASE_SHA` at build time. Preserve Supabase public configuration and Cloudflare `keep_vars` settings. `/api/health` returns HTTP 200 only if the new database version can be reached.
5. Run role/isolation, publication, timed/recovered quiz, receipt and actual PDF scan acceptance in staging. Test an expired/revoked grant and altered profile year. Use two different accounts for authorship and medical review.
6. Configure the operations environment and enable its workflows only after verifying the credentials, archive destination and failure notifications. Invite a small pilot after the content/legal gates pass.

## Scan worker

Build `ops/scanner.Dockerfile` and run it with server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The worker claims at most `SCAN_BATCH_SIZE` jobs (default 10), validates PDF signature and byte size, invokes ClamAV with current signatures, hashes the immutable bytes, and attests the result with the leased job ID. Failed attempts retry after five minutes, up to five attempts, then require an explicit staff retry. A missing scanner or signature-update failure never approves a document. No service key belongs in the web bundle.

Reviewers download scanned documents through short-lived links. Scanning does not establish source rights or medical correctness. PDFs and receipts remain private, and receipt MIME limits alone are not malware scanning. Use a safe document viewer for manual proof review; do not execute embedded content.

## Encrypted backup and restore

`scripts/ops/backup.mjs create <archive.enc>` invokes the Supabase CLI for roles/schema/data and copies Storage bytes into an AES-256-GCM encrypted archive with checksums. Required private environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BACKUP_DB_URL`, `BACKUP_ENCRYPTION_KEY` (32 random bytes, base64). Store the encryption key separately from the archives. Never commit it or print environment output to logs. Keep PostgreSQL/Supabase tools compatible with the source database.

Supabase's database export and restoration requirements are documented in [the official CLI backup guide](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Auth/Storage schema customizations and migration history require special attention: preserve the repository migrations and validate custom Storage policies after restoration. Restore Auth provider/SMTP configuration separately. This script does not claim to back up hosted service configuration, Vault encryption keys, project secrets, or a transactionally consistent snapshot across database and file storage. Schedule archives during quiet periods and verify referenced file availability.

For a **new, disposable** restore target, set `RESTORE_SUPABASE_URL`, `RESTORE_SERVICE_ROLE_KEY`, `RESTORE_DB_URL`, `RESTORE_CONFIRM_PROJECT` to the target hostname, and `ALLOW_RESTORE=true`, plus the original encryption key. Run `scripts/ops/backup.mjs restore <archive.enc>`. The script refuses its source project, validates archive authentication/checksums, restores SQL and files, then checks file hashes. Run application migrations/policy verification as needed for custom managed-schema changes; do not rerun data migrations blindly. Verify login with synthetic identities, private Storage behavior, counts, grants and completed quiz results. A successful script exit alone does not prove full project recovery.

## Hosted schedules and alerts

`.github/workflows/operations.yml` is off unless repository variable `MEDQCM_OPERATIONS_ENABLED=true`. It runs monitoring/scanning every 15 minutes and backups daily, or manually. Configure protected GitHub environment `production-operations` with:

- Secrets: `OPERATIONS_SUPABASE_URL`, `OPERATIONS_SERVICE_ROLE_KEY`, `BACKUP_DB_URL`, `BACKUP_ENCRYPTION_KEY`.
- Repository variable `MEDQCM_MONITOR_URLS`: comma-separated website origins.
- Confirm GitHub Actions failure notifications reach the responsible owner. A failed job is only useful if someone receives and responds to it.

Archives are encrypted before upload as GitHub artifacts, retained 14 days. Confirm storage/minutes budget and make an independent off-account copy before relying on this for public launch. This initial scheduler has up to a 15-minute scan/health delay; review latency and cost during the pilot. Error traces should contain request identifiers and safe messages, not passwords, keys, receipts or quiz answer bodies.

## Retention, deletion and recovery policy

Receipts are immutable to students. Until the operator approves legal retention and refund rules, do not automatically delete payment evidence or user records. Staff must identify pending/approved receipts, grants and content-authorship references before account deletion. Orphan receipt uploads and abandoned PDF drafts need a reviewed cleanup policy; do not pretend that a scheduled deletion policy has been approved. A compromised or disputed grant can be revoked with an audit reason, without erasing its payment record.

Database request budgets limit authenticated mutation bursts; configure provider-level abuse limits for registration and anonymous endpoints. The architecture is not a proctored examination system. Timed attempts are finalized when read/saved/submitted after expiry, not by an exact-deadline background task. Only server-acknowledged answers survive losing the browser; no offline outbox is implemented.

## 2026-10-22 restore rehearsal

The owner-approved pre-architecture export was encrypted locally. Supabase CLI-generated export commands ran with the native PostgreSQL client and the dashboard-provided CA certificate (`verify-full`) while the container VM downloaded. A separate encrypted snapshot preserved the two custom Storage policies and public-table fingerprints. The archive restored into a disposable local Supabase PostgreSQL 17 instance using its local superuser; managed-schema policies were reapplied separately as required by Supabase's export limitations. All seven public-table fingerprints matched and three accounts/five attempts were present. All three architecture migrations then passed on the restored copy without changing any original attempt field. The new exam columns are intentionally additive. This is a local restoration rehearsal, not proof of a hosted project restore, SMTP configuration recovery or offsite backup availability. Scheduled backups/scanning remain disabled.

The restore tool now passes its target URI explicitly with `psql --dbname`; setting only `PGDATABASE` did not select the URI correctly in the native client. The operations regression test checks this argument.

The supplemental encrypted security snapshot uses an eight-byte `MEDMETA1` header, 12-byte AES-GCM nonce, encrypted JSON and 16-byte authentication tag, using the separately stored backup encryption key. JSON contains `policies`, `triggers` and `fingerprints`. It is a manual supplemental export, not yet part of the scheduled backup tool; future restore drills must preserve custom managed-schema policies separately.

Production rollout completed on 2026-10-23 after the rehearsal. Do not rerun the three architecture migrations. Hosted operations remain disabled pending configuration and acceptance.
