'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getModuleData, QuestionData, OptionData } from '@/lib/data/curriculum';
import { useQuizStore, QuizMode } from '@/stores/quizStore';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import {
  X, Heart, Clock, CheckCircle2, XCircle, Sparkles,
  ArrowRight, ShieldAlert, Flag, Volume2, VolumeX,
  Send, Check, Play, Settings2, BarChart2
} from 'lucide-react';

const FALLBACK_QUESTIONS: QuestionData[] = [
  {
    id: 'fb-q1',
    questionText: 'Concernant la régulation de la pression artérielle à court terme, quel récepteur sensoriel est le principal acteur ?',
    options: [
      { id: 'fb-o1', text: 'Chémorécepteurs périphériques carotidiens', isCorrect: false },
      { id: 'fb-o2', text: 'Barorécepteurs du sinus carotidien et de la crosse aortique', isCorrect: true },
      { id: 'fb-o3', text: 'Récepteurs volumétriques atriaux', isCorrect: false },
      { id: 'fb-o4', text: 'Barorécepteurs rénaux de l\'appareil juxtaglomérulaire', isCorrect: false },
    ],
    explanation: 'Le baroréflexe artériel (sinus carotidien et crosse de l\'aorte) est le système régulateur principal à très court terme (seconde par seconde) de la pression artérielle.',
    difficulty: 'easy',
    source: 'Physiologie - Concours blanc',
  },
  {
    id: 'fb-q2',
    questionText: 'Concernant l\'articulation scapulo-humérale, quelles propositions sont EXACTES ? (Plusieurs réponses possibles)',
    options: [
      { id: 'fb-o21', text: 'C\'est une énarthrose (articulation sphéroïde) à 3 degrés de liberté.', isCorrect: true },
      { id: 'fb-o22', text: 'Le bourrelet glénoïdien diminue la congruence articulaire.', isCorrect: false },
      { id: 'fb-o23', text: 'Le muscle supra-épineux est le principal initiateur de l\'abduction.', isCorrect: true },
      { id: 'fb-o24', text: 'Le nerf axillaire contourne le col chirurgical de l\'humérus.', isCorrect: true },
      { id: 'fb-o25', text: 'Le ligament coraco-huméral freine l\'adduction.', isCorrect: false },
    ],
    explanation: 'L\'articulation gléno-humérale est sphéroïde (3 degrés). Le labrum augmente la congruence. Le muscle supra-épineux initie l\'abduction (0-15°). Le nerf axillaire contourne le col chirurgical.',
    difficulty: 'medium',
    source: 'Anatomie - Concours Faculté',
  },
  {
    id: 'fb-q3',
    questionText: 'Devant une suspicion d\'embolie pulmonaire chez un patient instable sur le plan hémodynamique, quel est l\'examen diagnostique de première intention recommandé ?',
    options: [
      { id: 'fb-o31', text: 'Angioscanner thoracique avec injection', isCorrect: true },
      { id: 'fb-o32', text: 'Scintigraphie pulmonaire de ventilation/perfusion', isCorrect: false },
      { id: 'fb-o33', text: 'Dosage plasmatique des D-Dimères', isCorrect: false },
      { id: 'fb-o34', text: 'Radiographie du thorax de face', isCorrect: false },
    ],
    explanation: 'L\'angioscanner thoracique est l\'examen de référence pour confirmer une embolie pulmonaire.',
    difficulty: 'medium',
    source: 'Urgences & Réanimation',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function DuolingoQuizSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleId = params.moduleId as string;
  const modeParam = (searchParams.get('mode') as QuizMode) || 'exploration';

  const moduleInfo = useMemo(() => getModuleData(moduleId), [moduleId]);
  const rawQuestions: QuestionData[] = useMemo(() => {
    if (moduleInfo?.module.questions && moduleInfo.module.questions.length > 0) {
      return moduleInfo.module.questions;
    }
    return FALLBACK_QUESTIONS;
  }, [moduleInfo]);

  // ───────────────────────────────────────────────────────────────────────────
  // STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [quizState, setQuizState] = useState<'setup' | 'playing'>('setup');
  const [selectedCount, setSelectedCount] = useState<number | 'all'>(20);
  const [activeQuestions, setActiveQuestions] = useState<QuestionData[]>([]);
  const [pastMistakesCount, setPastMistakesCount] = useState(0);

  const {
    currentIndex,
    answers,
    timerSeconds,
    timerActive,
    initQuiz,
    answerQuestion,
    goToNext,
    tickTimer,
    completeQuiz,
  } = useQuizStore();

  const [selectedOptIds, setSelectedOptIds] = useState<string[]>([]);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [hearts, setHearts] = useState(5);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('correction_error');
  const [reportComment, setReportComment] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Load mistakes count on mount for the setup screen
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`medqcm_mistakes_${moduleId}`);
      if (stored) {
        const mistakes = JSON.parse(stored) as string[];
        setPastMistakesCount(mistakes.length);
      }
    } catch {}
  }, [moduleId]);

  // Fallback to 'all' if there are less than 20 questions
  useEffect(() => {
    if (rawQuestions.length < 20) {
      setSelectedCount('all');
    }
  }, [rawQuestions.length]);

  // ───────────────────────────────────────────────────────────────────────────
  // SETUP LOGIC (Smart Ordering & Shuffling)
  // ───────────────────────────────────────────────────────────────────────────
  function handleStartQuiz() {
    let mistakes: string[] = [];
    try {
      const stored = localStorage.getItem(`medqcm_mistakes_${moduleId}`);
      if (stored) mistakes = JSON.parse(stored);
    } catch {}

    // Sort: Mistakes first, then random for the rest
    let sortedQuestions = [...rawQuestions].sort((a, b) => {
      const aMistake = mistakes.includes(a.id);
      const bMistake = mistakes.includes(b.id);
      
      if (aMistake && !bMistake) return -1; // a comes first
      if (!aMistake && bMistake) return 1;  // b comes first
      return Math.random() - 0.5; // shuffle equally
    });

    // Limit count based on user selection
    if (selectedCount !== 'all') {
      sortedQuestions = sortedQuestions.slice(0, selectedCount);
    }

    // Shuffle options for EVERY question to prevent memorization by position
    const finalizedQuestions = sortedQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    setActiveQuestions(finalizedQuestions);
    setQuizState('playing');

    const duration = modeParam === 'exam' ? finalizedQuestions.length * 90 : 0;
    initQuiz({
      mode: modeParam,
      moduleId,
      totalQuestions: finalizedQuestions.length,
      durationSeconds: duration,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PLAYING EFFECTS
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (quizState !== 'playing' || modeParam !== 'exam' || !timerActive) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [quizState, modeParam, timerActive, tickTimer]);

  useEffect(() => {
    if (quizState !== 'playing' || modeParam !== 'exam') return;
    function handleVisibilityChange() {
      if (document.hidden) setTabSwitches((prev) => prev + 1);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [quizState, modeParam]);

  useEffect(() => {
    setSelectedOptIds([]);
    setFeedbackStatus('idle');
    setShowReportModal(false);
    setReportSubmitted(false);
    setReportComment('');
  }, [currentIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showReportModal || quizState !== 'playing') return;
      const currentQ = activeQuestions[currentIndex];
      if (!currentQ) return;

      if (feedbackStatus === 'idle') {
        if (['1', '2', '3', '4', '5'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (currentQ.options[idx]) {
            handleToggleOption(currentQ.options[idx].id);
          }
        }
        if (e.key === 'Enter' && selectedOptIds.length > 0) handleCheckAnswer();
      } else {
        if (e.key === 'Enter') handleContinue();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedbackStatus, selectedOptIds, currentIndex, activeQuestions, showReportModal, quizState]);

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER SETUP
  // ───────────────────────────────────────────────────────────────────────────
  if (quizState === 'setup') {
    const counts: (number | 'all')[] = [20, 40, 60, 80, 100, 'all'];
    const maxQ = rawQuestions.length;

    return (
      <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full card p-8 space-y-8 slide-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Configuration de la session
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Module: <span className="text-emerald-600 dark:text-emerald-400">{moduleInfo?.module.nameFr || 'Inconnu'}</span>
            </p>
          </div>

          {pastMistakesCount > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 rounded-2xl flex items-start gap-3">
              <BarChart2 className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-300">Répétition Espacée Active</h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-500/80 mt-1">
                  Vous avez <b>{pastMistakesCount} erreurs</b> enregistrées sur ce module. Elles apparaîtront en priorité lors de cette session pour consolider vos acquis.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
              Combien de questions voulez-vous traiter ?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {counts.map((c) => {
                const isAll = c === 'all';
                const isDisabled = !isAll && c > maxQ && maxQ > 0;
                const isSelected = selectedCount === c;
                
                return (
                  <button
                    key={c}
                    disabled={isDisabled}
                    onClick={() => setSelectedCount(c)}
                    className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${
                      isDisabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-gray-600 cursor-not-allowed opacity-50'
                        : isSelected 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                          : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                    }`}
                  >
                    {isAll ? `Toutes (${maxQ})` : c}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleStartQuiz} className="btn-duo-green w-full py-4 text-lg">
            <Play className="w-5 h-5 mr-2" />
            C'est parti !
          </button>
          
          <div className="text-center">
            <Link href={moduleInfo ? `/fr/years/${moduleInfo.year.number}` : '/fr/years'} className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PLAYING RENDER
  // ───────────────────────────────────────────────────────────────────────────
  const currentQuestion = activeQuestions[currentIndex];

  if (!currentQuestion) return null;

  const progressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);
  const correctOptions = currentQuestion.options.filter((o) => o.isCorrect);
  const correctOptionIds = correctOptions.map((o) => o.id);
  const isMultipleChoice = correctOptions.length > 1;

  function handleToggleOption(optId: string) {
    if (feedbackStatus !== 'idle') return;
    if (isMultipleChoice) {
      setSelectedOptIds((prev) =>
        prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
      );
    } else {
      setSelectedOptIds((prev) => (prev.includes(optId) ? [] : [optId]));
    }
  }

  function handleCheckAnswer() {
    if (selectedOptIds.length === 0) return;

    const isCorrect =
      selectedOptIds.length === correctOptionIds.length &&
      correctOptionIds.every((id) => selectedOptIds.includes(id));

    answerQuestion(currentQuestion.id, selectedOptIds[0] || '', isCorrect, selectedOptIds);

    if (isCorrect) {
      setFeedbackStatus('correct');
      if (soundEnabled) playSuccessSound();
    } else {
      setFeedbackStatus('wrong');
      if (soundEnabled) playErrorSound();
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleContinue() {
    if (currentIndex < activeQuestions.length - 1) {
      goToNext();
    } else {
      // End of quiz logic: Save mistakes to localStorage
      try {
        const stored = localStorage.getItem(`medqcm_mistakes_${moduleId}`);
        let mistakes: string[] = stored ? JSON.parse(stored) : [];
        
        // Add new mistakes, remove fixed ones
        Object.values(answers).forEach((ans) => {
          if (!ans.isCorrect && !mistakes.includes(ans.questionId)) {
            mistakes.push(ans.questionId);
          } else if (ans.isCorrect && mistakes.includes(ans.questionId)) {
            mistakes = mistakes.filter(id => id !== ans.questionId);
          }
        });
        
        localStorage.setItem(`medqcm_mistakes_${moduleId}`, JSON.stringify(mistakes));
      } catch (e) {
        console.error("Failed to save mistakes", e);
      }

      completeQuiz(`attempt-${Date.now()}`);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('medqcm_current_quiz', JSON.stringify({
          moduleId,
          moduleName: moduleInfo?.module.nameFr || 'Session d\'entraînement',
          mode: modeParam,
          questions: activeQuestions,
          answers,
          timeSpent: (activeQuestions.length * 90) - timerSeconds,
          tabSwitches,
        }));
      }
      router.push(`/fr/quiz/results?moduleId=${moduleId}&mode=${modeParam}`);
    }
  }

  function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    try {
      const existingReports = JSON.parse(localStorage.getItem('medqcm_question_reports') || '[]');
      existingReports.push({
        id: `rep-${Date.now()}`,
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        reason: reportReason,
        comment: reportComment,
        date: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem('medqcm_question_reports', JSON.stringify(existingReports));
    } catch {}
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
    }, 1500);
  }



  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Find correct letters visually based on current shuffled order
  const correctLetters = currentQuestion.options
    .map((opt, idx) => opt.isCorrect ? String.fromCharCode(65 + idx) : null)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-dark-bg flex flex-col justify-between pb-36">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-6 pb-2 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            if (confirm('Voulez-vous vraiment quitter cette session ? La progression sera perdue.')) {
              router.push(moduleInfo ? `/fr/years/${moduleInfo.year.number}` : '/fr/years');
            }
          }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-muted transition-all shrink-0"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <div className="flex-1 h-4 bg-gray-200 dark:bg-dark-muted rounded-full overflow-hidden p-0.5 relative shadow-inner">
          <div
            className="h-full bg-[#10b981] rounded-full transition-all duration-300 relative shadow-sm"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {modeParam === 'exam' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-black text-xs font-mono">
              <Clock className="w-4 h-4" />
              <span>{formattedTime}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-red-500 font-black text-sm">
              <Heart className="w-5 h-5 fill-red-500 text-red-500 animate-pulse" />
              <span>{hearts}</span>
            </div>
          )}
        </div>
      </div>

      {tabSwitches > 0 && modeParam === 'exam' && (
        <div className="max-w-4xl mx-auto px-4 w-full mt-2">
          <div className="p-3 bg-red-50 border-2 border-red-200 dark:bg-red-950/30 dark:border-red-900 rounded-2xl text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>Avertissement anti-triche : Vous avez quitté l'onglet {tabSwitches} fois !</span>
          </div>
        </div>
      )}

      {/* ── Main Question Card ───────────────────────────────────────── */}
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-5 flex-1 flex flex-col justify-center">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-card shrink-0">
            🩺
          </div>

          <div className="relative bg-gray-50 dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-4 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider">
                <span className="text-emerald-600 dark:text-emerald-400">{currentQuestion.source}</span>
                <span>•</span>
                {isMultipleChoice ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black">
                    ☑️ Choix Multiple
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 font-bold">
                    🔘 Choix Unique
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Signaler une erreur</span>
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-black text-[#1a2e25] dark:text-green-50 leading-snug">
              {currentQuestion.questionText}
            </h2>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOptIds.includes(option.id);
            const isCorrectAnswer = option.isCorrect;

            let cardClass = 'duo-option';
            let letterBadge = 'bg-gray-100 dark:bg-dark-muted text-gray-700 dark:text-gray-300';

            if (feedbackStatus !== 'idle') {
              if (isCorrectAnswer) {
                cardClass = 'duo-option duo-option-correct';
                letterBadge = 'bg-emerald-600 text-white';
              } else if (isSelected && !isCorrectAnswer) {
                cardClass = 'duo-option duo-option-wrong';
                letterBadge = 'bg-red-600 text-white';
              }
            } else if (isSelected) {
              cardClass = 'duo-option duo-option-selected';
              letterBadge = 'bg-sky-500 text-white';
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleOption(option.id)}
                className={cardClass}
              >
                <div className="flex items-center gap-3.5 text-left">
                  <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border border-black/5 ${letterBadge}`}>
                    {letter}
                  </span>
                  <span className="flex-1 text-sm sm:text-base font-bold text-[#1a2e25] dark:text-green-50">
                    {option.text}
                  </span>

                  {feedbackStatus === 'idle' && (
                    <div className={`shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  )}

                  {feedbackStatus !== 'idle' && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {feedbackStatus !== 'idle' && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DRAWER ─────────────────────────────────────────────────────── */}
      <footer className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-200 border-t-2 ${
        feedbackStatus === 'correct'
          ? 'bg-[#d7ffb8] border-[#a5ed6e] text-[#256c00] dark:bg-emerald-950/95 dark:border-emerald-700'
          : feedbackStatus === 'wrong'
          ? 'bg-[#ffdfe0] border-[#ff9b9d] text-[#a81c1e] dark:bg-red-950/95 dark:border-red-700'
          : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border shadow-md'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {feedbackStatus === 'idle' ? (
            <div className="hidden sm:block text-xs font-bold text-gray-500 dark:text-gray-400">
              {isMultipleChoice
                ? '💡 Cochez toutes les réponses exactes puis appuyez sur Vérifier'
                : '💡 Sélectionnez votre réponse puis appuyez sur Vérifier'}
            </div>
          ) : feedbackStatus === 'correct' ? (
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                  Excellent réflexe clinique ! 🎉 ({correctLetters})
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900/90 dark:text-emerald-300 leading-relaxed max-w-xl">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-red-800 dark:text-red-200">
                  {isMultipleChoice ? `Réponses exactes : ${correctLetters}` : `Réponse attendue : ${correctLetters}`}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-red-900/90 dark:text-red-300 leading-relaxed max-w-xl">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="shrink-0 self-end sm:self-center w-full sm:w-auto">
            {feedbackStatus === 'idle' ? (
              <button
                type="button"
                disabled={selectedOptIds.length === 0}
                onClick={handleCheckAnswer}
                className="btn-duo-green w-full sm:w-44 py-3.5 shadow-md"
              >
                Vérifier
              </button>
            ) : feedbackStatus === 'correct' ? (
              <button
                type="button"
                onClick={handleContinue}
                className="btn-duo-green w-full sm:w-44 py-3.5 shadow-md flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                className="btn-duo-red w-full sm:w-44 py-3.5 shadow-md flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ── REPORT MODAL ───────────────────────────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1a2e25] dark:text-green-50">
                    Signaler une erreur sur ce QCM
                  </h3>
                  <span className="text-xs text-gray-400">Réf: {currentQuestion.source}</span>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-emerald-800 dark:text-emerald-200">
                  Signalement transmis à l'équipe médicale !
                </h4>
                <p className="text-xs text-gray-500">
                  Merci pour votre contribution.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Nature du problème
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input w-full text-xs rounded-xl"
                  >
                    <option value="correction_error">Erreur dans la correction</option>
                    <option value="ambiguous_question">Énoncé ambigu</option>
                    <option value="typo_error">Faute de frappe</option>
                    <option value="explanation_incomplete">Explication incomplète</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Remarque médicale
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    className="input w-full resize-none text-xs rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setShowReportModal(false)} className="btn-ghost text-xs">
                    Annuler
                  </button>
                  <button type="submit" className="btn-duo-green text-xs py-2 px-4 shadow">
                    <Send className="w-3.5 h-3.5 mr-1" /> Envoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
