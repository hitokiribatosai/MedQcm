'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FolderArchive, UploadCloud, FileText, Plus, Trash2,
  Download, Sparkles, BookOpen, Layers, Check, X, Search
} from 'lucide-react';
import { CURRICULUM_DATA, CoursePdf } from '@/lib/data/curriculum';

interface DepotItem extends CoursePdf {
  yearNumber: number;
  categoryName: string;
  moduleName: string;
}

const INITIAL_DEPOT: DepotItem[] = [
  {
    id: 'pdf-1',
    moduleId: 'mod-anat-general',
    yearNumber: 1,
    categoryName: 'Anatomie Humaine',
    moduleName: 'Anatomie Générale & Ostéologie',
    title: 'Polycopié Officiel — Ostéologie Générale & Repères Cardinaux',
    professor: 'Pr. Benali / Faculté de Médecine',
    fileSize: '4.8 Mo',
    pagesCount: 42,
    uploadDate: '05 Sept. 2026',
    isFree: true,
  },
  {
    id: 'pdf-2',
    moduleId: 'mod-anat-general',
    yearNumber: 1,
    categoryName: 'Anatomie Humaine',
    moduleName: 'Anatomie Générale & Ostéologie',
    title: 'Fiche Synthèse — Articulations & Loges du Membre Supérieur',
    professor: 'Collège National d\'Anatomie',
    fileSize: '2.1 Mo',
    pagesCount: 16,
    uploadDate: '01 Sept. 2026',
    isFree: true,
  },
  {
    id: 'pdf-3',
    moduleId: 'mod-hemodynamique',
    yearNumber: 2,
    categoryName: 'Physiologie Cardiovasculaire',
    moduleName: 'Cycle Cardiaque & Hémodynamique',
    title: 'Support Magistral — Régulation Hémodynamique & Bruits du Cœur',
    professor: 'Dr. Mansouri / CHU Alger',
    fileSize: '6.3 Mo',
    pagesCount: 54,
    uploadDate: '10 Sept. 2026',
    isFree: true,
  },
  {
    id: 'pdf-4',
    moduleId: 'mod-syndrome-coronaire',
    yearNumber: 4,
    categoryName: 'Cardiologie',
    moduleName: 'Syndromes Coronariens Aigus (SCA)',
    title: 'Guide Pratique — Prise en Charge des SCA ST+ et ST- (Recommandations ESC)',
    professor: 'Collège des Enseignants de Cardiologie',
    fileSize: '8.5 Mo',
    pagesCount: 68,
    uploadDate: '12 Sept. 2026',
    isFree: false,
  }
];

