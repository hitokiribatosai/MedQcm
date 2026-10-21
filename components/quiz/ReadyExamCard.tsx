"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export type ReadyExam = {
  id: string;
  module_id: string;
  module_name: string;
  question_count: number;
  duration_seconds: number;
  max_attempts: number;
  accessible: boolean;
};
export default function ReadyExamCard({
  exam,
  locale,
}: {
  exam: ReadyExam;
  locale: string;
}) {
  const router = useRouter(),
    en = locale === "en";
  const id = useRef<string | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    id.current ??= crypto.randomUUID();
    try {
      const r = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startExam",
          id: id.current,
          exam: exam.id,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      router.push(`/${locale}/quiz/${exam.module_id}?attempt=${d.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setBusy(false);
    }
  }
  return (
    <article className="card p-5 space-y-3">
      <h3 className="font-bold">{exam.module_name}</h3>
      <p>
        {exam.question_count} QCM · {exam.duration_seconds / 60} min
      </p>
      <p>
        {exam.max_attempts
          ? `${exam.max_attempts} ${en ? "attempts maximum" : "tentatives maximum"}`
          : en
            ? "Unlimited attempts"
            : "Tentatives illimitées"}
      </p>
      <p>
        {en
          ? "Exact-set scoring; corrections after submission."
          : "Barème exact ; corrections après validation."}
      </p>
      {exam.accessible ? (
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => void start()}
        >
          {busy ? "…" : en ? "Start exam" : "Commencer l’examen"}
        </button>
      ) : (
        <Link
          className="btn-secondary inline-flex"
          href={`/${locale}/subscribe`}
        >
          {en ? "Subscription required" : "Abonnement requis"}
        </Link>
      )}
      {error && <p role="alert">{error}</p>}
    </article>
  );
}
