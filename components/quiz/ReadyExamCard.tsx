"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export type ReadyExam = {
  module_id: string;
  module_name: string;
  question_count: number;
  requires_subscription: boolean;
};

export default function ReadyExamCard({ exam, locale }: { exam: ReadyExam; locale: string }) {
  const en = locale === "en";
  const router = useRouter();
  const [count, setCount] = useState(Math.min(20, exam.question_count));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);

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
          action: "start", id: requestId.current, module: exam.module_id,
          mode: "exam", count, sample: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(`/${locale}/quiz/${exam.module_id}?attempt=${data.id}`);
    } catch {
      setError(en ? "Could not start this exam. Check your access and try again." : "Impossible de commencer cet examen. Vérifiez votre accès et réessayez.");
      setBusy(false);
    }
  }

  return (
    <article className="card p-5 space-y-3">
      <h3 className="font-bold">{exam.module_name}</h3>
      <p className="text-sm">{exam.question_count} {en ? "approved questions available" : "questions disponibles"}</p>
      {exam.requires_subscription && <p className="text-sm">{en ? "Subscription required" : "Abonnement requis"}</p>}
      <label className="block text-sm font-semibold">
        {en ? "Questions in this session" : "Questions de cette session"}
        <select className="input block mt-1" value={count} onChange={(event) => {
          setCount(Number(event.target.value)); requestId.current = null;
        }}>
          {[...new Set([Math.min(10, exam.question_count), Math.min(20, exam.question_count), Math.min(40, exam.question_count), Math.min(100, exam.question_count)])].map((n) =>
            <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <p className="text-xs">{en ? "90 seconds per question. Answers appear after submission." : "90 secondes par question. Les réponses apparaissent après validation."}</p>
      <button className="btn-primary" disabled={busy} onClick={start}>{busy ? "…" : en ? "Start exam" : "Commencer l’examen"}</button>
      {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
    </article>
  );
}
