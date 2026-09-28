import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
type ModuleProgress = {
  module_id: string;
  module_name: string;
  sessions: number;
  questions_presented: number;
  correct_answers: number;
  unique_questions_seen: number;
  catalog_questions: number | null;
};
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
  const { data: progress, error: progressError } =
    await supabase.rpc("training_module_progress");
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
          <section className="space-y-3" aria-labelledby="module-progress">
            <h2 id="module-progress" className="font-bold text-xl">
              {en ? "Progress by module" : "Progression par module"}
            </h2>
            {progressError ? (
              <p role="alert" className="card p-5">
                {en ? "Module progress is temporarily unavailable." : "La progression par module est temporairement indisponible."}
              </p>
            ) : (progress as ModuleProgress[] | null)?.length ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {(progress as ModuleProgress[]).map((module) => {
                  const presented = Number(module.questions_presented);
                  const correct = Number(module.correct_answers);
                  const seen = Number(module.unique_questions_seen);
                  const catalog = Number(module.catalog_questions ?? 0);
                  return (
                    <article key={module.module_id} className="card p-5 space-y-2">
                      <h3 className="font-bold">{module.module_name}</h3>
                      <p className="text-sm">
                        {Number(module.sessions)} {en ? "sessions" : "sessions"} · {presented ? Math.round(correct * 100 / presented) : 0}% {en ? "accuracy" : "réussite"}
                      </p>
                      <p className="text-sm">
                        {seen}{catalog ? ` / ${catalog}` : ""} {en ? "distinct questions seen" : "questions distinctes vues"}
                      </p>
                      <Link className="underline text-sm" href={`/${locale}/review`}>
                        {en ? "Review mistakes" : "Revoir mes erreurs"}
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="card p-5">
                {en ? "Finish a quiz to see progress by module." : "Terminez un QCM pour voir la progression par module."}
              </p>
            )}
          </section>
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
