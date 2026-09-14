'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flag, CheckCircle2, AlertTriangle, Search, Filter,
  ExternalLink, Edit3, Trash2, ArrowRight
} from 'lucide-react';

interface QuestionReport {
  id: string;
  questionId: string;
  questionText: string;
  source: string;
  reason: string;
  comment: string;
  studentName: string;
  date: string;
  status: 'pending' | 'resolved';
}

const INITIAL_REPORTS: QuestionReport[] = [
  {
    id: 'rep-1',
    questionId: 'q2',
    questionText: 'Concernant l\'articulation scapulo-humérale, quelles propositions sont vraies ?',
    source: 'Faculté d\'Anatomie 2023',
    reason: 'Erreur dans la correction (la bonne réponse est fausse)',
    comment: 'Bonjour, dans la proposition C, le muscle supra-épineux est bien l\'initiateur des 15 premiers degrés d\'abduction d\'après le cours du Pr. Benali. Merci de vérifier.',
    studentName: 'Dr. Yasmine Benali',
    date: 'Aujourd\'hui à 10:14',
    status: 'pending',
  },
  {
    id: 'rep-2',
    questionId: 'fb-q3',
    questionText: 'Devant une suspicion d\'embolie pulmonaire chez un patient instable sur le plan hémodynamique...',
    source: 'Urgences & Réanimation',
    reason: 'Énoncé ambigu ou mal formulé',
    comment: 'L\'ETT au lit du patient est souvent l\'examen d\'urgence immédiat quand le malade est intransportable au scanner.',
    studentName: 'Amine Larbi',
    date: 'Hier à 18:30',
    status: 'pending',
  },
  {
    id: 'rep-3',
    questionId: 'q1',
    questionText: 'Concernant l\'ostéologie du membre supérieur, quelle affirmation est EXACTE ?',
    source: 'Annales 2024',
    reason: 'Faute de frappe ou coquille',
    comment: 'Une petite faute d\'orthographe sur le mot tubérosité.',
    studentName: 'Karim Mansouri',
    date: '09 Sept. 2026',
    status: 'resolved',
  }
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<QuestionReport[]>(INITIAL_REPORTS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [search, setSearch] = useState('');

  // Load client-side reports from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('medqcm_question_reports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const adapted = parsed.map((p: any) => ({
            id: p.id,
            questionId: p.questionId,
            questionText: p.questionText,
            source: 'Session Étudiant',
            reason: p.reason === 'correction_error' ? 'Erreur dans la correction' : 'Remarque étudiante',
            comment: p.comment,
            studentName: 'Étudiant MedQCM',
            date: 'Récent',
            status: p.status || 'pending',
          }));
          setReports((prev) => [...adapted, ...prev]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function handleResolve(id: string) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r))
    );
  }

  const filtered = reports.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.questionText.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-free text-[11px] mb-1 font-black uppercase">
            Contrôle Qualité Médicale
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
            Signalements & Retours Étudiants
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Traitez les erreurs et ambiguïtés signalées par les étudiants pour maintenir une banque de questions irréprochable.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 text-amber-950 font-black text-xs shadow-sm self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4" />
            <span>{pendingCount} signalement(s) à examiner</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-dark-muted rounded-2xl self-start">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'pending'
                ? 'bg-white dark:bg-dark-card text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            En attente ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'resolved'
                ? 'bg-white dark:bg-dark-card text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Résolus ({reports.filter((r) => r.status === 'resolved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tous ({reports.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par mot clé..."
            className="input pl-9 text-xs py-2 w-full rounded-xl"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            Aucun signalement en attente. Votre banque de questions est à jour !
          </div>
        ) : (
          filtered.map((rep) => (
            <div
              key={rep.id}
              className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                    <Flag className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase">
                      {rep.reason}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Signalé par {rep.studentName} • {rep.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rep.status === 'pending' ? (
                    <span className="text-[11px] font-black uppercase text-amber-700 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                      En attente
                    </span>
                  ) : (
                    <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                      ✓ Résolu
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400">Énoncé du QCM :</span>
                <p className="text-sm font-black text-[#1a2e25] dark:text-green-50">
                  {rep.questionText}
                </p>
              </div>

              {/* Student Comment / Justification */}
              <div className="p-3.5 bg-gray-50 dark:bg-dark-muted rounded-xl text-xs space-y-1 text-gray-700 dark:text-gray-300 border">
                <strong className="text-emerald-800 dark:text-emerald-300 block">
                  Remarque de l'étudiant :
                </strong>
                <p className="italic leading-relaxed">« {rep.comment} »</p>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/fr/admin/questions"
                  className="btn-duo-green text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Modifier ce QCM dans la banque
                </Link>

                {rep.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(rep.id)}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marquer comme corrigé
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
