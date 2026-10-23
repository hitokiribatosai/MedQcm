import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
const exec = promisify(execFile);
const pdf = Buffer.from("%PDF-1.7\nTEST ONLY\n%%EOF");
async function server(handler) {
  const s = createServer(handler);
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  return {
    url: `http://127.0.0.1:${s.address().port}`,
    close: () => new Promise((r) => s.close(r)),
  };
}
const json = (res, data) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
};
test("encrypted backup restores Storage bytes, rejects wrong keys and refuses its source project", async () => {
  const dir = await mkdtemp(join(tmpdir(), "medqcm-ops-test-"));
  const env = {
    ...process.env,
    PATH: `${dir}:${process.env.PATH}`,
    BACKUP_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
    SUPABASE_SERVICE_ROLE_KEY: "test-key",
    BACKUP_DB_URL: "postgresql://test.invalid/test",
  };
  let restored = null;
  const storage = async (req, res) => {
    const url = new URL(req.url, "http://example.test");
    if (url.pathname === "/storage/v1/bucket")
      return json(res, [
        { id: "course-documents", name: "course-documents", public: false },
      ]);
    if (url.pathname === "/storage/v1/bucket/course-documents")
      return json(res, { id: "course-documents", public: false });
    if (url.pathname.includes("/object/list/")) {
      let body = "";
      for await (const b of req) body += b;
      const { offset } = JSON.parse(body);
      return json(
        res,
        offset
          ? []
          : [
              {
                id: "test",
                name: "test.pdf",
                metadata: { mimetype: "application/pdf" },
              },
            ],
      );
    }
    if (url.pathname.includes("/object/")) {
      if (req.method === "POST") {
        const chunks = [];
        for await (const b of req) chunks.push(b);
        restored = Buffer.concat(chunks);
        return json(res, { Key: "course-documents/test.pdf" });
      }
      res.setHeader("Content-Type", "application/pdf");
      return res.end(pdf);
    }
    res.statusCode = 404;
    json(res, { error: "unexpected endpoint" });
  };
  const source = await server(storage),
    target = await server(storage);
  env.SUPABASE_URL = source.url;
  try {
    await writeFile(
      join(dir, "supabase"),
      `#!/usr/bin/env node\nrequire('node:fs').writeFileSync(process.argv[process.argv.indexOf('-f')+1], '-- TEST DATABASE DUMP');`,
      { mode: 0o700 },
    );
    await writeFile(
      join(dir, "psql"),
      "#!/usr/bin/env node\nconst i=process.argv.indexOf('--dbname');process.exit(i>0 && process.argv[i+1]==='postgresql://test.invalid/target' ? 0 : 1);",
      { mode: 0o700 },
    );
    const archive = join(dir, "backup.enc"),
      script = resolve("scripts/ops/backup.mjs");
    await exec(process.execPath, [script, "create", archive], { env });
    assert.equal(
      (await readFile(archive)).includes(pdf),
      false,
      "private bytes must be encrypted",
    );
    const restore = {
      ...env,
      RESTORE_SUPABASE_URL: target.url,
      RESTORE_SERVICE_ROLE_KEY: "test-key",
      RESTORE_DB_URL: "postgresql://test.invalid/target",
      RESTORE_CONFIRM_PROJECT: new URL(target.url).host,
      ALLOW_RESTORE: "true",
    };
    await assert.rejects(
      exec(process.execPath, [script, "restore", archive], {
        env: {
          ...restore,
          BACKUP_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
        },
      }),
    );
    await assert.rejects(
      exec(process.execPath, [script, "restore", archive], {
        env: {
          ...restore,
          RESTORE_SUPABASE_URL: source.url,
          RESTORE_CONFIRM_PROJECT: new URL(source.url).host,
        },
      }),
    );
    await exec(process.execPath, [script, "restore", archive], {
      env: restore,
    });
    assert.ok(
      restored?.includes(pdf),
      "restored multipart body contains original bytes",
    );
  } finally {
    await source.close();
    await target.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test("scanner failure cannot attest a clean PDF and successful scan carries hash and lease", async () => {
  const dir = await mkdtemp(join(tmpdir(), "medqcm-scan-test-"));
  let finish = null;
  const api = await server(async (req, res) => {
    if (req.url.includes("claim_document_job"))
      return json(res, {
        id: "test-document",
        path: "test.pdf",
        size_bytes: pdf.length,
        lease: "test-lease",
      });
    if (req.url.includes("finish_document_job")) {
      let body = "";
      for await (const b of req) body += b;
      finish = JSON.parse(body);
      return json(res, null);
    }
    if (req.url.includes("/object/")) {
      res.setHeader("Content-Type", "application/pdf");
      return res.end(pdf);
    }
    res.statusCode = 404;
    res.end();
  });
  const bin = join(dir, "clamscan"),
    script = resolve("scripts/ops/scan-documents.mjs");
  const env = {
    ...process.env,
    SUPABASE_URL: api.url,
    SUPABASE_SERVICE_ROLE_KEY: "test-key",
    CLAMSCAN_BIN: bin,
    SCAN_BATCH_SIZE: "1",
  };
  try {
    await writeFile(
      bin,
      `#!/usr/bin/env node\nif(process.argv.includes('--version'))console.log('TEST scanner');else process.exit(1);`,
      { mode: 0o700 },
    );
    await exec(process.execPath, [script], { env });
    assert.equal(finish.p_clean, false);
    assert.equal(finish.p_hash, null);
    await writeFile(
      bin,
      `#!/usr/bin/env node\nif(process.argv.includes('--version'))console.log('TEST scanner');`,
      { mode: 0o700 },
    );
    await exec(process.execPath, [script], { env });
    assert.equal(finish.p_clean, true);
    assert.match(finish.p_hash, /^[a-f0-9]{64}$/);
    assert.equal(finish.p_lease, "test-lease");
  } finally {
    await api.close();
    await rm(dir, { recursive: true, force: true });
  }
});
