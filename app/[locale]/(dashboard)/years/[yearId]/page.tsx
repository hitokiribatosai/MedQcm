'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getYearData, ModuleData } from '@/lib/data/curriculum';
import {
  ArrowLeft, Star, Lock, Play, Sparkles, CheckCircle2,
  Trophy, Gift, Zap, Compass, ChevronRight, X, Heart
} from 'lucide-react';

export default function DuolingoYearPathPage() {
  const params = useParams();
  const router = useRouter();
  const yearNumber = parseInt(params.yearId as string, 10) || 1;
  const year = getYearData(yearNumber);

  const [activeLessonModal, setActiveLessonModal] = useState<ModuleData | null>(null);
  const [selectedMode, setSelectedMode] = useState<'exploration' | 'practice' | 'exam'>('exploration');

  if (!year) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-xl font-black">Année non trouvée</h1>
        <Link href="/fr/years" className="btn-duo-green">Retour aux années</Link>
      </div>
    );
  }

  function handleStartLesson() {
    if (!activeLessonModal) return;
    router.push(`/fr/quiz/${activeLessonModal.id}?mode=${selectedMode}`);
  }

  // Define offset winding pattern for stepping stones (Duolingo snake path)
  const offsets = [
    'translate-x-0',
    'translate-x-8 sm:translate-x-12',
    'translate-x-12 sm:translate-x-20',
    'translate-x-6 sm:translate-x-10',
    'translate-x-0',
    '-translate-x-6 sm:-translate-x-10',
    '-translate-x-12 sm:-translate-x-20',
    '-translate-x-8 sm:-translate-x-12',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* ── Header: Course Banner & XP Progress ──────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-gray-100 dark:border-dark-border pb-4">
        <Link
          href="/fr/years"
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" /> Années
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-500 flex items-center gap-1">
            <Zap className="w-4 h-4 fill-amber-500" /> +350 XP
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {year.label}
          </span>
        </div>
      </div>

      {/* ── Winding Duolingo Path ─────────────────────────────────────── */}
      <div className="space-y-12">
        {year.categories.map((cat, catIdx) => (
          <div key={cat.id} className="space-y-8">
            {/* Unit Banner */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg relative overflow-hidden border-b-4 border-emerald-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    Section {catIdx + 1}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">{cat.nameFr}</h2>
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                    Maîtrisez les QCMs fondamentaux et les pièges classiques de concours.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/20 shadow-inner">
                    🩺
                  </div>
                </div>
              </div>
            </div>

            {/* Stepping Stone Nodes (The Snake) */}
            <div className="flex flex-col items-center py-4 space-y-7 relative">
              {cat.modules.map((mod, modIdx) => {
                const offsetClass = offsets[(catIdx * 3 + modIdx) % offsets.length];
                const isFirst = mod.isFree; // Free first module is unlocked!

                return (
                  <div
                    key={mod.id}
                    className={`flex flex-col items-center transition-transform ${offsetClass}`}
                  >
                    {/* Stepping Stone Circle */}
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          if (isFirst) {
                            setActiveLessonModal(mod);
                          } else {
                            router.push('/fr/subscribe');
                          }
                        }}
                        className={`duo-node ${
                          isFirst
                            ? 'duo-node-active ring-4 ring-emerald-400/30 ring-offset-2'
                            : 'duo-node-locked'
                        }`}
                        title={mod.nameFr}
                      >
                        {isFirst ? (
                          <Star className="w-8 h-8 fill-white text-white drop-shadow-sm" />
                        ) : (
                          <Lock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                        )}
                      </button>

                      {/* Mascot floating speech bubble / lesson title */}
                      <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-[#1a2e25] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl whitespace-nowrap shadow-xl z-20">
                        {isFirst ? `${mod.nameFr} (Gratuit)` : `${mod.nameFr} (Verrouillé)`}
                      </div>

                      {/* Pulsing crown badge on active free lesson */}
                      {isFirst && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-md border-2 border-white animate-bounce">
                          ★
                        </div>
                      )}
                    </div>

                    {/* Node title beneath */}
                    <div className="text-center mt-2 max-w-[140px]">
                      <p className="text-xs font-black text-[#1a2e25] dark:text-green-100 truncate">
                        {mod.nameFr}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400">
                        {isFirst ? 'Niveau 1/3 • Prêt' : 'Abonnement'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Revision Chest Bonus at end of section */}
              <div className="flex flex-col items-center pt-2">
                <div
                  onClick={() => router.push('/fr/subscribe')}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-800 text-amber-950 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  title="Coffre bonus de révision"
                >
                  <Gift className="w-8 h-8 fill-amber-900 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-600 mt-1">
                  Coffre Bonus
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Big Boss Exam Milestone */}
        <div className="card p-8 border-4 border-amber-400 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-amber-50 dark:bg-dark-card text-center space-y-4 rounded-3xl shadow-glow">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto font-black text-2xl shadow-lg">
            <Trophy className="w-8 h-8 fill-white" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Épreuve Finale Classante
            </span>
            <h3 className="text-2xl font-black text-[#1a2e25] dark:text-green-50">
              Examen Blanc Majeur de Promo
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Testez vos réflexes en conditions réelles avec chronomètre et classement direct parmi tous les étudiants de votre promotion.
            </p>
          </div>

          <Link href="/fr/subscribe" className="btn-duo-gold inline-flex px-8 py-3.5 shadow-md">
            Débloquer l'épreuve majeure 👑
          </Link>
        </div>
      </div>

      {/* ── Duolingo Lesson Modal ────────────────────────────────────── */}
      {activeLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge-free text-[10px] font-black uppercase tracking-wider mb-1">
                  Module Débloqué Gratuit
                </span>
                <h3 className="text-xl font-black text-[#1a2e25] dark:text-green-50">
                  {activeLessonModal.nameFr}
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  {activeLessonModal.descriptionFr}
                </p>
              </div>
              <button
                onClick={() => setActiveLessonModal(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-muted flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selection cards */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setSelectedMode('exploration')}
                className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                  selectedMode === 'exploration'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-black text-sm">Mode Exploration (Guidé)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Corrections instantanées & explications</div>
                </div>
                {selectedMode === 'exploration' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('practice')}
                className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                  selectedMode === 'practice'
                    ? 'border-sky-500 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-black text-sm">Mode Entraînement</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Score et bilan complet à la fin</div>
                </div>
                {selectedMode === 'practice' && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
              </button>
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartLesson}
                className="btn-duo-green w-full py-4 text-base shadow-md"
              >
                Commencer (+20 XP) ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
