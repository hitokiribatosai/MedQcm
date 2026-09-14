import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Flame, Zap, Trophy, Target, ArrowRight, Star,
  BookOpen, Clock, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';

const YEARS = [
  { number: 1, label: '1ère Année Médecine', color: 'from-emerald-500 to-emerald-700', modules: 12, free: true, xp: 450 },
  { number: 2, label: '2ème Année Médecine', color: 'from-emerald-600 to-teal-700', modules: 15, free: true, xp: 620 },
  { number: 3, label: '3ème Année Médecine', color: 'from-teal-600 to-cyan-700', modules: 18, free: true, xp: 780 },
  { number: 4, label: '4ème Année Médecine', color: 'from-sky-600 to-blue-700', modules: 22, free: true, xp: 950 },
  { number: 5, label: '5ème Année Médecine', color: 'from-blue-600 to-indigo-700', modules: 20, free: true, xp: 880 },
  { number: 6, label: '6ème Année Médecine', color: 'from-indigo-600 to-purple-700', modules: 24, free: true, xp: 1100 },
  { number: 7, label: '7ème Année Médecine', color: 'from-purple-600 to-pink-700', modules: 16, free: true, xp: 750 },
  { number: 8, label: 'Concours Résidanat', color: 'from-amber-500 to-orange-600', modules: 35, free: false, special: true, xp: 2500 },
];

export default async function DuolingoDashboardPage() {
  const supabase = await createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch {
    user = null;
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Étudiant';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* ── Welcome & Daily Quest Mascot Banner ─────────────────────── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-xl relative overflow-hidden border-b-4 border-emerald-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>Série de 5 jours • Tu es en feu !</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Prêt pour ta dose de QCMs, {firstName} ?
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
              Consolide tes connaissances au quotidien avec des sessions courtes de 5 minutes inspirées de la méthode Duolingo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/fr/years/1"
              className="btn-duo-gold py-4 px-6 text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              Reprendre le parcours
            </Link>
          </div>
        </div>
      </div>

      {/* ── Gamification Widgets (Quête du jour + Ligue) ─────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Quête du jour */}
        <div className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Quête du Jour 🎯
            </span>
            <span className="text-xs font-black text-amber-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500" /> +30 XP
            </span>
          </div>

          <p className="text-sm font-bold text-[#1a2e25] dark:text-green-50 mb-3">
            Répondre à 10 QCMs d'Anatomie
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>Progression</span>
              <span>6 / 10</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-dark-muted rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-emerald-500 rounded-full w-[60%]" />
            </div>
          </div>
        </div>

        {/* Ligue Médicale */}
        <div className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Ligue Médicale 🏆
            </span>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              Zone de promotion
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-black">
              #4
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a2e25] dark:text-green-50">Ligue Interne</p>
              <p className="text-xs text-gray-400">380 XP cette semaine</p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Top 5 qualifié pour la Ligue Résident !
          </span>
        </div>

        {/* Précision Globale */}
        <div className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Précision Clinique 🩺
            </span>
            <span className="text-xs font-black text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-md">
              Niveau 3
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-[#1a2e25] dark:text-green-50">84%</span>
            <span className="text-xs text-emerald-600 font-bold">Excellent réflexe</span>
          </div>

          <p className="text-xs text-gray-400">
            Basé sur vos 85 dernières réponses validées
          </p>
        </div>
      </div>

      {/* ── Winding Years Hub ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#1a2e25] dark:text-green-50">
              Choisissez votre parcours d'études
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chaque année comprend son propre parcours en serpentin avec modules et boss d'examens
            </p>
          </div>

          <Link href="/fr/years" className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1">
            Voir tous les parcours <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid of Year Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {YEARS.map((y) => (
            <Link
              key={y.number}
              href={`/fr/years/${y.number}`}
              className={`p-5 rounded-2xl border-2 border-b-4 bg-white dark:bg-dark-card transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between ${
                y.special
                  ? 'border-amber-400 border-b-amber-600 shadow-md'
                  : 'border-gray-200 border-b-gray-300 dark:border-dark-border dark:border-b-dark-muted'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${y.color} flex items-center justify-center text-white shadow-sm font-black`}>
                    {y.special ? '🏆' : `${y.number}e`}
                  </div>

                  {y.free ? (
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      1er Mod. Gratuit
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200">
                      Pass Pro
                    </span>
                  )}
                </div>

                <h3 className="font-black text-sm text-[#1a2e25] dark:text-green-50 group-hover:text-emerald-600 transition-colors">
                  {y.label}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {y.modules} modules • Chemin interactif
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Accéder au chemin</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
