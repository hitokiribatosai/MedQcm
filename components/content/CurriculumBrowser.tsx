"use client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useCurriculum } from "@/lib/content/client";
export default function CurriculumBrowser({ year }: { year?: number }) {
  const locale = useLocale(),
    en = locale === "en";
  const { data, error, loading } = useCurriculum();
  const [release, setRelease] = useState("");
  const modules = data.modules.filter(
    (m) =>
      (!release || m.release_id === release) &&
      (!year || m.study_year === year),
  );
  if (loading)
    return (
      <p role="status">
        {en ? "Loading curriculum…" : "Chargement du programme…"}
      </p>
    );
  if (error) return <p role="alert">{error}</p>;
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">
        {year
          ? year === 8
            ? "Résidanat"
            : `${en ? "Study year" : "Année d’étude"} ${year}`
          : en
            ? "Years and modules"
            : "Années et modules"}
      </h1>
      <label className="block">
        {en ? "Curriculum" : "Programme"}
        <select
          className="input block mt-2"
          value={release}
          onChange={(e) => setRelease(e.target.value)}
        >
          <option value="">
            {en ? "All programmes" : "Tous les programmes"}
          </option>
          {data.releases.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title} · {r.academic_period} ·{" "}
              {r.status === "verified"
                ? en
                  ? "Verified"
                  : "Validé"
                : en
                  ? "Draft"
                  : "Provisoire"}
            </option>
          ))}
        </select>
      </label>
      {!year ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...new Set(modules.map((m) => m.study_year))]
            .sort((a, b) => a - b)
            .map((n) => (
              <Link className="card p-6" key={n} href={`/${locale}/years/${n}`}>
                <h2 className="text-xl font-bold">
                  {n === 8 ? "Résidanat" : `${en ? "Year" : "Année"} ${n}`}
                </h2>
                <p>
                  {modules.filter((m) => m.study_year === n).length} modules
                </p>
              </Link>
            ))}
        </div>
      ) : (
        <>
          <Link className="underline" href={`/${locale}/years`}>
            {en ? "All years" : "Toutes les années"}
          </Link>
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((m) => (
              <article className="card p-5 space-y-3" key={m.id}>
                <p className="text-sm">
                  {m.category} ·{" "}
                  {data.releases.find((r) => r.id === m.release_id)?.title}
                </p>
                <h2 className="text-xl font-bold">{m.title}</h2>
                <p>{m.description}</p>
                <p>
                  {m.question_count}{" "}
                  {m.catalog_mode === "sample"
                    ? en
                      ? "unreviewed sample questions"
                      : "questions exemples non relues"
                    : en
                      ? "published questions"
                      : "questions publiées"}
                </p>
                {m.requires_subscription && (
                  <p>
                    {en
                      ? "Eligible subscription required"
                      : "Abonnement correspondant requis"}
                  </p>
                )}
                {data.courses
                  .filter((c) => c.module_id === m.id)
                  .map((c) => (
                    <p key={c.id} className="text-sm">
                      • {c.title}
                    </p>
                  ))}
                {m.question_count > 0 && (
                  <Link
                    className="btn-primary inline-flex"
                    href={`/${locale}/quiz/${m.id}?mode=exploration`}
                  >
                    {en ? "Practice" : "S’entraîner"}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </>
      )}
      {!modules.length && (
        <p>{en ? "No modules available." : "Aucun module disponible."}</p>
      )}
    </section>
  );
}
