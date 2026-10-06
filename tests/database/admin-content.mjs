const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
import fs from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite();
const student = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const admin = '77777777-7777-4777-8777-777777777777';
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
  insert into auth.users values('${admin}','{"role":"admin"}');
  create schema storage;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to authenticated;
  grant select,insert on storage.objects to authenticated;
  create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
`);
for (const file of [
  '202609180001_quiz_history.sql','202609180002_training_catalog.sql',
  '202609190001_session_recovery.sql','202609190002_receipts_subscriptions.sql',
  '202609280001_learning_progress.sql','202610050001_admin_questions.sql',
  '202610050002_question_reports.sql',
]) await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8'));

async function asUser(id) {
  await db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';`);
}
const draft = {
  id:'test-draft-1',questionText:'What is the clinically relevant example?',
  explanation:'Draft answer, not medically reviewed.',source:'Unverified test source',difficulty:'medium',
  options:[{id:'answer-a',text:'Option A',isCorrect:true},{id:'answer-b',text:'Option B',isCorrect:false}],
};
await asUser(student);
await assert.rejects(db.query('select * from public.admin_question_drafts()'));
await assert.rejects(db.query('select * from public.question_drafts'));
await assert.rejects(db.query('select public.admin_upsert_question_draft($1,$2,$3)',
  ['mod-y1-anat-general','Anatomie',JSON.stringify(draft)]));
await asUser(admin);
await db.query('select public.admin_upsert_question_draft($1,$2,$3)',
  ['mod-y1-anat-general','Anatomie',JSON.stringify(draft)]);
assert.equal((await db.query('select * from public.admin_question_drafts()')).rows.length,1);
const metrics=(await db.query('select public.admin_overview_metrics() as result')).rows[0].result;
assert.equal(Number(metrics.private_drafts),1);
assert.equal(Number(metrics.sample_questions),6);
await db.exec('reset role');
assert.equal((await db.query("select jsonb_array_length(questions) as n from public.training_catalog where module_id='mod-y1-anat-general'")).rows[0].n,3);

await asUser(student);
const attemptId='33333333-3333-4333-8333-333333333333';
await db.query("select * from public.start_training_attempt($1,'mod-y1-anat-general','practice',3,false)",[attemptId]);
await db.query('select * from public.finish_training_attempt($1,$2)',[attemptId,'{}']);
const reportId='55555555-5555-4555-8555-555555555555';
const report=(await db.query('select * from public.submit_question_report($1,$2,$3,$4,$5)',
  [reportId,attemptId,'q1','correction_error','The answer should be checked.'])).rows[0];
assert.equal(report.user_id,student);
assert.equal(report.question_text.length>10,true);
assert.equal((await db.query('select * from public.question_reports')).rows.length,1);
await asUser(other);
assert.equal((await db.query('select * from public.question_reports')).rows.length,0);
await assert.rejects(db.query('select * from public.submit_question_report($1,$2,$3,$4,$5)',
  ['66666666-6666-4666-8666-666666666666',attemptId,'q1','typo','This is another user.']));
await asUser(admin);
const resolved=(await db.query('select * from public.resolve_question_report($1,$2)',[reportId,'Reviewed in test'])).rows[0];
assert.equal(resolved.status,'resolved');
assert.equal(resolved.reviewed_by,admin);
assert.equal((await db.query('select * from public.question_reports')).rows.length,1);
await db.close();
console.log('PASS: private drafts, real admin metrics, owner-only reports and audited resolution');
