const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
import fs from "node:fs";
import assert from "node:assert/strict";

const db = new PGlite();
const student = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key,raw_app_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
  $$;
  grant usage on schema auth to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  insert into auth.users(id) values('${student}'),('${other}');
  create schema storage;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to authenticated;
  grant select,insert on storage.objects to authenticated;
  create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
`);
for (const file of [
  "202609180001_quiz_history.sql",
  "202609180002_training_catalog.sql",
  "202609190001_session_recovery.sql",
  "202609190002_receipts_subscriptions.sql",
  "202609280001_learning_progress.sql",
]) await db.exec(fs.readFileSync("supabase/migrations/" + file, "utf8"));

async function asUser(id) {
  await db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';`);
}
await asUser(student);
const first = "33333333-3333-4333-8333-333333333333";
await db.query("select public.start_training_attempt($1,'mod-y1-anat-general','practice',3,false)", [first]);
await db.query("select public.finish_training_attempt($1,$2)", [first, JSON.stringify({q1:["opt1"]})]);
const progress = (await db.query("select * from public.training_module_progress()")).rows;
assert.equal(progress.length, 1);
assert.equal(Number(progress[0].sessions), 1);
assert.equal(Number(progress[0].questions_presented), 3);
assert.equal(Number(progress[0].catalog_questions), 3);
let queue = (await db.query("select * from public.training_review_queue(null)")).rows;
assert.equal(queue.length, 3);
assert.equal(queue.filter((item) => item.status === "wrong").length, 1);
assert.equal(queue.filter((item) => item.status === "unanswered").length, 2);
assert.equal((await db.query("select * from public.available_training_exams()")).rows.length, 0);
await db.exec("reset role");
assert.equal((await db.query("select questions->0->>'source' as source from public.training_catalog where module_id='mod-y1-anat-general'")).rows[0].source, "Exemple non validé");
await assert.rejects(db.exec("update public.training_catalog set exam_ready=true where module_id='mod-y1-anat-general'"));
await asUser(student);

const review = "44444444-4444-4444-8444-444444444444";
const attempt = (await db.query("select * from public.start_review_attempt($1,'mod-y1-anat-general',3)", [review])).rows[0];
assert.equal(attempt.review_attempt, true);
assert.equal(attempt.question_count, 3);
assert.deepEqual(new Set(attempt.questions.map((q) => q.id)), new Set(["q1","q2","q3"]));
const correct = Object.fromEntries(attempt.questions.map((q) => [q.id, q.options.filter((o) => o.isCorrect).map((o) => o.id)]));
await db.query("select public.finish_training_attempt($1,$2)", [review, JSON.stringify(correct)]);
queue = (await db.query("select * from public.training_review_queue(null)")).rows;
assert.equal(queue.length, 0);

await asUser(other);
assert.equal((await db.query("select * from public.training_module_progress()")).rows.length, 0);
assert.equal((await db.query("select * from public.training_review_queue(null)")).rows.length, 0);
await assert.rejects(db.query("select public.start_review_attempt($1,'mod-y1-anat-general',3)", [review]));
await db.exec(`reset role;update public.training_catalog
  set reviewed_at=now(),reviewed_by='${student}',source_reference='Controlled test source',exam_ready=true
  where module_id='mod-y1-anat-general'`);
await asUser(student);
assert.equal((await db.query("select * from public.available_training_exams()")).rows.length, 1);
await db.exec("reset role;update public.training_catalog set questions=questions||jsonb_build_array(questions->0) where module_id='mod-y1-anat-general'");
await asUser(student);
assert.equal((await db.query("select * from public.available_training_exams()")).rows.length, 0);
console.log("PASS: owner-scoped module progress, latest mistakes, review retry, correction removal, and approved exam discovery");
await db.close();
