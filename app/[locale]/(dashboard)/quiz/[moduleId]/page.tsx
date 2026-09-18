"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getModuleData } from "@/lib/data/curriculum-metadata";
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
  const available = selectedModule?.availableQuestionCount ?? 0;
  const [count, setCount] = useState(() =>
    questionCount(params.get("count"), available),
  );
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const answersRef = useRef<Record<string, string[]>>({});
  const revision = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveFailed = useRef(false);
  const [hasSaveError, setHasSaveError] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [pending, setPending] = useState<
    { id: string; mode: string; module_name: string }[]
  >([]);
  const loadedId = useRef<string | null>(null);
  const saveVersion = useRef(0);
  const resumeId = params.get("attempt");
  const sample = params.get("sample") === "1";
  const requestId = useRef<string | null>(null);
  const [index, setIndex] = useState(0),
    [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const locked = useRef(false);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (resumeId && loadedId.current === resumeId) return;
    let cancelled = false;
    fetch(
      resumeId
        ? `/api/quiz?attempt=${resumeId}`
        : `/api/quiz?module=${moduleId}`,
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (cancelled) return;
        if (!resumeId) {
          setPending(data);
          return;
        }
        if (data.completed_at) {
          router.replace(`/${locale}/quiz/results?attempt=${data.id}`);
          return;
        }
        if (data.abandoned_at) throw new Error("Session abandoned");
        loadedId.current = data.id;
        revision.current = data.draft_revision;
        answersRef.current = data.draft_answers;
        setAnswers(data.draft_answers);
        setIndex(data.draft_index);
        setAttempt(data);
        setSaveStatus(en ? "Saved" : "Enregistré");
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId, moduleId, locale, router, en]);
  function queueSave(updated: Record<string, string[]>, position: number) {
    if (!attempt) return;
    const version = ++saveVersion.current;
    setSaveStatus(en ? "Saving…" : "Enregistrement…");
    saveQueue.current = saveQueue.current
      .then(async () => {
        if (saveFailed.current) return;
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save",
            id: attempt.id,
            answers: updated,
            index: position,
            revision: revision.current,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        revision.current = data.draft_revision;
        if (data.completed_at) {
          router.replace(`/${locale}/quiz/results?attempt=${data.id}`);
          return;
        }
        if (version === saveVersion.current)
          setSaveStatus(en ? "Saved" : "Enregistré");
      })
      .catch(() => {
        saveFailed.current = true;
        setHasSaveError(true);
        setSaveStatus(
          en
            ? "Not saved — reload restores the last server draft."
            : "Non enregistré — actualiser restaure le dernier brouillon serveur.",
        );
      });
  }
  const finish = useCallback(async () => {
    if (!attempt || locked.current) return;
    locked.current = true;
    setBusy(true);
    setFinished(true);
    setError("");
    try {
      await saveQueue.current;
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
      setFinished(false);
      setBusy(false);
    }
  }, [attempt, locale, router]);
  useEffect(() => {
    if (!attempt || attempt.mode !== "exam" || finished) return;
    const deadline = Date.parse(attempt.deadline_at || attempt.started_at);
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
    if (
      !attempt ||
      finished ||
      (!hasSaveError && saveStatus !== (en ? "Saving…" : "Enregistrement…"))
    )
      return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [attempt, finished, hasSaveError, saveStatus, en]);
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
          sample,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      revision.current = data.draft_revision;
      loadedId.current = data.id;
      setAttempt(data);
      router.replace(
        `/${locale}/quiz/${moduleId}?mode=${mode}&sample=${sample ? 1 : 0}&attempt=${data.id}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start");
    } finally {
      setBusy(false);
    }
  }
  if (!available || (mode === "exam" && !sample && !attempt))
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
            ? "Sample content — medical review pending. Saved drafts resume after refresh. Timed sample sessions are for testing, not official exams."
            : "Contenu exemple — revue médicale en attente. Les brouillons enregistrés reprennent après actualisation. Les sessions chronométrées exemples servent aux tests, pas aux examens officiels."}
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
        {pending.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold">
              {en ? "Unfinished sessions" : "Sessions inachevées"}
            </h2>
            {pending.map((item) => (
              <div key={item.id} className="flex gap-3">
                <Link
                  className="underline"
                  href={`/${locale}/quiz/${moduleId}?mode=${item.mode}&attempt=${item.id}`}
                >
                  {en ? "Resume" : "Reprendre"} ({item.mode})
                </Link>
                <button
                  onClick={async () => {
                    const response = await fetch("/api/quiz", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "abandon", id: item.id }),
                    });
                    if (response.ok)
                      setPending((list) =>
                        list.filter((i) => i.id !== item.id),
                      );
                    else
                      setError(
                        en ? "Unable to abandon" : "Impossible d’abandonner",
                      );
                  }}
                >
                  {en ? "Abandon" : "Abandonner"}
                </button>
              </div>
            ))}
          </section>
        )}
        <button
          className="btn-primary"
          disabled={busy || !!resumeId}
          onClick={start}
        >
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
    queueSave(updated, index);
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
      <p role="status">{saveStatus}</p>
      {hasSaveError && !finished && (
        <button
          className="btn-secondary"
          onClick={() => {
            saveFailed.current = false;
            setHasSaveError(false);
            queueSave(answersRef.current, index);
          }}
        >
          {en ? "Retry draft save" : "Réessayer le brouillon"}
        </button>
      )}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-secondary"
          disabled={index === 0 || finished}
          onClick={() => {
            setIndex(index - 1);
            queueSave(answersRef.current, index - 1);
          }}
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
          onClick={() => {
            setIndex(index + 1);
            queueSave(answersRef.current, index + 1);
          }}
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
