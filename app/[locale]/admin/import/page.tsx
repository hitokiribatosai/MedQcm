'use client';

import { useState } from 'react';
import {
  UploadCloud, FileText, Sparkles, CheckCircle2,
  AlertCircle, ArrowRight, BookOpen, Layers, Check, Loader2
} from 'lucide-react';
import { CURRICULUM_DATA } from '@/lib/data/curriculum-metadata';

interface ParsedQuestion {
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedModule, setSelectedModule] = useState<string>('mod-anat-general');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[] | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setParsedQuestions(null);
      setIsSaved(false);
    }
  }

  function handleExtractWithAI() {
    if (!file) return;
    setIsProcessing(true);

    // Simulate AI extraction pipeline (unpdf text extraction + Gemini API structured parsing)
    setTimeout(() => {
      setIsProcessing(false);
      setParsedQuestions([
        {
          questionText: 'Concernant l\'artère méningée moyenne, quelle proposition est EXACTE ?',
          options: [
            { text: 'Elle naît de l\'artère carotide interne dans le canal carotidien.', isCorrect: false },
            { text: 'Elle pénètre dans le crâne par le trou rond (foramen rotundum).', isCorrect: false },
            { text: 'Elle passe par le foramen épineux (trou petit rond) pour vasculariser la dure-mère.', isCorrect: true },
            { text: 'Elle est une branche terminale de l\'artère faciale.', isCorrect: false },
          ],
          explanation: 'L\'artère méningée moyenne est une branche collatérale de l\'artère maxillaire (branche terminale de la carotide externe). Elle traverse le foramen épineux.',
          difficulty: 'medium',
        },
        {
          questionText: 'Quel nerf chemine dans la loge postérieure de la jambe avec les vaisseaux tibiaux postérieurs ?',
          options: [
            { text: 'Nerf fibulaire commun', isCorrect: false },
            { text: 'Nerf tibial (sciatique poplité interne)', isCorrect: true },
            { text: 'Nerf fémoral', isCorrect: false },
            { text: 'Nerf saphène', isCorrect: false },
          ],
          explanation: 'Le nerf tibial traverse la fosse poplitée puis s\'engage sous l\'arcade soléaire dans la loge postérieure profonde de la jambe.',
          difficulty: 'easy',
        },
        {
          questionText: 'Parmi les muscles suivants de l\'éminence thénar, quel muscle est innervé par le nerf ulnaire ?',
          options: [
            { text: 'Muscle court abducteur du pouce', isCorrect: false },
            { text: 'Muscle opposant du pouce', isCorrect: false },
            { text: 'Muscle adducteur du pouce (m. adductor pollicis)', isCorrect: true },
            { text: 'Chef superficiel du court fléchisseur du pouce', isCorrect: false },
          ],
          explanation: 'Le muscle adducteur du pouce et le chef profond du court fléchisseur sont innervés par le rameau profond du nerf ulnaire. Les autres sont innervés par le nerf médian.',
          difficulty: 'hard',
        },
      ]);
    }, 1800);
  }

  function handleSaveToModule() {
    setIsSaved(true);
  }

  const currentYearObj = CURRICULUM_DATA.find((y) => y.number === selectedYear);

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <span className="badge-free text-[11px] mb-1 font-bold uppercase">
          Pipeline Automatisé
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
          Import de Cours PDF & Extraction IA
        </h1>
        <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
          Téléversez vos polycopiés de cours, fiches de révision ou annales PDF. L'algorithme Gemini analyse le texte et génère des QCMs complets avec corrections et justifications théoriques.
        </p>
      </div>

      {/* Target Module Configuration */}
      <div className="card p-6 border border-primary-200 dark:border-dark-border space-y-4">
        <h2 className="text-base font-bold text-[#1a2e25] dark:text-green-50 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-600" />
          1. Destination des questions
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Année d'étude
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input text-xs w-full"
            >
              {CURRICULUM_DATA.map((y) => (
                <option key={y.number} value={y.number}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Module de destination
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="input text-xs w-full"
            >
              {currentYearObj?.categories.flatMap((c) =>
                c.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {c.nameFr} — {m.nameFr}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card p-8 border-2 border-dashed border-primary-300 dark:border-dark-border rounded-2xl text-center space-y-4 bg-primary-50/20 dark:bg-dark-card/50">
        <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center mx-auto shadow-sm">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1a2e25] dark:text-green-50">
            {file ? file.name : 'Sélectionnez ou glissez un fichier PDF médical'}
          </h3>
          <p className="text-xs text-[#4b7a62] dark:text-green-400 mt-1">
            Polycopiés de faculté, annales scannées, cours universitaires (max 25 Mo)
          </p>
        </div>

        <div>
          <label className="btn-primary text-xs py-2.5 px-4 cursor-pointer inline-flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Parcourir les fichiers
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Extract Trigger */}
      {file && !parsedQuestions && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleExtractWithAI}
            className="btn-primary text-sm py-3 px-6 shadow-glow gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraction et génération des QCMs par IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-accent-300" />
                Lancer l'extraction intelligente
              </>
            )}
          </button>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedQuestions && (
        <div className="card p-6 border border-primary-200 dark:border-dark-border space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              {parsedQuestions.length} QCMs extraits avec succès !
            </div>

            {!isSaved ? (
              <button
                type="button"
                onClick={handleSaveToModule}
                className="btn-primary text-xs py-2 px-4 shadow-sm gap-1.5"
              >
                <Check className="w-4 h-4" />
                Enregistrer dans la banque
              </button>
            ) : (
              <span className="badge-free text-xs font-bold">
                ✓ Enregistré dans le module !
              </span>
            )}
          </div>

          <div className="space-y-4">
            {parsedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    Question #{idx + 1}
                  </span>
                  <span className="font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-muted">
                    {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-bold text-[#1a2e25] dark:text-green-50">
                  {q.questionText}
                </p>

                <div className="space-y-1.5 text-xs">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg border flex items-center gap-2 ${
                        opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 font-bold'
                          : 'border-gray-100 text-gray-600 dark:border-dark-border dark:text-gray-400'
                      }`}
                    >
                      <span className="font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                      <span className="flex-1">{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-semibold">
                          Vrai
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-primary-50/50 dark:bg-dark-muted/50 rounded-lg text-xs text-[#2d523f] dark:text-green-300">
                  <strong>Justification :</strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
