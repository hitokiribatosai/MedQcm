import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isCorrect,
  score,
  remainingSeconds,
  questionCount,
  parseMode,
  shuffle,
} from "../lib/quiz/engine.ts";
const q = {
  id: "q",
  options: [
    { id: "a", isCorrect: true },
    { id: "b", isCorrect: true },
    { id: "c", isCorrect: false },
  ],
};
test("multi-select requires exactly the correct set, without duplicates", () => {
  assert.equal(isCorrect(q, ["b", "a"]), true);
  for (const selected of [[], ["a"], ["a", "c"], ["a", "b", "c"], ["a", "a"]])
    assert.equal(isCorrect(q, selected), false);
});
test("unanswered questions stay in the score denominator", () => {
  assert.deepEqual(score([q, { ...q, id: "q2" }], { q: ["a", "b"] }), {
    total: 2,
    correct: 1,
    answered: 1,
    wrong: 0,
    unanswered: 1,
    percent: 50,
  });
  assert.equal(score([], {}).percent, 0);
});
test("deadline catches up after background throttling and never becomes negative", () => {
  assert.equal(remainingSeconds(90000, 1000), 89);
  assert.equal(remainingSeconds(90000, 89999), 1);
  assert.equal(remainingSeconds(90000, 100000), 0);
});
test("count clamps to available content and validates URL parameters", () => {
  for (const value of ["all", null, "-1", "NaN", "2.5", "0", "100"])
    assert.equal(questionCount(value, 3), 3);
  assert.equal(questionCount("2", 3), 2);
  assert.equal(questionCount("20", 0), 0);
  assert.equal(parseMode("garbage"), "exploration");
  assert.equal(parseMode("exam"), "exam");
});
test("shuffle preserves the question set without mutating it", () => {
  const values = [1, 2, 3];
  assert.deepEqual(shuffle(values, () => 0).sort(), values);
  assert.deepEqual(values, [1, 2, 3]);
});
