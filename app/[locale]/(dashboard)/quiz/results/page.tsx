'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, CheckCircle2, XCircle, Clock, RotateCcw,
  ArrowRight, Filter, BookOpen, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { QuestionData } from '@/lib/data/curriculum';
import { QuizAnswer } from '@/stores/quizStore';

interface SavedQuizSession {
  moduleId: string;
  moduleName: string;
  mode: string;
  questions: QuestionData[];
  answers: Record<string, QuizAnswer>;
  timeSpent: number;
  tabSwitches?: number;
}

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get('moduleId') || '';
  const mode = searchParams.get('mode') || 'exploration';

  const [session, setSession] = useState<SavedQuizSession | null>(null);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem('medqcm_current_quiz');
      if (stored) {
        try {
          setSession(JSON.parse(stored));
        } catch {
          // ignore error
        }
      }
    }
  }, []);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1a2e25] dark:text-green-50">Aucun résultat récent</h2>
        <p className="text-sm text-[#4b7a62] dark:text-green-400">
          Veuillez terminer une session pour visualiser vos performances.
        </p>
        <Link href="/fr/years" className="btn-primary inline-flex">
          Choisir un module
        </Link>
      </div>
    );
  }

  const { questions, answers, timeSpent, tabSwitches = 0, moduleName } = session;

  // Compute metrics
  const totalQuestions = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q) => {
    const ans = answers[q.id];
    if (!ans || !ans.selectedOptionId) {
      unattemptedCount++;
    } else if (ans.isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const scoreOutOf20 = ((correctCount / totalQuestions) * 20).toFixed(1);

  // Time format
  const mins = Math.floor(Math.max(timeSpent, 1) / 60);
  const secs = Math.max(timeSpent, 1) % 60;
  const timeFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const ans = answers[q.id];
    const isCorrect = ans?.isCorrect;
    if (filter === 'correct') return isCorrect;
    if (filter === 'wrong') return !isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header card with Score Trophy */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-primary-800 via-primary-900 to-[#0e271d] text-white border-0 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm">
              Rapport de Performance • {mode === 'exam' ? 'Examen Blanc' : 'Entraînement'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              {moduleName}
            </h1>
            <p className="text-primary-200 text-xs sm:text-sm">
              {scorePercent >= 75
                ? '🌟 Excellent résultat ! Vos connaissances sur ce module sont très solides.'
                : scorePercent >= 50
                ? '👍 Bon travail ! Quelques notions clés méritent d\'être revues.'
                : '💪 Continuez vos révisions. Refaites les erreurs pour bien mémoriser.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
            <div className="w-12 h-12 rounded-xl bg-accent-500 text-amber-950 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black">{scoreOutOf20} <span className="text-base text-primary-200 font-bold">/ 20</span></div>
              <div className="text-xs text-primary-200 font-semibold">{scorePercent}% de réussite</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Bonnes réponses</span>
          </div>
          <div className="text-2xl font-black text-[#1a2e25] dark:text-green-50">{correctCount}</div>
          <span className="text-[11px] text-gray-400">sur {totalQuestions} questions</span>
        </div>

        <div className="card p-4 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Erreurs</span>
          </div>
          <div className="text-2xl font-black text-[#1a2e25] dark:text-green-50">{wrongCount}</div>
          <span className="text-[11px] text-gray-400">à réviser</span>
        </div>

        <div className="card p-4 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Temps passé</span>
          </div>
          <div className="text-2xl font-black text-[#1a2e25] dark:text-green-50">{timeFormatted}</div>
          <span className="text-[11px] text-gray-400">durée totale</span>
        </div>

        <div className="card p-4 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center gap-2 text-accent-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Assiduité</span>
          </div>
          <div className="text-2xl font-black text-[#1a2e25] dark:text-green-50">
            {tabSwitches === 0 ? '100%' : `${tabSwitches} sortie(s)`}
          </div>
          <span className="text-[11px] text-gray-400">{tabSwitches === 0 ? 'Aucune sortie' : 'Onglet quitté'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push(`/fr/quiz/${moduleId}?mode=${mode}`)}
            className="btn-ghost text-xs sm:text-sm gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Recommencer
          </button>
          <Link
            href="/fr/years"
            className="btn-ghost text-xs sm:text-sm gap-2"
          >
            <BookOpen className="w-4 h-4" /> Autres modules
          </Link>
        </div>

        <Link
          href="/fr/subscribe"
          className="btn-primary text-xs sm:text-sm gap-2 shadow-glow"
        >
          Débloquer tous les modules <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Review Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-100 dark:border-dark-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#1a2e25] dark:text-green-50">
              Correction & Explications Médicales
            </h2>
            <p className="text-xs text-[#4b7a62] dark:text-green-400">
              Passez en revue chaque réponse avec l'argumentaire théorique détaillé
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-dark-muted rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-dark-card text-[#1a2e25] dark:text-green-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Toutes ({totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'wrong'
                  ? 'bg-white dark:bg-dark-card text-red-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Erreurs ({wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'correct'
                  ? 'bg-white dark:bg-dark-card text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Réussies ({correctCount})
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const answer = answers[q.id];
            const isUserCorrect = answer?.isCorrect;
            const selectedOptId = answer?.selectedOptionId;

            return (
              <div
                key={q.id}
                className="card p-6 border border-primary-200 dark:border-dark-border space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                      QCM #{idx + 1}
                    </span>
                    {isUserCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Réussi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{q.source}</span>
                </div>

                <div className="text-sm font-bold text-[#1a2e25] dark:text-green-50">
                  {q.questionText}
                </div>

                {/* Options display with answers */}
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isSelected = selectedOptId === opt.id;
                    const isRightAnswer = opt.isCorrect;

                    let bg = 'bg-white dark:bg-dark-card border-gray-200';
                    let badgeBg = 'bg-gray-100 text-gray-600 dark:bg-dark-muted';

                    if (isRightAnswer) {
                      bg = 'bg-emerald-50/80 border-emerald-500 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100';
                      badgeBg = 'bg-emerald-600 text-white';
                    } else if (isSelected && !isRightAnswer) {
                      bg = 'bg-red-50/80 border-red-400 dark:bg-red-950/30 text-red-900 dark:text-red-100';
                      badgeBg = 'bg-red-600 text-white';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${bg}`}
                      >
                        <span className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${badgeBg}`}>
                          {letter}
                        </span>
                        <span className="flex-1 pt-0.5 font-medium">{opt.text}</span>
                        {isRightAnswer && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0 pt-0.5">
                            <CheckCircle2 className="w-4 h-4" /> Réponse correcte
                          </span>
                        )}
                        {isSelected && !isRightAnswer && (
                          <span className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 shrink-0 pt-0.5">
                            <XCircle className="w-4 h-4" /> Votre réponse
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-primary-50/70 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/60 text-xs sm:text-sm text-[#2d523f] dark:text-green-200 leading-relaxed">
                  <strong className="block text-primary-900 dark:text-primary-300 mb-1">
                    Explication théorique :
                  </strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
