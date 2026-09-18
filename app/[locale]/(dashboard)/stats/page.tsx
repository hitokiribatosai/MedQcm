import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
export default async function StatisticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params,
    en = locale === "en",
    user = await requireUser(locale),
    supabase = await createClient();
  const raw = Number((await searchParams).page ?? 1),
    page = Number.isInteger(raw) && raw > 0 ? Math.min(raw, 10000) : 1;
  const { data, error, count } = await supabase
    .from("training_attempts")
    .select(
      "id,module_id,module_name,question_count,correct_count,duration_seconds,completed_at",
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  const { data: summary, error: summaryError } =
    await supabase.rpc("training_summary");
  const rows = data ?? [],
    questions = Number(summary?.questions ?? 0),
    correct = Number(summary?.correct ?? 0),
    seconds = Number(summary?.seconds ?? 0);
  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        {en ? "History and statistics" : "Historique et statistiques"}
      </h1>
      {error || summaryError ? (
        <p role="alert" className="card p-6">
          {en
            ? "History is temporarily unavailable. Please retry later."
            : "Historique temporairement indisponible. Veuillez réessayer."}
        </p>
      ) : (
        <>
          <p>
            {en
              ? "All completed sessions. Accuracy includes unanswered questions."
              : "Toutes les sessions terminées. La réussite inclut les questions sans réponse."}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card p-5">
              {en ? "Questions" : "Questions"}
              <strong className="block text-2xl">{questions}</strong>
            </div>
            <div className="card p-5">
              {en ? "Accuracy" : "Réussite"}
              <strong className="block text-2xl">
                {questions ? Math.round((correct * 100) / questions) : 0}%
              </strong>
            </div>
            <div className="card p-5">
              {en ? "Session time" : "Durée des sessions"}
              <strong className="block text-2xl">
                {Math.floor(seconds / 60)}m {seconds % 60}s
              </strong>
            </div>
          </div>
          <h2 className="font-bold text-xl">
            {en ? "Completed sessions" : "Sessions terminées"} ({count ?? 0})
          </h2>
          {!rows.length && (
            <p className="card p-6">
              {en
                ? "No completed sessions on this page. Finish a quiz to record your progress."
                : "Aucune session terminée sur cette page. Terminez un quiz pour enregistrer votre progression."}
            </p>
          )}
          <ul className="space-y-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="card p-4 flex flex-wrap justify-between gap-3"
              >
                <Link
                  className="font-bold underline"
                  href={`/${locale}/quiz/results?attempt=${r.id}`}
                >
                  {r.module_name}
                </Link>
                <span>
                  {r.correct_count}/{r.question_count} ·{" "}
                  {new Date(r.completed_at).toLocaleString(
                    en ? "en-GB" : "fr-FR",
                    { timeZone: "Africa/Algiers" },
                  )}{" "}
                  (Alger)
                </span>
              </li>
            ))}
          </ul>
          <nav
            className="flex gap-4"
            aria-label={en ? "History pages" : "Pages de l’historique"}
          >
            {page > 1 && (
              <Link href={`/${locale}/stats?page=${page - 1}`}>
                {en ? "Previous" : "Précédent"}
              </Link>
            )}
            {page * 20 < (count ?? 0) && (
              <Link href={`/${locale}/stats?page=${page + 1}`}>
                {en ? "Next" : "Suivant"}
              </Link>
            )}
          </nav>
        </>
      )}
      <Link className="btn-primary inline-flex" href={`/${locale}/years`}>
        {en ? "Practice" : "S’entraîner"}
      </Link>
    </section>
  );
}
