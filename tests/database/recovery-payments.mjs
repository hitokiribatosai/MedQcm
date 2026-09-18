const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
const student = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222",
  admin = "77777777-7777-4777-8777-777777777777";
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_app_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id) values('${student}'),('${other}');insert into auth.users values('${admin}','{"role":"admin"}');
create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert on storage.objects to authenticated;create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;`);
for (const file of [
  "202609180001_quiz_history.sql",
  "202609180002_training_catalog.sql",
  "202609190001_session_recovery.sql",
  "202609190002_receipts_subscriptions.sql",
])
  await db.exec(fs.readFileSync("supabase/migrations/" + file, "utf8"));
async function asUser(id) {
  await db.exec(
    `reset role;set role authenticated;set request.jwt.claim.sub='${id}';`,
  );
}
await asUser(student);
const id = "33333333-3333-4333-8333-333333333333";
let a = (
  await db.query(
    "select * from public.start_training_attempt($1,'mod-y1-anat-general','exam',3,true)",
    [id],
  )
).rows[0];
assert.equal(a.sample_exam, true);
assert.ok(a.deadline_at);
assert.ok(
  a.questions.every(
    (q) => !("explanation" in q) && q.options.every((o) => !("isCorrect" in o)),
  ),
);
const answers = {
  q1: ["opt2"],
  q2: ["opt21", "opt23", "opt24"],
  q3: ["opt32"],
};
a = (
  await db.query("select * from public.save_training_draft($1,$2,1,0)", [
    id,
    JSON.stringify(answers),
  ])
).rows[0];
assert.equal(a.draft_revision, 1);
assert.equal(a.draft_index, 1);
await assert.rejects(
  db.query("select public.save_training_draft($1,$2,1,0)", [id, "{}"]),
);
assert.deepEqual(
  (await db.query("select * from public.get_training_attempt($1)", [id]))
    .rows[0].draft_answers,
  answers,
);
await assert.rejects(db.exec("select * from medqcm_private.exam_keys"));
await db.exec("reset role");
await db.query(
  "update public.training_attempts set deadline_at=now()-interval '1 second' where id=$1",
  [id],
);
await asUser(student);
a = (
  await db.query("select * from public.finish_training_attempt($1,$2)", [
    id,
    "{}",
  ])
).rows[0];
assert.equal(a.correct_count, 3);
assert.ok(a.questions[0].explanation);
await asUser(other);
await assert.rejects(db.query("select public.get_training_attempt($1)", [id]));
await asUser(student);
const abandoned = "44444444-4444-4444-8444-444444444444";
await db.query(
  "select public.start_training_attempt($1,'mod-y1-anat-general','practice',3,false)",
  [abandoned],
);
await db.query("select public.abandon_training_attempt($1)", [abandoned]);
await assert.rejects(
  db.query("select public.finish_training_attempt($1,$2)", [abandoned, "{}"]),
);
const receipt = "88888888-8888-4888-8888-888888888888",
  path = student + "/" + receipt + "/receipt.pdf";
await assert.rejects(
  db.query("select public.submit_receipt($1,$2,$3,$4,$5)", [
    receipt,
    "annual",
    path,
    "TEST-123",
    "",
  ]),
);
await assert.rejects(
  db.query(
    "insert into storage.objects(bucket_id,name) values('payment-receipts',$1)",
    [path],
  ),
);
await db.exec(
  "reset role;update public.payment_configuration set accepting_payments=true,instructions='Test only';update public.training_catalog set requires_subscription=true where module_id='mod-y2-cardio';",
);
await asUser(student);
await assert.rejects(
  db.exec(
    "select public.start_training_attempt('99999999-9999-4999-8999-999999999999','mod-y2-cardio','practice',1,false)",
  ),
);
await db.query(
  "insert into storage.objects(bucket_id,name) values('payment-receipts',$1)",
  [path],
);
let r = (
  await db.query("select * from public.submit_receipt($1,$2,$3,$4,$5)", [
    receipt,
    "annual",
    path,
    "TEST-123",
    "",
  ])
).rows[0];
assert.equal(r.amount, 4500);
await assert.rejects(
  db.query("select public.review_receipt($1,$2,$3)", [receipt, "approved", ""]),
);
await asUser(other);
assert.equal(
  (await db.query("select * from public.receipt_requests")).rows.length,
  0,
);
assert.equal((await db.query("select * from storage.objects")).rows.length, 0);
await assert.rejects(
  db.query(
    "insert into storage.objects(bucket_id,name) values('payment-receipts',$1)",
    [path],
  ),
);
await asUser(admin);
r = (
  await db.query("select * from public.review_receipt($1,$2,$3)", [
    receipt,
    "approved",
    "checked",
  ])
).rows[0];
assert.equal(r.reviewed_by, admin);
const expiry = (
  await db.query(
    "select expires_at from public.subscription_entitlements where user_id=$1",
    [student],
  )
).rows[0].expires_at;
await db.query("select public.review_receipt($1,$2,$3)", [
  receipt,
  "approved",
  "retry",
]);
assert.equal(
  (
    await db.query(
      "select expires_at from public.subscription_entitlements where user_id=$1",
      [student],
    )
  ).rows[0].expires_at.getTime(),
  expiry.getTime(),
);
await assert.rejects(
  db.query("select public.review_receipt($1,$2,$3)", [receipt, "rejected", ""]),
);
await asUser(student);
assert.equal(
  (await db.query("select public.has_medqcm_subscription() as active")).rows[0]
    .active,
  true,
);
await db.exec(
  "select public.start_training_attempt('99999999-9999-4999-8999-999999999999','mod-y2-cardio','practice',1,false)",
);
await db.exec(
  "reset role;update public.subscription_entitlements set expires_at=now()-interval '1 day';",
);
await asUser(student);
assert.equal(
  (await db.query("select public.has_medqcm_subscription() as active")).rows[0]
    .active,
  false,
);
console.log(
  "PASS: resumable drafts, revision conflicts, private exam keys, deadline scoring, ownership, abandonment, closed payments, private receipt paths, server prices, admin-only atomic approval, idempotence, expiry and premium start enforcement",
);
await db.close();
