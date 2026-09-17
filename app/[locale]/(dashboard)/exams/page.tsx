'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock, ShieldAlert, CheckCircle2, Award, Sparkles,
  Play, Filter, Search, AlertCircle, ArrowRight,
  GraduationCap, BookOpen, Timer, HelpCircle, EyeOff
} from 'lucide-react';
import { CURRICULUM_DATA } from '@/lib/data/curriculum';

interface ExamPaper {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  cycle: 'preclinique' | 'clinique' | 'residanat';
  cycleLabel: string;
  yearNumber: number;
  questionCount: number;
  durationMinutes: number;
  difficulty: 'Moyen' | 'Difficile' | 'Concours';
  isAvailable: boolean;
  tag?: string;
}

const FEATURED_EXAMS: ExamPaper[] = [
  {
    id: 'exam-cardio-clinique',
    moduleId: 'cardio',
    title: 'Épreuve Clinique — Cardiologie & Appareil Circulatoire',
    subtitle: 'Valvulopathies, insuffisance cardiaque, ECG et urgences coronariennes',
    cycle: 'clinique',
    cycleLabel: '4ème Année • Cycle Clinique',
    yearNumber: 4,
    questionCount: 40,
    durationMinutes: 60,
    difficulty: 'Difficile',
    isAvailable: true,
    tag: 'Très Populaire',
  },
  {
    id: 'exam-neuro-clinique',
    moduleId: 'neuro',
    title: 'Épreuve Clinique — Neurologie & Système Nerveux',
    subtitle: 'AVC, épilepsie, céphalées, sclérose en plaques et sémiologie motrice',
    cycle: 'clinique',
    cycleLabel: '4ème Année • Cycle Clinique',
    yearNumber: 4,
    questionCount: 40,
    durationMinutes: 60,
    difficulty: 'Difficile',
    isAvailable: true,
  },
  {
    id: 'exam-anat-preclinique',
    moduleId: 'anatomie-1',
    title: 'Épreuve Fondamentale — Anatomie & Organogenèse',
    subtitle: 'Ostéologie, arthrologie, myologie et vascularisation des membres',
    cycle: 'preclinique',
    cycleLabel: '1ère Année • Pré-clinique',
    yearNumber: 1,
    questionCount: 30,
    durationMinutes: 45,
    difficulty: 'Moyen',
    isAvailable: true,
  },
  {
    id: 'exam-pharmaco-preclinique',
    moduleId: 'pharmacologie',
    title: 'Épreuve Thérapeutique — Pharmacologie Générale',
    subtitle: 'Pharmacocinétique, pharmacodynamie et classes médicamenteuses majeures',
    cycle: 'preclinique',
    cycleLabel: '3ème Année • Pré-clinique',
    yearNumber: 3,
    questionCount: 30,
    durationMinutes: 45,
    difficulty: 'Moyen',
    isAvailable: true,
  },
  {
    id: 'exam-residanat-medicales',
    moduleId: 'cardio',
    title: 'Concours de Résidanat — Épreuve de Spécialités Médicales',
    subtitle: 'Annales de concours : synthèse multidisciplinaire et cas cliniques',
    cycle: 'residanat',
    cycleLabel: 'Concours National de Résidanat',
    yearNumber: 8,
    questionCount: 60,
    durationMinutes: 90,
    difficulty: 'Concours',
    isAvailable: true,
    tag: 'Format Concours',
  },
  {
    id: 'exam-pediatrie-clinique',
    moduleId: 'pediatrie',
    title: 'Épreuve Clinique — Pédiatrie & Néonatologie',
    subtitle: 'Développement psychomoteur, pathologies respiratoires et vaccinations',
    cycle: 'clinique',
    cycleLabel: '5ème Année • Cycle Clinique',
    yearNumber: 5,
    questionCount: 40,
    durationMinutes: 60,
    difficulty: 'Difficile',
    isAvailable: true,
  },
];

