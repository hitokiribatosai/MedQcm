<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MedQCM continuity instructions

These instructions apply to future agents working in this repository. The generated Next.js block above must remain intact.

## Start or resume a session

1. Read `PROJECT_HANDOVER.md` first, then `docs/AI_HANDOFF.md` and `docs/LAUNCH_CHECKLIST.md` where relevant. Read this file as well.
2. Inspect `git status --short --branch`, the current branch and recent commits. Check the relevant source, configuration, migrations and tests before relying on a handover claim. Treat dated production checks as historical evidence, not proof of today's deployment.
3. Briefly tell the owner what is implemented, what remains unverified, and the next sensible task. On a new session, wait for the owner's development request; do not change the app merely because the session started.
4. Continue the current architecture and decisions unless evidence justifies a change. Preserve existing data and unrelated working-tree changes. Never rerun a production SQL migration without checking the live schema and obtaining the needed authorization.

## During development

- Record meaningful features, fixes, decisions, test results and unfinished work in `PROJECT_HANDOVER.md` before ending the session. Keep it navigable; link to detailed docs rather than duplicating them. Separate implementation, local test results and live acceptance.
- Do not invent project details, completed work, tests, deployment status or medical review. Verify claims against code or a named observation.
- Do not add passwords, access tokens, API keys, private credentials, receipt images or other secrets to Git or handover files. Do not make unnecessary changes to working code.
- Read the relevant installed Next.js guide as required by the generated block before changing application code.

## When the owner says “Prepare handover”

1. Review this session's work, the diff, branch, latest commits and uncommitted/untracked files. Preserve unrelated changes.
2. Update `PROJECT_HANDOVER.md` with completed and incomplete work, known issues, decisions, actual validation and prioritized next steps. Update linked specialist docs only when their content changed.
3. Run relevant checks when practical and record their real outcome; do not imply that a skipped check passed.
4. Stage only the intended documentation and appropriate authorized project changes. Check for secrets and inspect the staged diff. Commit on the appropriate branch.
5. Push to the configured GitHub remote when available and authorized by the owner's handover request. Never force-push. If the remote moved, reconcile safely; if push fails, keep the local commit and report the reason.
6. Report the commit hash, branch, remote push result and any remaining uncommitted or unpushed changes. Verify remote synchronization rather than assuming it.
