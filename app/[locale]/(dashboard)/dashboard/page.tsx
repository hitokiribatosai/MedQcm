import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CURRICULUM_DATA } from '@/lib/data/curriculum-metadata';
import { ArrowRight, ChevronRight, Zap } from 'lucide-react';

export default async function DashboardPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const en = locale === 'en';
  const supabase = await createClient();
  const [{ data: { user } }, { data: summary, error: summaryError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc('training_summary'),
  ]);
  const totalQuestions = Number(summary?.questions ?? 0);
  const accuracy = totalQuestions ? Math.round(Number(summary?.correct ?? 0) * 100 / totalQuestions) : 0;
  const fullName = user?.user_metadata?.full_name;
  const firstName = typeof fullName === 'string' && fullName.trim() ? fullName.trim().split(' ')[0] : (en ? 'student' : 'étudiant');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-xl relative overflow-hidden border-b-4 border-emerald-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
              {en ? 'Your practice is saved to your account' : 'Vos entraînements sont enregistrés dans votre compte'}
            </p>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {en ? `Ready to practice, ${firstName}?` : `Prêt pour quelques QCMs, ${firstName} ?`}
            </h1>
          </div>
          <Link href={`/${locale}/years/1`} className="btn-duo-gold py-4 px-6 text-sm shadow-lg flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            {en ? 'Browse modules' : 'Voir les modules'}
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {summaryError ? <p role="alert">{en ? 'Statistics are temporarily unavailable.' : 'Statistiques temporairement indisponibles.'}</p> : <>
          <div className="card p-5"><p>{en ? 'Completed sessions' : 'Sessions terminées'}</p><strong className="text-3xl">{Number(summary?.sessions ?? 0)}</strong></div>
          <div className="card p-5"><p>{en ? 'Questions completed' : 'Questions terminées'}</p><strong className="text-3xl">{totalQuestions}</strong></div>
          <div className="card p-5"><p>{en ? 'Overall accuracy' : 'Réussite globale'}</p><strong className="text-3xl">{accuracy}%</strong></div>
        </>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1a2e25] dark:text-green-50">
              {en ? 'Browse study years' : 'Parcourir les années d’études'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {en ? 'Draft module map; the Oran faculty curriculum still needs confirmation.' : 'Liste provisoire des modules ; programme de la faculté d’Oran à confirmer.'}
            </p>
          </div>
          <Link href={`/${locale}/years`} className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1">
            {en ? 'All years' : 'Toutes les années'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURRICULUM_DATA.map((year) => (
            <Link key={year.number} href={`/${locale}/years/${year.number}`} className="p-5 rounded-2xl border-2 border-b-4 bg-white dark:bg-dark-card border-gray-200 border-b-gray-300 dark:border-dark-border dark:border-b-dark-muted hover:border-emerald-400 transition-colors group">
              <span className="inline-flex w-10 h-10 rounded-xl bg-emerald-700 items-center justify-center text-white font-black">{year.number === 8 ? 'R' : year.number}</span>
              <h3 className="mt-3 font-black text-sm text-[#1a2e25] dark:text-green-50">{year.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{en ? 'Content in preparation' : 'Contenu en préparation'}</p>
              <span className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs font-bold text-emerald-600">
                {en ? 'View modules' : 'Voir les modules'} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
