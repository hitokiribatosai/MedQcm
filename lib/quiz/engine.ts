export type Mode = "exploration" | "practice" | "exam";
export type Question = {
  id: string;
  questionText: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  source: string;
};
export function parseMode(value: string | null): Mode {
  return value === "exam" || value === "practice" ? value : "exploration";
}
export function questionCount(value: string | null, available: number) {
  if (value === null || value === "all") return available;
  const count = Number(value);
  return Number.isInteger(count) && count > 0
    ? Math.min(count, available)
    : available;
}
export function isCorrect(question: Question, selected: string[]) {
  const expected = question.options
    .filter((option) => option.isCorrect)
    .map((option) => option.id);
  const unique = new Set(selected);
  return (
    expected.length > 0 &&
    selected.length === unique.size &&
    unique.size === expected.length &&
    expected.every((id) => unique.has(id))
  );
}
export function score(
  questions: Question[],
  answers: Record<string, string[]>,
) {
  const correct = questions.filter((question) =>
    isCorrect(question, answers[question.id] ?? []),
  ).length;
  const answered = questions.filter(
    (question) => (answers[question.id] ?? []).length > 0,
  ).length;
  return {
    total: questions.length,
    correct,
    answered,
    wrong: answered - correct,
    unanswered: questions.length - answered,
    percent: questions.length
      ? Math.round((correct * 100) / questions.length)
      : 0,
  };
}
export function remainingSeconds(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
