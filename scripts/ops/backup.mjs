// Encrypted database + Storage archive. Run only in a trusted environment with Supabase CLI/Docker.
import { createClient } from "@supabase/supabase-js";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  stat,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  randomBytes,
  createHash,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { spawn } from "node:child_process";
import { pipeline } from "node:stream/promises";
const mode = process.argv[2],
  archive = resolve(process.argv[3] || ".backups/medqcm.enc");
const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || "", "base64");
if (!["create", "restore"].includes(mode) || key.length !== 32)
  throw Error(
    "Usage: backup.mjs create|restore archive; set a 32-byte base64 BACKUP_ENCRYPTION_KEY",
  );
const required = (name) => {
  if (!process.env[name]) throw Error(`Missing ${name}`);
  return process.env[name];
};
const run = (program, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(program, args, {
      stdio: ["ignore", "ignore", "pipe"],
      ...options,
    });
    child.stderr.on("data", () => {});
    child.once("error", () => reject(Error(`${program} could not start`)));
    child.once("close", (code) =>
      code === 0
        ? resolve()
        : reject(
            Error(
              `${program} failed; inspect trusted environment (credentials suppressed)`,
            ),
          ),
    );
  });
const hash = async (path) => {
  const h = createHash("sha256");
  for await (const part of createReadStream(path)) h.update(part);
  return h.digest("hex");
};
const dir = await mkdtemp(join(tmpdir(), "medqcm-backup-"));
const tar = join(dir, "archive.tar");
const contents = join(dir, "contents");
await mkdir(contents, { mode: 0o700 });
try {
  if (mode === "create") {
    const url = required("SUPABASE_URL"),
      serviceKey = required("SUPABASE_SERVICE_ROLE_KEY"),
      dbUrl = required("BACKUP_DB_URL");
    const db = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const manifest = {
      format: 1,
      created_at: new Date().toISOString(),
      source: url,
      files: [],
      objects: [],
      buckets: [],
    };
    for (const [name, args] of [
      ["roles.sql", ["--role-only"]],
      ["schema.sql", []],
      [
        "data.sql",
        [
          "--use-copy",
          "--data-only",
          "-x",
          "storage.buckets_vectors",
          "-x",
          "storage.vector_indexes",
        ],
      ],
    ]) {
      const target = join(contents, name);
      await run("supabase", [
        "db",
        "dump",
        "--db-url",
        dbUrl,
        "-f",
        target,
        ...args,
      ]);
      manifest.files.push({ name, sha256: await hash(target) });
    }
    const { data: buckets, error } = await db.storage.listBuckets();
    if (error) throw Error("Cannot list Storage buckets");
    for (const bucket of buckets) {
      manifest.buckets.push({
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types,
      });
      const pending = [""];
      while (pending.length) {
        const prefix = pending.pop();
        for (let offset = 0; ; offset += 100) {
          const { data: items, error: listError } = await db.storage
            .from(bucket.id)
            .list(prefix, {
              limit: 100,
              offset,
              sortBy: { column: "name", order: "asc" },
            });
          if (listError) throw Error("Storage listing failed");
          for (const item of items) {
            const path = prefix ? `${prefix}/${item.name}` : item.name;
            if (!item.id) {
              pending.push(path);
              continue;
            }
            const { data: blob, error: downloadError } = await db.storage
              .from(bucket.id)
              .download(path);
            if (downloadError || !blob) throw Error("Storage download failed");
            const filename = `object-${manifest.objects.length}.bin`,
              target = join(contents, filename);
            await writeFile(target, Buffer.from(await blob.arrayBuffer()), {
              mode: 0o600,
            });
            manifest.objects.push({
              bucket: bucket.id,
              path,
              filename,
              size: blob.size,
              mime:
                item.metadata?.mimetype ||
                blob.type ||
                "application/octet-stream",
              sha256: await hash(target),
            });
          }
          if (items.length < 100) break;
        }
      }
    }
    await writeFile(join(contents, "manifest.json"), JSON.stringify(manifest), {
      mode: 0o600,
    });
    await run("tar", ["-cf", tar, "-C", contents, "."]);
    await mkdir(resolve(archive, ".."), { recursive: true, mode: 0o700 });
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", key, iv);
    const output = createWriteStream(archive, { flags: "wx", mode: 0o600 });
    output.write(Buffer.concat([Buffer.from("MEDQCM01"), iv]));
    await pipeline(createReadStream(tar), cipher, output, { end: false });
    output.end(cipher.getAuthTag());
    await new Promise((r, j) => {
      output.once("finish", r);
      output.once("error", j);
    });
    console.log(
      JSON.stringify({
        status: "encrypted_backup_created",
        databaseFiles: manifest.files.length,
        storageObjects: manifest.objects.length,
      }),
    );
  } else {
    const url = required("RESTORE_SUPABASE_URL"),
      serviceKey = required("RESTORE_SERVICE_ROLE_KEY"),
      dbUrl = required("RESTORE_DB_URL");
    if (
      process.env.RESTORE_CONFIRM_PROJECT !== new URL(url).host ||
      process.env.ALLOW_RESTORE !== "true"
    )
      throw Error(
        "Restore requires explicit target host confirmation and ALLOW_RESTORE=true",
      );
    const size = (await stat(archive)).size;
    const header = Buffer.alloc(20),
      tag = Buffer.alloc(16);
    const { open } = await import("node:fs/promises");
    const fd = await open(archive, "r");
    await fd.read(header, 0, 20, 0);
    await fd.read(tag, 0, 16, size - 16);
    await fd.close();
    if (header.subarray(0, 8).toString() !== "MEDQCM01")
      throw Error("Invalid archive");
    const decipher = createDecipheriv("aes-256-gcm", key, header.subarray(8));
    decipher.setAuthTag(tag);
    await pipeline(
      createReadStream(archive, { start: 20, end: size - 17 }),
      decipher,
      createWriteStream(tar, { mode: 0o600 }),
    );
    await run("tar", ["-xf", tar, "-C", contents]);
    const manifest = JSON.parse(
      await readFile(join(contents, "manifest.json"), "utf8"),
    );
    if (new URL(manifest.source).host === new URL(url).host)
      throw Error("Restore target must be a separate disposable project");
    for (const f of manifest.files)
      if ((await hash(join(contents, f.name))) !== f.sha256)
        throw Error("Database checksum mismatch");
    for (const o of manifest.objects)
      if ((await hash(join(contents, o.filename))) !== o.sha256)
        throw Error("Object checksum mismatch");
    await run("psql", [
      "--dbname",
      dbUrl,
      "--single-transaction",
      "--variable",
      "ON_ERROR_STOP=1",
      "--file",
      join(contents, "roles.sql"),
      "--file",
      join(contents, "schema.sql"),
      "--command",
      "SET session_replication_role = replica",
      "--file",
      join(contents, "data.sql"),
    ]);
    const db = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const bucket of manifest.buckets) {
      const { data } = await db.storage.getBucket(bucket.id);
      if (!data) {
        const { error } = await db.storage.createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes,
        });
        if (error) throw Error("Bucket restore failed");
      } else if (data.public !== bucket.public)
        throw Error("Bucket privacy mismatch");
    }
    for (const o of manifest.objects) {
      const bytes = await readFile(join(contents, o.filename));
      const { error } = await db.storage
        .from(o.bucket)
        .upload(o.path, bytes, { upsert: true, contentType: o.mime });
      if (error) throw Error("Object restore failed");
      const { data, error: readError } = await db.storage
        .from(o.bucket)
        .download(o.path);
      if (
        readError ||
        !data ||
        createHash("sha256")
          .update(Buffer.from(await data.arrayBuffer()))
          .digest("hex") !== o.sha256
      )
        throw Error("Restored object checksum mismatch");
    }
    console.log(
      JSON.stringify({
        status: "restore_completed_verify_auth_and_policies",
        storageObjects: manifest.objects.length,
      }),
    );
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}
