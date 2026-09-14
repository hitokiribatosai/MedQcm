'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FolderArchive, FileText, Download, Lock, Search,
  BookOpen, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { CURRICULUM_DATA, CoursePdf } from '@/lib/data/curriculum';

export default function StudentDepotPage() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [search, setSearch] = useState('');

  const currentYearObj = CURRICULUM_DATA.find((y) => y.number === selectedYear);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-free text-[11px] mb-1 font-black uppercase">
            Bibliothèque Numérique Médicale
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
            Dépôt des Cours & Polycopiés Officiels
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Consultez et téléchargez les polycopiés de faculté classés par année et par matière pour accompagner vos révisions.
          </p>
        </div>

        <Link
          href="/fr/subscribe"
          className="btn-duo-gold self-start sm:self-auto text-xs sm:text-sm shadow-md"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          Pass Téléchargement Illimité
        </Link>
      </div>

      {/* Year Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {CURRICULUM_DATA.map((y) => (
          <button
            key={y.number}
            type="button"
            onClick={() => setSelectedYear(y.number)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              selectedYear === y.number
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-emerald-400'
            }`}
          >
            {y.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un polycopié, un chapitre, un enseignant..."
          className="input pl-10 text-xs sm:text-sm py-2.5 rounded-2xl w-full"
        />
      </div>

      {/* Categories and Attached PDFs */}
      <div className="space-y-8">
        {currentYearObj?.categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-100 dark:border-dark-border">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
                {cat.nameFr}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {cat.modules.map((mod) => {
                const docs: CoursePdf[] = mod.documents || [
                  {
                    id: `pdf-default-${mod.id}`,
                    moduleId: mod.id,
                    title: `Polycopié de Référence — ${mod.nameFr}`,
                    professor: 'Faculté de Médecine',
                    fileSize: '5.2 Mo',
                    pagesCount: 45,
                    uploadDate: 'Rentrée 2026',
                    isFree: mod.isFree,
                  }
                ];

                const filteredDocs = docs.filter((d) =>
                  !search ||
                  d.title.toLowerCase().includes(search.toLowerCase()) ||
                  d.professor?.toLowerCase().includes(search.toLowerCase())
                );

                if (filteredDocs.length === 0 && search) return null;

                return (
                  <div
                    key={mod.id}
                    className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xs text-gray-400">
                          {mod.nameFr}
                        </span>
                        {mod.isFree ? (
                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                            1er Module Gratuit
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 dark:bg-dark-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Abonnement
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {filteredDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-muted border flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-black text-xs shrink-0">
                                PDF
                              </div>
                              <div>
                                <h3 className="font-bold text-xs sm:text-sm text-[#1a2e25] dark:text-green-50 leading-snug">
                                  {doc.title}
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {doc.professor} • {doc.pagesCount} pages • {doc.fileSize}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                      {mod.isFree ? (
                        <button
                          type="button"
                          onClick={() => alert('Téléchargement du polycopié officiel en cours...')}
                          className="btn-duo-green text-xs py-2 px-4 shadow-xs flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Consulter le PDF
                        </button>
                      ) : (
                        <Link
                          href="/fr/subscribe"
                          className="text-xs font-black text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Débloquer ce cours
                        </Link>
                      )}

                      <Link
                        href={`/fr/quiz/${mod.id}?mode=exploration`}
                        className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        Faire les QCMs <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
