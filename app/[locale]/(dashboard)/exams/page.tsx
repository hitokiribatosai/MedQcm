"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Clock, Search, BookOpen } from "lucide-react";
import { CURRICULUM_DATA } from "@/lib/data/curriculum-metadata";
import ReadyExamCard, { type ReadyExam } from "@/components/quiz/ReadyExamCard";

export default function ExamsHubPage() {
  const locale = useLocale();
  const en = locale === "en";
  const [year, setYear] = useState("all");
  const [search, setSearch] = useState("");
  const [readyExams, setReadyExams] = useState<ReadyExam[]>([]);
  const [examError, setExamError] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/exams")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        return response.json() as Promise<ReadyExam[]>;
      })
      .then((data) => { if (active) setReadyExams(data); })
      .catch(() => { if (active) setExamError(true); });
    return () => { active = false; };
  }, []);
  const modules = CURRICULUM_DATA.filter(
    (item) => year === "all" || String(item.number) === year,
  )
    .flatMap((item) =>
      item.categories.flatMap((category) =>
        category.modules.map((module) => ({ ...module, year: item.number })),
      ),
    )
    .filter((module) =>
      module.nameFr
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Clock className="text-emerald-600" />
          {en ? "Mock exams" : "Examens blancs"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {en
            ? "Choose an available timed exam or test the timer with sample questions."
            : "Choisissez un examen chronométré disponible ou testez le chronomètre avec les questions exemples."}
        </p>
      </header>
      <section className="space-y-3" aria-labelledby="available-exams">
        <h2 id="available-exams" className="text-xl font-bold">{en ? "Available exams" : "Examens disponibles"}</h2>
        {examError && <p role="alert" className="card p-6">{en ? "Exam list is temporarily unavailable." : "La liste des examens est temporairement indisponible."}</p>}
        {!examError && readyExams.length === 0 && <p className="card p-6 border-2 border-amber-200">
          {en ? "No reviewed mock exam is published yet. Questions, scoring, and timing must be verified before release. No official exam date is announced here." : "Aucun examen blanc validé n’est encore publié. Les questions, le barème et le chronomètre doivent être vérifiés avant publication. Aucune date officielle d’examen n’est annoncée ici."}
        </p>}
        <div className="grid sm:grid-cols-2 gap-4">
          {readyExams.map((exam) => <ReadyExamCard key={exam.module_id} exam={exam} locale={locale} />)}
        </div>
      </section>
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex flex-col gap-1 text-sm font-bold">
          {en ? "Year / competition" : "Année / concours"}
          <select
            className="input"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="all">
              {en ? "All years" : "Toutes les années"}
            </option>
            {CURRICULUM_DATA.map((item) => (
              <option key={item.number} value={item.number}>
                {en
                  ? item.number > 6
                    ? "Residency competition"
                    : `Year ${item.number}`
                  : item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold flex-1">
          <span className="flex items-center gap-2">
            <Search size={16} />
            {en ? "Search modules" : "Rechercher une matière"}
          </span>
          <input
            type="search"
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <section className="card p-6 space-y-3">
        <h2 className="font-bold">
          {en ? "Timed sample sessions" : "Sessions exemples chronométrées"}
        </h2>
        <p>
          {en
            ? "Test the timer using sample questions. These are not reviewed mock exams."
            : "Testez le chronomètre avec les questions exemples. Ce ne sont pas des examens blancs validés."}
        </p>
        {CURRICULUM_DATA.flatMap((y) => y.categories.flatMap((c) => c.modules))
          .filter((m) => m.availableQuestionCount)
          .map((m) => (
            <Link
              key={m.id}
              className="block underline"
              href={`/${locale}/quiz/${m.id}?mode=exam&sample=1`}
            >
              {m.nameFr} ({m.availableQuestionCount})
            </Link>
          ))}
      </section>
      <p role="status" className="text-sm text-gray-500">
        {modules.length} {en ? "modules" : "matières"}
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map((module) => (
          <article key={module.id} className="card p-5 space-y-3">
            <BookOpen className="text-emerald-600" size={20} />
            <h2 className="font-bold">{module.nameFr}</h2>
            <p className="text-sm text-gray-500">
              {en
                ? "Exam session in preparation"
                : "Session d’examen en préparation"}
            </p>
          </article>
        ))}
      </div>
      {modules.length === 0 && (
        <p className="card p-6">
          {en
            ? "No modules match these filters."
            : "Aucune matière ne correspond à ces critères."}
        </p>
      )}
      <Link className="btn-secondary inline-flex" href={`/${locale}/years`}>
        {en ? "Browse learning modules" : "Consulter les modules de cours"}
      </Link>
    </div>
  );
}
