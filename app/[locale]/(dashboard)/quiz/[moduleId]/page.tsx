"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getModuleData } from "@/lib/data/curriculum";
import {
  isCorrect,
  parseMode,
  questionCount,
  remainingSeconds,
} from "@/lib/quiz/engine";
import type { Attempt } from "@/lib/quiz/types";

export default function QuizPage() {
  const locale = useLocale(),
    en = locale === "en";
  const { moduleId } = useParams<{ moduleId: string }>();
  const params = useSearchParams(),
    router = useRouter();
  const selectedModule = getModuleData(moduleId)?.module;
  const mode = parseMode(params.get("mode"));
  const available = selectedModule?.questions?.length ?? 0;
  const [count, setCount] = useState(() =>
    questionCount(params.get("count"), available),
  );
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const answersRef = useRef<Record<string, string[]>>({});
  const requestId = useRef<string | null>(null);
  const [index, setIndex] = useState(0),
    [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const locked = useRef(false);
  const [finished, setFinished] = useState(false);
  const finish = useCallback(async () => {
    if (!attempt || locked.current) return;
    locked.current = true;
    setBusy(true);
    setFinished(true);
    setError("");
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          id: attempt.id,
          answers: answersRef.current,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.replace(`/${locale}/quiz/results?attempt=${attempt.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      locked.current = false;
      setBusy(false);
    }
  }, [attempt, locale, router]);
  useEffect(() => {
    if (!attempt || mode !== "exam" || finished) return;
    const deadline =
      Date.parse(attempt.started_at) + attempt.question_count * 90000;
    const tick = () => {
      const seconds = remainingSeconds(deadline, Date.now());
      setRemaining(seconds);
      if (seconds === 0) void finish();
    };
    tick();
    const timer = setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [attempt, mode, finished, finish]);
  useEffect(() => {
    if (!attempt || finished) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [attempt, finished]);
  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          id: requestId.current,
          module: moduleId,
          mode,
          count,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAttempt(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start");
    } finally {
      setBusy(false);
    }
  }
  if (!available || mode === "exam")
    return (
      <section className="card p-8 space-y-4">
        <h1 className="text-2xl font-bold">
          {en ? "Session in preparation" : "Session en préparation"}
        </h1>
        <p>
          {en
            ? "This module has no published exam session. Available learning questions can be accessed from the curriculum."
            : "Aucune session d’examen publiée. Les questions d’entraînement disponibles sont accessibles depuis le programme."}
        </p>
        <Link className="btn-primary" href={`/${locale}/years`}>
          {en ? "Back to modules" : "Retour aux modules"}
        </Link>
      </section>
    );
  if (!attempt)
    return (
      <section className="card p-8 space-y-5 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">{selectedModule?.nameFr}</h1>
        <p>
          {en
            ? "Training content — medical review pending. Refreshing an active session abandons its unsaved answers."
            : "Contenu d’entraînement — revue médicale en attente. Actualiser une session abandonne les réponses non enregistrées."}
        </p>
        <label className="block">
          {en ? "Questions" : "Questions"}
          <select
            className="input block mt-2"
            value={count}
            onChange={(e) => {
              setCount(Number(e.target.value));
              requestId.current = null;
            }}
          >
            {Array.from(
              new Set([
                Math.min(20, available),
                Math.min(40, available),
                Math.min(100, available),
              ]),
            ).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            {![
              Math.min(20, available),
              Math.min(40, available),
              Math.min(100, available),
            ].includes(count) && <option value={count}>{count}</option>}
          </select>
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="btn-primary" disabled={busy} onClick={start}>
          {busy ? "…" : en ? "Start training" : "Commencer"}
        </button>
      </section>
    );
  const question = attempt.questions[index],
    selected = answers[question.id] ?? [];
  const revealed = attempt.mode !== "exam" && checked[question.id];
  function toggle(id: string) {
    if (finished || revealed || locked.current) return;
    const next = selected.includes(id)
      ? selected.filter((value) => value !== id)
      : [...selected, id];
    const updated = { ...answersRef.current, [question.id]: next };
    answersRef.current = updated;
    setAnswers(updated);
  }
  return (
    <section className="max-w-3xl mx-auto space-y-5 pb-10">
      <header className="flex justify-between">
        <h1 className="font-bold">{attempt.module_name}</h1>
        <span>
          {index + 1} / {attempt.question_count}
          {remaining !== null
            ? ` · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
            : ""}
        </span>
      </header>
      <p className="text-sm">
        {en
          ? "Select every correct answer. One point for the exact set; otherwise zero."
          : "Sélectionnez toutes les réponses exactes. Un point pour l’ensemble exact ; sinon zéro."}
      </p>
      <article className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">{question.questionText}</h2>
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`flex gap-3 border rounded-xl p-4 ${revealed && option.isCorrect ? "border-green-600" : ""}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              disabled={!!revealed || finished || busy}
              onChange={() => toggle(option.id)}
            />
            <span>{option.text}</span>
          </label>
        ))}
        {revealed && (
          <div
            role="status"
            className="p-4 bg-gray-100 dark:bg-dark-muted rounded-xl"
          >
            <strong>
              {isCorrect(question, selected)
                ? en
                  ? "Correct"
                  : "Correct"
                : en
                  ? "Review this answer"
                  : "À revoir"}
            </strong>
            <p>{question.explanation}</p>
          </div>
        )}
      </article>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-secondary"
          disabled={index === 0 || finished}
          onClick={() => setIndex(index - 1)}
        >
          {en ? "Previous" : "Précédent"}
        </button>
        {attempt.mode !== "exam" && !revealed && (
          <button
            className="btn-secondary"
            disabled={!selected.length || finished}
            onClick={() => setChecked({ ...checked, [question.id]: true })}
          >
            {en ? "Check answer" : "Vérifier"}
          </button>
        )}
        <button
          className="btn-secondary"
          disabled={index === attempt.question_count - 1 || finished}
          onClick={() => setIndex(index + 1)}
        >
          {en ? "Next" : "Suivant"}
        </button>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => void finish()}
        >
          {busy
            ? "…"
            : finished
              ? en
                ? "Retry saving"
                : "Réessayer l’enregistrement"
              : en
                ? "Finish and save"
                : "Terminer et enregistrer"}
        </button>
      </div>
    </section>
  );
}
