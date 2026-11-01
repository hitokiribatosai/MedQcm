import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { database } from "../helpers/database.mjs";
const { db, as, rpc } = await database();
const moduleId = "mod-y1-cytologie";
const command = (action, data) =>
  rpc("manage_question", [action, JSON.stringify(data)]);
try {
  await as("admin");
  const v = await command("create", { module_id: moduleId });
  await command("save", {
    id: v.id,
    payload: {
      questionText: "Question de test pour la publication ?",
      source: "Source de test",
      explanation: "",
      difficulty: "medium",
      options: [
        { id: "aa", text: "A", isCorrect: true },
        { id: "bb", text: "B", isCorrect: false },
      ],
    },
  });
  const req = {
    id: v.id,
    note: "Owner authorization recorded for test content only",
  };
  for (const role of ["student", "editor", "reviewer", "payments"]) {
    await as(role);
    await assert.rejects(() => command("publish_owner", req));
  }
  await as("admin");
  await assert.rejects(() => command("publish_owner", { id: v.id, note: "" }));
  const pub = await command("publish_owner", req);
  assert.equal(pub.status, "published");
  assert.equal(pub.approval_basis, "owner");
  assert.equal(pub.reviewer_id, null);
  assert.equal(pub.reviewed_at, null);
  assert(pub.owner_approved_by);
  await assert.rejects(() => command("publish_owner", req));
  await assert.rejects(() =>
    command("save", { id: v.id, payload: pub.payload }),
  );
  await as("student");
  const m = (await rpc("curriculum_overview")).modules.find(
    (m) => m.id === moduleId,
  );
  assert.equal(m.reviewed, false);
  assert.equal(m.question_count, 1);
  const aid = randomUUID();
  const attempt = await rpc("start_training_attempt", [
    aid,
    moduleId,
    "practice",
    1,
    false,
  ]);
  assert.equal(attempt.questions.length, 1);
  await rpc("finish_training_attempt", [aid, "{}"]);
  const result = await rpc("get_training_attempt", [aid]);
  assert(result.completed_at);
  await rpc("submit_question_report", [
    randomUUID(),
    aid,
    result.questions[0].id,
    "correction_error",
    "Correction proposée dans ce test seulement.",
  ]);
  await as("other");
  await assert.rejects(() => rpc("get_training_attempt", [aid]));
  await assert.rejects(() =>
    rpc("submit_question_report", [
      randomUUID(),
      aid,
      result.questions[0].id,
      "correction_error",
      "Test non autorisé.",
    ]),
  );
  await as("admin");
  const rev = await command("create", {
    question_id: v.question_id,
    module_id: moduleId,
  });
  assert.equal(rev.approval_basis, "independent");
  await db.exec("reset role");
  await db.query(
    "update public.question_versions set review_note='Contrôle extraction : contexte manquant' where id=$1",
    [rev.id],
  );
  await as("admin");
  await assert.rejects(() => command("publish_owner", { ...req, id: rev.id }));
  await command("withdraw", { id: v.id, note: "Test withdrawal" });
  await as("student");
  assert.equal(
    (await rpc("curriculum_overview")).modules.find((m) => m.id === moduleId)
      .question_count,
    0,
  );
  assert((await rpc("get_training_attempt", [aid])).completed_at);
  console.log(
    "Owner publication: roles, review truthfulness, scoring/reporting, isolation, flagged hold, revision and withdrawal passed.",
  );
} finally {
  await db.close();
}