export default function ExamsHubPage() {
  const router = useRouter();
  const [selectedCycle, setSelectedCycle] = useState<'all' | 'preclinique' | 'clinique' | 'residanat'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customModuleId, setCustomModuleId] = useState('cardio');
  const [customCount, setCustomCount] = useState(40);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Extract all modules from curriculum for custom exam generator
  const allCurriculumModules = useMemo(() => {
    const list: { id: string; name: string; year: string }[] = [];
    CURRICULUM_DATA.forEach((year) => {
      year.categories.forEach((cat) => {
        cat.modules.forEach((mod) => {
          list.push({
            id: mod.id,
            name: `${mod.nameFr} (${year.label.split(' ')[0]} Année)`,
            year: year.label,
          });
        });
      });
    });
    return list;
  }, []);

  // Filtered list of mock exams
  const filteredExams = useMemo(() => {
    return FEATURED_EXAMS.filter((exam) => {
      const matchCycle = selectedCycle === 'all' || exam.cycle === selectedCycle;
      const matchSearch =
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.cycleLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCycle && matchSearch;
    });
  }, [selectedCycle, searchQuery]);

  function handleStartCustomExam() {
    router.push(`/fr/quiz/${customModuleId}?mode=exam&count=${customCount}`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary-100 dark:border-dark-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge-free text-[11px] font-black uppercase tracking-wider">
              Simulateur Officiel
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
              <Timer className="w-3.5 h-3.5" /> 90s / Question
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50 flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary-600" />
            Examens Blancs & Simulations
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 max-w-2xl">
            Entraînez-vous dans les conditions réelles d&apos;examen : chronomètre actif, aucune correction pendant l&apos;épreuve et notation officielle sur 20.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInfoModalOpen(true)}
          className="btn-secondary text-xs sm:text-sm py-2 px-4 flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-primary-600" />
          Comment fonctionne le mode examen ?
        </button>
      </div>

      {/* Rules Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border-2 border-primary-100 dark:border-dark-border flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Temps Limité
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Chronomètre individuel décomptant le temps exact alloué à votre session.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border-2 border-primary-100 dark:border-dark-border flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Correction Différée
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Pas d&apos;indices ni de réponses immédiates : le rapport complet s&apos;affiche à la soumission.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border-2 border-primary-100 dark:border-dark-border flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Note Médicale sur 20
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Calcul conforme avec barème officiel et ciblage immédiat de vos lacunes.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Custom Simulation Builder */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border-2 border-emerald-200 dark:border-emerald-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-300">
              Générateur d&apos;Épreuve
            </span>
            <h2 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
              Lancer un Examen Blanc Personnalisé
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Format libre chronométré
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Matière ou Module
            </label>
            <select
              value={customModuleId}
              onChange={(e) => setCustomModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-bold text-gray-800 dark:text-gray-200 focus:border-emerald-500 outline-hidden"
            >
              {allCurriculumModules.slice(0, 30).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Nombre de questions
            </label>
            <select
              value={customCount}
              onChange={(e) => setCustomCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-bold text-gray-800 dark:text-gray-200 focus:border-emerald-500 outline-hidden"
            >
              <option value={20}>20 questions (30 min)</option>
              <option value={40}>40 questions (60 min)</option>
              <option value={60}>60 questions (90 min)</option>
              <option value={80}>80 questions (120 min)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="button"
              onClick={handleStartCustomExam}
              className="btn-primary w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              Démarrer l&apos;examen
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Cycle Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCycle('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedCycle === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-emerald-400'
              }`}
            >
              Tous les examens
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('preclinique')}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedCycle === 'preclinique'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-emerald-400'
              }`}
            >
              Sciences Pré-cliniques (1-3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('clinique')}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedCycle === 'clinique'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-emerald-400'
              }`}
            >
              Cycle Clinique (4-6)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('residanat')}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedCycle === 'residanat'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-emerald-400'
              }`}
            >
              Concours de Résidanat
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une épreuve..."
              className="input pl-10 text-xs py-2 rounded-2xl w-full"
            />
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="card p-6 border-2 border-primary-100 dark:border-dark-border hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4 relative overflow-hidden group shadow-xs hover:shadow-md"
            >
              {exam.tag && (
                <div className="absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {exam.tag}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    {exam.cycleLabel}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-[11px] font-bold text-gray-500">
                    Difficulté : {exam.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-black text-[#1a2e25] dark:text-green-50 leading-snug group-hover:text-emerald-600 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {exam.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                    {exam.questionCount} QCMs
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {exam.durationMinutes} min
                  </span>
                </div>

                <Link
                  href={`/fr/quiz/${exam.moduleId}?mode=exam&count=${exam.questionCount}`}
                  className="btn-primary text-xs py-2 px-4 shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Démarrer l&apos;épreuve
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12 card border border-dashed border-gray-200 dark:border-dark-border">
            <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Aucune épreuve trouvée pour ces critères
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Essayez un autre mot-clé ou sélectionnez &apos;Tous les examens&apos;.
            </p>
          </div>
        )}
      </div>

      {/* Notice about Content Compilation */}
      <div className="p-4 rounded-2xl bg-surface-50 dark:bg-dark-muted border border-gray-200 dark:border-dark-border flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p className="font-bold text-gray-800 dark:text-gray-200">
            Programme des simulations d&apos;examens
          </p>
          <p>
            Les épreuves d&apos;entraînement ci-dessus permettent de tester le moteur chronométré en conditions réelles. Les annales complètes et corrigées des facultés de médecine algériennes sont indexées progressivement au fur et à mesure de leur validation.
          </p>
        </div>
      </div>

      {/* Info Modal */}
      {infoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in"
        >
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 max-w-lg w-full border-2 border-primary-200 dark:border-dark-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
              <h3 id="modal-title" className="text-base font-black text-[#1a2e25] dark:text-green-50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                Règles du Mode Examen
              </h3>
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>1. Chronométrage continu :</strong> Le temps imparti est calculé à raison de 90 secondes par question. Une fois le temps écoulé, l&apos;épreuve est clôturée automatiquement.
              </p>
              <p>
                <strong>2. Aucune validation intermédiaire :</strong> Contrairement au mode apprentissage, vous ne découvrez pas si votre réponse est exacte immédiatement. Vous pouvez modifier vos choix avant de soumettre.
              </p>
              <p>
                <strong>3. Intégrité de session :</strong> Si vous quittez la fenêtre ou changez d&apos;onglet, un avertissement de changement d&apos;onglet est enregistré sur votre bilan final.
              </p>
              <p>
                <strong>4. Note officielle :</strong> Votre note finale est calculée sur 20 avec le corrigé complet et les explications détaillées disponibles dès la fin de l&apos;épreuve.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="btn-primary text-xs py-2 px-5 cursor-pointer"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
