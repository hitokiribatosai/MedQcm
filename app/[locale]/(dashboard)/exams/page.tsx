"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import ReadyExamCard, { type ReadyExam } from "@/components/quiz/ReadyExamCard";
import { useCurriculum } from "@/lib/content/client";
export default function ExamsPage() {
  const locale = useLocale(),
    en = locale === "en";
  const { data } = useCurriculum();
  const [exams, setExams] = useState<ReadyExam[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/exams", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok)
          throw Error(en ? "Exams unavailable" : "Examens indisponibles");
        return r.json();
      })
      .then((d) => {
        if (active) {
          setExams(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [en]);
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">
        {en ? "Mock exams" : "Examens blancs"}
      </h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">{en ? "Loading…" : "Chargement…"}</p>}
      {!loading && !error && !exams.length && (
        <p className="card p-6">
          {en
            ? "No reviewed exam is published yet."
            : "Aucun examen validé n’est encore publié."}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {exams.map((e) => (
          <ReadyExamCard key={e.id} exam={e} locale={locale} />
        ))}
      </div>
      <section className="card p-5 space-y-3">
        <h2 className="font-bold">
          {en ? "Timed samples" : "Exemples chronométrés"}
        </h2>
        <p>
          {en
            ? "Unreviewed sample questions, 90 seconds each."
            : "Questions exemples non relues, 90 secondes par question."}
        </p>
        {data.modules
          .filter((m) => m.catalog_mode === "sample" && m.question_count > 0)
          .map((m) => (
            <Link
              className="block underline"
              key={m.id}
              href={`/${locale}/quiz/${m.id}?mode=exam&sample=1`}
            >
              {m.title}
            </Link>
          ))}
      </section>
    </section>
  );
}
