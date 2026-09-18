// Run with PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node tests/database/quiz.mjs
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(
  `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon; insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');`,
);
for (const file of [
  "202609180001_quiz_history.sql",
  "202609180002_training_catalog.sql",
])
  await db.exec(
    fs.readFileSync(process.cwd() + "/supabase/migrations/" + file, "utf8"),
  );
await db.exec(
  `set role authenticated; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';`,
);
const id = "33333333-3333-4333-8333-333333333333";
const start = await db.query(
  `select (public.start_training_attempt($1,'mod-y1-anat-general','practice',3)).*`,
  [id],
);
assert.equal(start.rows[0].question_count, 3);
const again = await db.query(
  `select (public.start_training_attempt($1,'mod-y1-anat-general','practice',3)).*`,
  [id],
);
assert.equal(again.rows[0].id, id);
const answers = Object.fromEntries(
  start.rows[0].questions.map((q) => [
    q.id,
    q.options.filter((o) => o.isCorrect).map((o) => o.id),
  ]),
);
const saved = await db.query(
  "select (public.finish_training_attempt($1,$2::jsonb)).*",
  [id, JSON.stringify(answers)],
);
assert.equal(saved.rows[0].correct_count, 3);
const retry = await db.query(
  "select (public.finish_training_attempt($1,$2::jsonb)).*",
  [id, "{}"],
);
assert.equal(retry.rows[0].correct_count, 3);
await assert.rejects(
  db.exec("update public.training_attempts set correct_count=0"),
);
await assert.rejects(db.exec("select * from public.training_catalog"));
assert.equal(
  (await db.query("select public.training_summary() as summary")).rows[0]
    .summary.correct,
  3,
);
await db.exec(
  "set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222'",
);
assert.equal(
  (await db.query("select * from public.training_attempts")).rows.length,
  0,
);
await assert.rejects(
  db.query("select public.finish_training_attempt($1,$2::jsonb)", [id, "{}"]),
);
await assert.rejects(
  db.query(
    "select public.start_training_attempt($1,'mod-y1-anat-general','practice',3)",
    [id],
  ),
);
await assert.rejects(
  db.query(
    "select public.start_training_attempt('44444444-4444-4444-8444-444444444444','mod-y1-anat-general','exam',3)",
  ),
);
await db.exec("reset role; set role anon;");
await assert.rejects(db.exec("select * from public.training_attempts"));
console.log(
  "PASS: migration, catalogue, start retry, scoring, immutable completion, ownership, denied direct writes, private catalogue, disabled exams, anonymous denial",
);
await db.close();
