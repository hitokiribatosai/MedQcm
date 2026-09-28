"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { getYearData } from "@/lib/data/curriculum-metadata";

export default function YearModulesPage() {
  const { yearId } = useParams<{ yearId: string }>();
  const locale = useLocale();
  const en = locale === "en";
  const year = getYearData(Number(yearId));
  const [catalog, setCatalog] = useState<Record<string, { question_count: number; reviewed: boolean }>>({});
  useEffect(() => {
    let active = true;
    fetch("/api/modules")
      .then((response) => response.ok ? response.json() : [])
      .then((rows: { module_id: string; question_count: number; reviewed: boolean }[]) => {
        if (active) setCatalog(Object.fromEntries(rows.map((row) => [row.module_id, row])));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!year) return (
    <section className="max-w-3xl mx-auto card p-8 space-y-4">
      <h1 className="text-2xl font-bold">{en ? "Year not found" : "Année introuvable"}</h1>
      <Link className="underline" href={`/${locale}/years`}>{en ? "Back to years" : "Retour aux années"}</Link>
    </section>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-12">
      <Link className="underline text-sm" href={`/${locale}/years`}>
        ← {en ? "All years" : "Toutes les années"}
      </Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{year.label}</h1>
        <p>
          {en
            ? "Draft study structure for Oran. The faculty syllabus and course list still need verification."
            : "Structure de révision provisoire pour Oran. Le programme de la faculté et la liste des cours restent à vérifier."}
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {en
            ? "Available QCMs are unreviewed examples; they are not official exam questions."
            : "Les QCMs disponibles sont des exemples non relus ; ce ne sont pas des questions d’examen officielles."}
        </p>
      </header>
      {year.categories.map((category) => (
        <section key={category.id} className="space-y-3" aria-labelledby={category.id}>
          <h2 id={category.id} className="text-xl font-bold">{category.nameFr}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {category.modules.map((module) => (
              <article key={module.id} className="card p-5 space-y-3">
                <h3 className="font-bold">{module.nameFr}</h3>
                <p className="text-sm">{module.descriptionFr}</p>
                {(catalog[module.id]?.question_count ?? module.availableQuestionCount) > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm">{catalog[module.id]?.question_count ?? module.availableQuestionCount} {catalog[module.id]?.reviewed ? (en ? "reviewed questions" : "questions relues") : (en ? "sample questions" : "questions exemples")}</p>
                    <Link className="btn-primary inline-flex" href={`/${locale}/quiz/${module.id}?mode=exploration`}>
                      {catalog[module.id]?.reviewed ? (en ? "Start QCM" : "Commencer le QCM") : (en ? "Try sample QCMs" : "Essayer les QCMs exemples")}
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{en ? "QCMs in preparation" : "QCMs en préparation"}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
      <Link className="btn-secondary inline-flex" href={`/${locale}/exams`}>
        {en ? "See mock exams" : "Voir les examens blancs"}
      </Link>
    </div>
  );
}