export default function AdminDepotPage() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedModule, setSelectedModule] = useState<string>('mod-anat-general');
  const [items, setItems] = useState<DepotItem[]>(INITIAL_DEPOT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [pdfTitle, setPdfTitle] = useState('');
  const [professor, setProfessor] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const currentYearObj = CURRICULUM_DATA.find((y) => y.number === selectedYear);

  // All modules in selected year
  const yearModules = currentYearObj?.categories.flatMap((c) =>
    c.modules.map((m) => ({ ...m, categoryName: c.nameFr }))
  ) || [];

  const currentModuleObj = yearModules.find((m) => m.id === selectedModule);

  function handleAddPdf(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfTitle.trim()) return;

    const newItem: DepotItem = {
      id: `pdf-${Date.now()}`,
      moduleId: selectedModule,
      yearNumber: selectedYear,
      categoryName: currentModuleObj?.categoryName || 'Module',
      moduleName: currentModuleObj?.nameFr || 'Module',
      title: pdfTitle,
      professor: professor || 'Faculté de Médecine',
      fileSize: uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} Mo` : '3.5 Mo',
      pagesCount: Math.floor(Math.random() * 30) + 20,
      uploadDate: 'Aujourd\'hui',
      isFree: currentModuleObj?.isFree ?? false,
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    setPdfTitle('');
    setProfessor('');
    setUploadedFile(null);
  }

  function handleDelete(id: string) {
    if (confirm('Supprimer ce polycopié du dépôt ?')) {
      setItems(items.filter((item) => item.id !== id));
    }
  }

  // Filter items for current selected module / search
  const filtered = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.professor?.toLowerCase().includes(q) ||
        item.moduleName.toLowerCase().includes(q)
      );
    }
    return item.yearNumber === selectedYear && item.moduleId === selectedModule;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-free text-[11px] mb-1 font-black uppercase">
            Bibliothèque Universitaire
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
            Dépôt des Cours & Polycopiés PDF
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Gérez les documents de cours rattachés à chaque année et à chaque module d'étude.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-duo-green self-start sm:self-auto gap-2 shadow-md text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Déposer un Cours PDF
        </button>
      </div>

      {/* Year Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {CURRICULUM_DATA.map((y) => (
          <button
            key={y.number}
            type="button"
            onClick={() => {
              setSelectedYear(y.number);
              const firstMod = y.categories[0]?.modules[0]?.id;
              if (firstMod) setSelectedModule(firstMod);
            }}
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

      {/* Module Selector & Search Toolbar */}
      <div className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
              Choisir le module de destination dans {currentYearObj?.label} :
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="input font-bold text-xs sm:text-sm w-full rounded-xl"
            >
              {yearModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.categoryName} — {m.nameFr} {m.isFree ? '(Module Gratuit)' : '(Abonnement)'}
                </option>
              ))}
            </select>
          </div>

          <div className="relative max-w-xs w-full self-end">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre ou prof..."
              className="input pl-9 text-xs py-2 w-full rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* PDFs List in current Module */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#1a2e25] dark:text-green-50 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-emerald-600" />
            Polycopiés attachés à {currentModuleObj?.nameFr || 'ce module'} ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-dark-muted flex items-center justify-center mx-auto text-gray-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500">
              Aucun polycopié PDF n'a encore été déposé pour ce module.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-duo-green text-xs py-2 px-4 shadow-xs"
            >
              + Déposer le premier cours PDF
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((pdf) => (
              <div
                key={pdf.id}
                className="card p-5 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl hover:border-emerald-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        PDF
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                          {pdf.moduleName}
                        </span>
                        <h3 className="font-black text-sm text-[#1a2e25] dark:text-green-50 line-clamp-2 mt-1">
                          {pdf.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(pdf.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Supprimer du dépôt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 space-y-0.5 mt-3">
                    <p>👨‍🏫 <strong>Auteur / Prof :</strong> {pdf.professor}</p>
                    <p>📄 <strong>Format :</strong> {pdf.pagesCount} pages • {pdf.fileSize}</p>
                    <p>📅 <strong>Date d'ajout :</strong> {pdf.uploadDate}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 cursor-not-allowed"
                    title="Fichier en cours d'indexation"
                  >
                    <Download className="w-4 h-4" />
                    Fichier en préparation
                  </span>

                  {/* AI QCM Extraction Shortcut */}
                  <Link
                    href={`/fr/admin/import?year=${pdf.yearNumber}&module=${pdf.moduleId}`}
                    className="btn-duo-green text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    Générer QCMs via IA
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add PDF Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="badge-free text-[10px] font-black uppercase mb-1">
                  Nouveau Polycopié
                </span>
                <h3 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
                  Déposer un document de cours
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPdf} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-gray-700 dark:text-gray-300 mb-1">
                  Module de destination :
                </label>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-muted border font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  {currentYearObj?.label} → {currentModuleObj?.nameFr}
                </div>
              </div>

              <div>
                <label className="block font-black text-gray-700 dark:text-gray-300 mb-1">
                  Titre du cours / polycopié *
                </label>
                <input
                  type="text"
                  required
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="Ex: Polycopié Officiel — Anatomie du Thorax & Médiastin"
                  className="input rounded-xl"
                />
              </div>

              <div>
                <label className="block font-black text-gray-700 dark:text-gray-300 mb-1">
                  Enseignant / Faculté / Référence
                </label>
                <input
                  type="text"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  placeholder="Ex: Pr. Benali — Faculté d'Alger"
                  className="input rounded-xl"
                />
              </div>

              {/* Upload Drop Area */}
              <div>
                <label className="block font-black text-gray-700 dark:text-gray-300 mb-1">
                  Fichier PDF du cours *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-border hover:border-emerald-500 rounded-2xl p-5 text-center transition-all bg-gray-50/50">
                  <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {uploadedFile ? uploadedFile.name : 'Sélectionnez un fichier PDF (max 25 Mo)'}
                  </p>
                  <label className="mt-2 inline-block text-xs font-black text-emerald-600 hover:underline cursor-pointer">
                    Parcourir les fichiers
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-ghost text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-duo-green text-xs py-2.5 px-4 shadow"
                >
                  Enregistrer dans le Dépôt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
