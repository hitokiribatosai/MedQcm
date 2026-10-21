// Trusted process, outside the web runtime. Never put its service key in NEXT_PUBLIC_*.
import { createClient } from "@supabase/supabase-js";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const url = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw Error("Set server-only SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const binary = process.env.CLAMSCAN_BIN || "clamscan";
// An unavailable scanner must never mark a file clean.
const { stdout: version } = await exec(binary, ["--version"], {
  timeout: 10000,
});
const maximum = Math.min(
  100,
  Math.max(1, Number(process.env.SCAN_BATCH_SIZE) || 10),
);
for (let i = 0; i < maximum; i++) {
  const { data: job, error } = await db.rpc("claim_document_job");
  if (error) throw Error("Cannot claim scan job");
  if (!job) break;
  const dir = await mkdtemp(join(tmpdir(), "medqcm-scan-"));
  let clean = false,
    hash = null,
    failure = "Scan failed";
  try {
    const { data: blob, error: downloadError } = await db.storage
      .from("course-documents")
      .download(job.path);
    if (downloadError || !blob) throw Error("Download unavailable");
    if (blob.size !== job.size_bytes || blob.size < 5 || blob.size > 26214400)
      throw Error("Size mismatch");
    const bytes = Buffer.from(await blob.arrayBuffer());
    if (bytes.subarray(0, 5).toString() !== "%PDF-")
      throw Error("Invalid PDF signature");
    const file = join(dir, "document.pdf");
    await writeFile(file, bytes, { mode: 0o600 });
    await exec(binary, ["--no-summary", "--alert-exceeds-max=yes", file], {
      timeout: 300000,
      maxBuffer: 1024 * 1024,
    });
    hash = createHash("sha256").update(bytes).digest("hex");
    clean = true;
  } catch (e) {
    failure =
      e.code === 1
        ? "Scanner rejected the document"
        : "Validation/scanner failure; inspect the trusted worker";
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  const { error: finishError } = await db.rpc("finish_document_job", {
    p_id: job.id,
    p_lease: job.lease,
    p_clean: clean,
    p_hash: hash,
    p_engine: version.trim().slice(0, 200),
    p_error: failure,
  });
  if (finishError)
    throw Error(
      "Scan result not accepted; job will be retried after its lease",
    );
  console.log(
    JSON.stringify({
      documentId: job.id,
      status: clean ? "awaiting_review" : "retry_or_quarantine",
    }),
  );
}
