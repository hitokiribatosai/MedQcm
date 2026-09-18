'use client';

import { useState } from 'react';
import {
  HelpCircle, Plus, Trash2, Edit3, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, X, Sparkles, BookOpen
} from 'lucide-react';
import { CURRICULUM_DATA, QuestionData } from '@/lib/data/curriculum-metadata';

export default function AdminQuestionsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [source, setSource] = useState('Annales Faculté 2024');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  // Sample questions list
  const [questionsList, setQuestionsList] = useState<QuestionData[]>(() => {
    const list: QuestionData[] = [];
    CURRICULUM_DATA.forEach((y) => {
      y.categories.forEach((c) => {
        c.modules.forEach((m) => {
          if (m.questions) {
            list.push(...m.questions);
          }
        });
      });
    });
    return list;
  });

  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQ: QuestionData = {
      id: `q-${Date.now()}`,
      questionText,
      explanation,
      difficulty,
      source,
      options: options.map((o, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: o.text || `Option ${idx + 1}`,
        isCorrect: o.isCorrect,
      })),
    };

    setQuestionsList([newQ, ...questionsList]);
    setIsModalOpen(false);
    // Reset form
    setQuestionText('');
    setExplanation('');
  }

  function handleDelete(id: string) {
    if (confirm('Supprimer cette question de la base de données ?')) {
      setQuestionsList(questionsList.filter((q) => q.id !== id));
    }
  }

  const filtered = questionsList.filter((q) => {
    if (search) {
      const s = search.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(s) ||
        q.source.toLowerCase().includes(s) ||
        q.explanation.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-free text-[11px] mb-1 font-bold uppercase">
            Banque de Données
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
            Gestion des Questions & QCMs
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Ajoutez, modifiez et organisez les épreuves de médecine par année et par module.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary self-start sm:self-auto gap-2 shadow-glow text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter un QCM
        </button>
      </div>

      {/* Year Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {CURRICULUM_DATA.map((y) => (
            <button
              key={y.number}
              type="button"
              onClick={() => setSelectedYear(y.number)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedYear === y.number
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-primary-400'
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un mot clé..."
            className="input pl-9 text-xs py-2 w-full"
          />
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            Aucun QCM ne correspond à votre recherche.
          </div>
        ) : (
          filtered.map((q, idx) => (
            <div
              key={q.id}
              className="card p-5 border border-primary-200 dark:border-dark-border space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                    QCM #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    {q.source}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    q.difficulty === 'easy'
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : q.difficulty === 'hard'
                      ? 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300'
                      : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    title="Supprimer la question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-bold text-[#1a2e25] dark:text-green-50">
                {q.questionText}
              </p>

              {/* Options Preview */}
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={opt.id}
                    className={`p-2 rounded-lg border flex items-center gap-2 ${
                      opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 font-semibold'
                        : 'border-gray-200 text-gray-600 dark:border-dark-border dark:text-gray-400'
                    }`}
                  >
                    <span className="font-mono font-bold">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    <span className="flex-1 truncate">{opt.text}</span>
                    {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="text-xs bg-gray-50 dark:bg-dark-muted/50 p-3 rounded-xl border border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-300">
                  <strong className="text-primary-700 dark:text-primary-400">Explication : </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-primary-200 dark:border-dark-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a2e25] dark:text-green-50">
                Ajouter une question médicale
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-[#1a2e25] dark:text-green-100">
                  Énoncé de la question * (en français)
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ex: Concernant l'artère coronaire gauche, quelle affirmation est exacte..."
                  className="input w-full resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#1a2e25] dark:text-green-100">
                    Source / Session
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Ex: Concours Résidanat Alger 2023"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#1a2e25] dark:text-green-100">
                    Niveau de difficulté
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="input w-full"
                  >
                    <option value="easy">Facile (Connaissances de base)</option>
                    <option value="medium">Moyen (Application clinique)</option>
                    <option value="hard">Difficile (Dossier classant)</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block font-semibold text-[#1a2e25] dark:text-green-100">
                  Propositions de réponse (Cochez la ou les bonnes réponses)
                </label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i].isCorrect = e.target.checked;
                        setOptions(newOpts);
                      }}
                      className="w-4 h-4 text-primary-600 rounded cursor-pointer"
                      title="Marquer comme bonne réponse"
                    />
                    <span className="font-bold w-4">{String.fromCharCode(65 + i)}</span>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i].text = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Proposition ${String.fromCharCode(65 + i)}`}
                      className="input flex-1 text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-semibold mb-1 text-[#1a2e25] dark:text-green-100">
                  Explication médicale & justification
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Justification théorique d'après les recommandations officielles..."
                  className="input w-full resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-ghost text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-bold shadow-glow"
                >
                  Enregistrer le QCM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
