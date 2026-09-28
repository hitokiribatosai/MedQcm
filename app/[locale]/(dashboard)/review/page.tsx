import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import ReviewStartButton from "@/components/quiz/ReviewStartButton";

type ReviewRow = {
  module_id: string;
  module_name: string;
  question_id: string;
  question: {
    questionText: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation?: string;
  };
  selected: string[];
  status: "wrong" | "unanswered";
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === "en";
  await requireUser(locale);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("training_review_queue");
  const rows = (data ?? []) as ReviewRow[];
  const groups = new Map<string, ReviewRow[]>();
  for (const row of rows) {
    const group = groups.get(row.module_id) ?? [];
    group.push(row);
    groups.set(row.module_id, group);
  }

  return (
    <section className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          {en ? "Review my mistakes" : "Revoir mes erreurs"}
        </h1>
        <p>
          {en
            ? "The latest completed answer for each question decides whether it appears here. Complete a successful retry to remove it."
            : "La dernière réponse terminée pour chaque question détermine si elle apparaît ici. Réussissez une nouvelle tentative pour la retirer."}
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {en ? "Check each question’s source before relying on it for medical study; the initial bank contains unreviewed samples." : "Vérifiez la source de chaque question avant de l’utiliser pour réviser ; la banque initiale contient des exemples non relus."}
        </p>
      </header>
      {error && (
        <p role="alert" className="card p-6">
          {en
            ? "Review is temporarily unavailable. Please try again later."
            : "La révision est temporairement indisponible. Réessayez plus tard."}
        </p>
      )}
      {!error && rows.length === 0 && (
        <div className="card p-6 space-y-3">
          <p>
            {en
              ? "No mistakes to review yet. Finish a quiz to build your revision list."
              : "Aucune erreur à revoir pour le moment. Terminez un QCM pour créer votre liste de révision."}
          </p>
          <Link className="underline" href={`/${locale}/years`}>
            {en ? "Browse modules" : "Parcourir les modules"}
          </Link>
        </div>
      )}
      {!error && [...groups].map(([moduleId, items]) => (
        <section key={moduleId} className="space-y-4" aria-labelledby={`module-${moduleId}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id={`module-${moduleId}`} className="text-xl font-bold">
              {items[0].module_name} · {items.length}
            </h2>
            <ReviewStartButton locale={locale} moduleId={moduleId} count={items.length} />
          </div>
          {items.map((row) => {
            const selected = new Set(row.selected);
            return (
              <article key={row.question_id} className="card p-5 space-y-3">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {row.status === "unanswered"
                    ? en ? "Unanswered" : "Sans réponse"
                    : en ? "Incorrect answer" : "Réponse incorrecte"}
                </p>
                <h3 className="font-bold">{row.question.questionText}</h3>
                <ul className="space-y-1 text-sm">
                  {row.question.options.map((option) => (
                    <li key={option.id} className={option.isCorrect ? "text-emerald-700 dark:text-emerald-300 font-semibold" : ""}>
                      {option.isCorrect ? "✓ " : ""}{option.text}
                      {selected.has(option.id) ? ` (${en ? "your choice" : "votre choix"})` : ""}
                    </li>
                  ))}
                </ul>
                {row.question.explanation && <p className="text-sm">{row.question.explanation}</p>}
              </article>
            );
          })}
        </section>
      ))}
    </section>
  );
}
