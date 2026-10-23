import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { database, identities } from "../helpers/database.mjs";
const { db, as, rpc } = await database();
const release = "10000000-0000-4000-8000-000000000001";
const mod = "mod-y1-anat-general",
  second = "mod-y2-cardio";
const command = (domain, action, data) =>
  rpc(`manage_${domain}`, [action, JSON.stringify(data)]);
const expectDenied = async (fn) => assert.rejects(fn);
try {
  await as("student");
  assert.equal((await rpc("curriculum_overview")).modules.length, 111);
  await expectDenied(() => rpc("admin_workspace", ["questions", 0]));
  await expectDenied(() => db.query("select * from public.question_versions"));
  await expectDenied(() => rpc("claim_document_job"));
  const oldId = randomUUID();
  await rpc("start_training_attempt", [oldId, mod, "practice", 3, false]);
  const oldResult = await rpc("finish_training_attempt", [oldId, "{}"]);
  await as("admin");
  await command("curriculum", "verify_release", {
    id: release,
    source: "TEST ONLY programme source",
  });
  const moduleData = {
    id: mod,
    release_id: release,
    study_year: 1,
    category: "Anatomie",
    title: "Anatomie test",
    active: true,
    requires_subscription: false,
  };
  await command("curriculum", "module", moduleData);
  await expectDenied(() =>
    command("curriculum", "module", { ...moduleData, study_year: 2 }),
  );
  const v = await command("question", "create", { module_id: mod });
  const payload = {
    questionText: "Question de test sans valeur médicale ?",
    source: "TEST source",
    explanation: "Test explanation",
    difficulty: "easy",
    options: [
      { id: "aa", text: "A", isCorrect: true },
      { id: "bb", text: "B", isCorrect: false },
    ],
  };
  await command("question", "save", {
    id: v.id,
    payload,
    rights_reference: "Owner permission for testing",
  });
  await command("question", "submit", { id: v.id });
  await expectDenied(() =>
    command("question", "approve", {
      id: v.id,
      note: "Cannot review own question",
    }),
  );
  await as("reviewer");
  await command("question", "approve", {
    id: v.id,
    note: "Reviewed test fixture only",
  });
  await expectDenied(() =>
    command("question", "save", {
      id: v.id,
      payload,
      rights_reference: "Test",
    }),
  );
  await command("question", "publish", { id: v.id });
  await as("student");
  assert.equal(
    (await rpc("curriculum_overview")).modules.find((m) => m.id === mod)
      .question_count,
    1,
  );
  assert.deepEqual(
    (await rpc("get_training_attempt", [oldId])).questions,
    oldResult.questions,
  );
  const liveId = randomUUID();
  await rpc("start_training_attempt", [liveId, mod, "practice", 1, false]);
  await rpc("finish_training_attempt", [liveId, "{}"]);
  await as("admin");
  const exam = await command("exam", "create", {
    module_id: mod,
    title: "Exam test",
    question_count: 1,
    duration_seconds: 300,
    max_attempts: 1,
  });
  await expectDenied(() =>
    command("exam", "publish", { id: exam.id, note: "Self review" }),
  );
  await as("reviewer");
  await command("exam", "publish", { id: exam.id, note: "Test exam approved" });
  await as("student");
  const exId = randomUUID();
  const attempt = await rpc("start_configured_exam", [exId, exam.id]);
  assert.equal(attempt.questions[0].options[0].isCorrect, undefined);
  assert.equal(
    new Date(attempt.deadline_at) - new Date(attempt.started_at),
    300000,
  );
  assert.equal((await rpc("start_configured_exam", [exId, exam.id])).id, exId);
  await expectDenied(() =>
    rpc("start_configured_exam", [randomUUID(), exam.id]),
  );
  await expectDenied(() =>
    rpc("start_training_attempt", [randomUUID(), mod, "exam", 1, false]),
  );
  await rpc("save_training_draft", [
    exId,
    JSON.stringify({ [attempt.questions[0].id]: ["aa"] }),
    0,
    0,
  ]);
  await expectDenied(() => rpc("save_training_draft", [exId, "{}", 0, 0]));
  await as("other");
  await expectDenied(() => rpc("get_training_attempt", [exId]));
  await as("student");
  const result = await rpc("finish_training_attempt", [
    exId,
    JSON.stringify({ [attempt.questions[0].id]: ["aa"] }),
  ]);
  assert.equal(result.correct_count, 1);
  assert.deepEqual(await rpc("finish_training_attempt", [exId, "{}"]), result);
  await as("admin");
  const next = await command("question", "create", {
    module_id: mod,
    question_id: v.question_id,
  });
  await command("question", "save", {
    id: next.id,
    payload: {
      ...payload,
      questionText: "Changed question with a new version?",
    },
    rights_reference: "Test source permission",
  });
  await command("question", "submit", { id: next.id });
  await as("reviewer");
  await command("question", "approve", {
    id: next.id,
    note: "Reviewed revised fixture",
  });
  await command("question", "publish", { id: next.id });
  await command("question", "withdraw", {
    id: v.id,
    note: "Correction required in previous version",
  });
  await as("student");
  assert.equal((await rpc("attempt_content_notices", [liveId])).length, 1);
  assert.equal(
    (await rpc("get_training_attempt", [exId])).questions[0].questionText,
    payload.questionText,
  );
  console.log(
    "PASS: curriculum IDs, isolated version workflow, independent review, immutable attempts, private exam keys, retry limits and conflict handling",
  );

  await as("admin");
  await command("curriculum", "module", {
    ...moduleData,
    requires_subscription: true,
  });
  await command("curriculum", "module", {
    id: second,
    release_id: release,
    study_year: 2,
    category: "Cardio",
    title: "Cardiologie",
    requires_subscription: true,
    active: true,
  });
  const start = new Date(Date.now() - 86400000).toISOString(),
    end = new Date(Date.now() + 86400000 * 30).toISOString();
  const period = await command("offer", "period", {
    title: "TEST academic period",
    starts_at: start,
    ends_at: end,
  });
  const offer = await command("offer", "offer", {
    title: "TEST one year",
    release_id: release,
    period_id: period.id,
    scope: "year",
    amount: 1234,
    terms: "Test terms only; not a real product.",
  });
  await command("offer", "activate", { id: offer.id, active: true });
  await as("student");
  assert.equal(await rpc("can_access_module", [mod]), false);
  await expectDenied(() =>
    rpc("start_training_attempt", [randomUUID(), mod, "practice", 1, false]),
  );
  await expectDenied(() => rpc("start_review_attempt", [randomUUID(), mod, 1]));
  const receiptId = randomUUID(),
    path = `${identities.student}/${receiptId}/receipt.pdf`;
  await db.exec("reset role");
  await db.query(
    "insert into storage.objects(bucket_id,name) values('payment-receipts',$1)",
    [path],
  );
  await as("student");
  await expectDenied(() =>
    rpc("submit_scoped_receipt", [
      receiptId,
      offer.id,
      1,
      null,
      path,
      "TEST-001",
      "Test",
    ]),
  );
  await db.exec(
    "reset role;update public.payment_configuration set accepting_payments=true,instructions='Test only';",
  );
  await as("student");
  const receipt = await rpc("submit_scoped_receipt", [
    receiptId,
    offer.id,
    1,
    null,
    path,
    "TEST-001",
    "Test",
  ]);
  assert.equal(receipt.amount, 1234);
  assert.equal(receipt.coverage.study_year, 1);
  await expectDenied(() =>
    rpc("review_receipt", [
      receiptId,
      "approved",
      "Attempt to approve own receipt",
    ]),
  );
  await as("payments");
  await rpc("review_receipt", [receiptId, "approved", "Verified test proof"]);
  await rpc("review_receipt", [receiptId, "approved", "Repeat"]);
  await expectDenied(() => command("question", "create", { module_id: mod }));
  await as("student");
  assert.equal(await rpc("can_access_module", [mod]), true);
  assert.equal(await rpc("can_access_module", [second]), false);
  const grants = (await rpc("subscription_options")).grants;
  assert.equal(grants.length, 1);
  await db.exec(
    `reset role;update auth.users set raw_app_meta_data='{"role":"student","study_year":2}' where id='${identities.student}'`,
  );
  await as("student");
  assert.equal(await rpc("can_access_module", [second]), false);
  await as("other");
  assert.equal(
    (await db.query("select * from public.access_grants")).rows.length,
    0,
  );
  await as("payments");
  await command("offer", "revoke", {
    id: grants[0].id,
    reason: "Controlled test revocation",
  });
  await as("student");
  assert.equal(await rpc("can_access_module", [mod]), false);
  // Existing attempt remains available after revocation.
  assert.equal((await rpc("get_training_attempt", [exId])).id, exId);
  console.log(
    "PASS: closed collection, scoped receipt approval, stable terms, role separation, idempotence, year boundaries and revocation",
  );

  // Explicit scope boundaries, temporal expiry and direct-write denial.
  await expectDenied(() =>
    db.query("update public.access_grants set ends_at=now()+interval '1 year'"),
  );
  await db.exec("reset role");
  const residency = (
    await db.query(
      "select id from public.curriculum_modules where study_year=8 limit 1",
    )
  ).rows[0].id;
  await db.query(
    "update public.curriculum_modules set requires_subscription=true where id=$1",
    [residency],
  );
  const grantId = randomUUID();
  await db.query(
    "insert into public.access_grants(id,user_id,release_id,scope,starts_at,ends_at) values($1,$2,$3,'all_years',now()-interval '1 day',now()+interval '1 day')",
    [grantId, identities.student, release],
  );
  await as("student");
  assert.equal(await rpc("can_access_module", [mod]), true);
  assert.equal(await rpc("can_access_module", [second]), true);
  assert.equal(await rpc("can_access_module", [residency]), false);
  await db.exec("reset role");
  await db.query(
    "update public.access_grants set scope='module',module_id=$2 where id=$1",
    [grantId, second],
  );
  await as("student");
  assert.equal(await rpc("can_access_module", [mod]), false);
  assert.equal(await rpc("can_access_module", [second]), true);
  await db.exec("reset role");
  await db.query(
    "update public.access_grants set scope='residency',module_id=null where id=$1",
    [grantId],
  );
  await as("student");
  assert.equal(await rpc("can_access_module", [second]), false);
  assert.equal(await rpc("can_access_module", [residency]), true);
  await db.exec("reset role");
  await db.query(
    "update public.access_grants set ends_at=now()-interval '1 second' where id=$1",
    [grantId],
  );
  await as("student");
  assert.equal(await rpc("can_access_module", [residency]), false);
  console.log(
    "PASS: all-years excludes residency, module-only scope, expiry and direct grant-write denial",
  );

  await as("editor");
  const doc = await command("document", "create", {
    module_id: second,
    title: "Test PDF",
    size_bytes: 100,
    source_reference: "TEST source",
    rights_reference: "TEST permission",
  });
  await db.query(
    "insert into storage.objects(bucket_id,name) values('course-documents',$1)",
    [doc.object_path],
  );
  assert.equal(await rpc("can_read_document", [doc.object_path]), false);
  await command("document", "uploaded", { id: doc.id });
  await expectDenied(() => rpc("claim_document_job"));
  await as("reviewer");
  await expectDenied(() =>
    command("document", "publish", { id: doc.id, note: "No scan yet" }),
  );
  await db.exec("reset role;set role service_role");
  const job = await rpc("claim_document_job");
  assert.equal(job.id, doc.id);
  await expectDenied(() =>
    rpc("finish_document_job", [
      doc.id,
      randomUUID(),
      true,
      "a".repeat(64),
      "test-engine",
      "",
    ]),
  );
  await rpc("finish_document_job", [
    doc.id,
    job.lease,
    true,
    "a".repeat(64),
    "TEST scan evidence",
    "",
  ]);
  await as("reviewer");
  await command("document", "publish", {
    id: doc.id,
    note: "Reviewed test document",
  });
  await as("student");
  assert.equal((await rpc("document_library"))[0].accessible, false);
  await expectDenied(() => rpc("document_download_path", [doc.id]));
  assert.equal(
    (
      await db.query(
        "select * from storage.objects where bucket_id='course-documents'",
      )
    ).rows.length,
    0,
  );
  await as("reviewer");
  assert.equal(await rpc("document_download_path", [doc.id]), doc.object_path);
  await as("editor");
  const crashed = await command("document", "create", {
    module_id: second,
    title: "Crashed scan fixture",
    size_bytes: 100,
    source_reference: "TEST source",
    rights_reference: "TEST permission",
  });
  await db.query(
    "insert into storage.objects(bucket_id,name) values('course-documents',$1)",
    [crashed.object_path],
  );
  await command("document", "uploaded", { id: crashed.id });
  await db.exec("reset role");
  await db.query(
    "update medqcm_private.document_jobs set attempts=5,leased_until=now()-interval '1 minute' where document_id=$1",
    [crashed.id],
  );
  await db.exec("set role service_role");
  assert.equal(await rpc("claim_document_job"), null);
  await db.exec("reset role");
  assert.equal(
    (
      await db.query("select status from public.course_documents where id=$1", [
        crashed.id,
      ])
    ).rows[0].status,
    "scan_failed",
  );
  console.log(
    "PASS: immutable private document upload, service-only leased scan, independent review and download entitlements",
  );
} finally {
  await db.close();
}
