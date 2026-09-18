'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  FolderArchive, Download, Lock, Search,
  Sparkles, ArrowRight,
  Clock
} from 'lucide-react';
import { CURRICULUM_DATA, CoursePdf } from '@/lib/data/curriculum-metadata';

export default function StudentDepotPage() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<{ moduleName: string; title: string; moduleId: string } | null>(null);
  const locale = useLocale();
  const en = locale === 'en';
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!selectedDoc) return;
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, [selectedDoc]);

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
            Dépôt des Cours & Polycopiés
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Les documents sont en préparation. Leur disponibilité sera indiquée ici après publication.
          </p>
        </div>

        <Link
          href={`/${locale}/subscribe`}
          className="btn-duo-gold self-start sm:self-auto text-xs sm:text-sm shadow-md"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          Voir les abonnements
        </Link>
      </div>

      {/* Year Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {CURRICULUM_DATA.map((y) => (
          <button
            key={y.number}
            type="button"
            onClick={() => setSelectedYear(y.number)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
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

      {/* Modules & PDFs Grid */}
      <div className="space-y-6">
        {currentYearObj?.categories.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <h2 className="text-base font-black text-[#1a2e25] dark:text-green-50 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-emerald-600" />
              {cat.nameFr}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.modules.map((mod) => {
                const docs: CoursePdf[] = mod.documents || [
                  {
                    id: `${mod.id}-pdf-1`,
                    moduleId: mod.id,
                    title: `Polycopié — ${mod.nameFr}`,
                    professor: '',
                    fileSize: '',
                    pagesCount: 0,
                    uploadDate: '',
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
                                  {en ? 'Document in preparation' : 'Document en préparation'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                      <button
                          type="button"
                          onClick={() => {
                            setSelectedDoc({
                              moduleName: mod.nameFr,
                              title: filteredDocs[0]?.title || `Polycopié de ${mod.nameFr}`,
                              moduleId: mod.id,
                            });
                          }}
                          className="btn-duo-green text-xs py-2 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {en ? 'Document status' : 'État du document'}
                        </button>


                      {!!mod.questions?.length && <Link
                        href={`/${locale}/quiz/${mod.id}?mode=exploration`}
                        className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        {en ? 'Practice questions' : 'Faire les QCMs'} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Document Status Modal */}
      {selectedDoc && (
        <dialog
          ref={dialogRef}
          onCancel={() => setSelectedDoc(null)}
          aria-labelledby="depot-modal-title"
          className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl p-0 backdrop:bg-black/60"
        >
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-primary-200 dark:border-dark-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                    {en ? 'Document in preparation' : 'Document en préparation'}
                  </span>
                  <h3 id="depot-modal-title" className="text-sm sm:text-base font-black text-[#1a2e25] dark:text-green-50">
                    {selectedDoc.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
                aria-label={en ? 'Close' : 'Fermer'}
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {en ? 'This document is being prepared and is not available to download yet.' : 'Ce document est en préparation et n’est pas encore disponible au téléchargement.'}
            </p>

            <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="btn-secondary text-xs py-2 px-4 w-full sm:w-auto cursor-pointer"
              >
                {en ? 'Close' : 'Fermer'}
              </button>

            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
