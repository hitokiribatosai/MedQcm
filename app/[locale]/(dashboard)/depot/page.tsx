"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useCurriculum } from "@/lib/content/client";
import type { CourseDocument } from "@/lib/content/types";
export default function Library() {
  const locale = useLocale(),
    en = locale === "en";
  const { data: curriculum, error: curriculumError } = useCurriculum();
  const [rows, setRows] = useState<CourseDocument[]>([]),
    [year, setYear] = useState(""),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState("");
  const [download, setDownload] = useState<{
    url: string;
    title: string;
  } | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/documents", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (active) {
          setRows(d);
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
  }, []);
  async function open(d: CourseDocument) {
    setBusy(d.id);
    setError("");
    setDownload(null);
    try {
      const r = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      setDownload({ url: data.signedUrl, title: d.title });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">
        {en ? "Course library" : "Bibliothèque des cours"}
      </h1>
      <div className="flex flex-wrap gap-4">
        <label>
          {en ? "Study year" : "Année"}
          <select
            className="input block"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">{en ? "All" : "Toutes"}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n === 8 ? "Résidanat" : n}
              </option>
            ))}
          </select>
        </label>
        <label>
          {en ? "Search" : "Rechercher"}
          <input
            className="input block"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {(error || curriculumError) && (
        <p role="alert">{error || curriculumError}</p>
      )}
      {loading && <p role="status">{en ? "Loading…" : "Chargement…"}</p>}
      {!loading && !error && !rows.length && (
        <p className="card p-6">
          {en
            ? "No reviewed document has been published yet."
            : "Aucun document relu n’est encore publié."}
        </p>
      )}
      {download && (
        <p role="status">
          <a
            className="underline"
            href={download.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {en ? "Download" : "Télécharger"} {download.title}
          </a>{" "}
          — {en ? "link expires in 60 seconds" : "lien valable 60 secondes"}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {rows
          .filter(
            (d) =>
              (!year ||
                curriculum.modules.find((m) => m.id === d.module_id)
                  ?.study_year === Number(year)) &&
              d.title.toLowerCase().includes(search.toLowerCase()),
          )
          .map((d) => (
            <article className="card p-5 space-y-3" key={d.id}>
              <h2 className="font-bold">{d.title}</h2>
              <p>
                {curriculum.modules.find((m) => m.id === d.module_id)?.title}
              </p>
              <p>
                {d.professor} · {d.faculty} ·{" "}
                {(d.size_bytes / 1048576).toFixed(1)} MB
              </p>
              {d.accessible ? (
                <button
                  className="btn-primary"
                  disabled={!!busy}
                  onClick={() => void open(d)}
                >
                  {en ? "Get download link" : "Obtenir le lien"}
                </button>
              ) : (
                <Link
                  className="btn-secondary inline-flex"
                  href={`/${locale}/subscribe`}
                >
                  {en ? "View access offers" : "Voir les offres d’accès"}
                </Link>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}
