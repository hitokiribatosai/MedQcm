import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";
import { isCorrect, score } from "@/lib/quiz/engine";
import type { Attempt } from "@/lib/quiz/types";
export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { locale } = await params,
    en = locale === "en";
  const { attempt: id } = await searchParams;
  const user = await requireUser(locale),
    supabase = await createClient();
  const { data, error } =
    id && /^[0-9a-f-]{36}$/i.test(id)
      ? await supabase
          .from("training_attempts")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .maybeSingle()
      : { data: null, error: null };
  if (error || !data)
    return (
      <section className="card p-6 space-y-4">
        <h1>{en ? "Result unavailable" : "Résultat indisponible"}</h1>
        <p>
          {en
            ? "No saved result is available for this account, or storage is temporarily unavailable."
            : "Aucun résultat enregistré disponible pour ce compte, ou stockage temporairement indisponible."}
        </p>
        <Link href={`/${locale}/stats`}>
          {en ? "View history" : "Voir l’historique"}
        </Link>
      </section>
    );
  const attempt = data as Attempt,
    metrics = score(attempt.questions, attempt.answers);
  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header className="card p-6 space-y-3">
        <h1 className="text-2xl font-bold">{attempt.module_name}</h1>
        <p className="text-3xl font-bold">
          {((attempt.correct_count * 20) / attempt.question_count).toFixed(1)} /
          20
        </p>
        <p>
          {attempt.correct_count} / {attempt.question_count} ·{" "}
          {en ? "Unanswered" : "Sans réponse"}: {metrics.unanswered} ·{" "}
          {Math.floor(attempt.duration_seconds / 60)}m{" "}
          {attempt.duration_seconds % 60}s
        </p>
        <p>
          {en
            ? "Saved to your account. Training score, not an official examination grade."
            : "Enregistré dans votre compte. Note d’entraînement, pas une note d’examen officielle."}
        </p>
        <div className="flex gap-4">
          <Link href={`/${locale}/stats`}>
            {en ? "History and statistics" : "Historique et statistiques"}
          </Link>
          <Link
            href={`/${locale}/quiz/${attempt.module_id}?mode=${attempt.mode}`}
          >
            {en ? "Practice again" : "Recommencer"}
          </Link>
        </div>
      </header>
      {attempt.questions.map((q, index) => (
        <article key={q.id} className="card p-6 space-y-3">
          <h2 className="font-bold">
            {index + 1}. {q.questionText}
          </h2>
          <p>
            {isCorrect(q, attempt.answers[q.id] ?? [])
              ? en
                ? "Correct"
                : "Correct"
              : en
                ? "To review"
                : "À revoir"}
          </p>
          {q.options.map((o) => (
            <div
              key={o.id}
              className={`p-3 border rounded-xl ${o.isCorrect ? "border-green-600" : ""}`}
            >
              <span>
                {(attempt.answers[q.id] ?? []).includes(o.id) ? "☑" : "☐"}{" "}
                {o.text}
              </span>
              {o.isCorrect && (
                <strong> — {en ? "Correct answer" : "Réponse exacte"}</strong>
              )}
            </div>
          ))}
          <p>{q.explanation}</p>
        </article>
      ))}
    </section>
  );
}
