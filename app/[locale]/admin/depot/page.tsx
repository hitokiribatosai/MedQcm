'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  FolderArchive, UploadCloud, FileText, Plus, Trash2,
  Download, Sparkles, X, Search
} from 'lucide-react';
import { CURRICULUM_DATA, CoursePdf } from '@/lib/data/curriculum';

interface DepotItem extends CoursePdf {
  yearNumber: number;
  categoryName: string;
  moduleName: string;
  faculty?: string;
  isDraft?: boolean;
}

const INITIAL_DEPOT: DepotItem[] = [
  {
    id: 'pdf-1',
    moduleId: 'mod-y1-anat-general',
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
    moduleId: 'mod-y1-anat-general',
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
    moduleId: 'mod-y2-cardio',
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
    moduleId: 'mod-y4-cardio-sca',
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
  const [selectedModule, setSelectedModule] = useState<string>(CURRICULUM_DATA[0]?.categories[0]?.modules[0]?.id || '');
  const [items, setItems] = useState<DepotItem[]>(INITIAL_DEPOT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [destinationYear, setDestinationYear] = useState('');
  const [destinationModule, setDestinationModule] = useState('');
  const [faculty, setFaculty] = useState('');
  const [formError, setFormError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const destinationYearObj = CURRICULUM_DATA.find(y => String(y.number) === destinationYear);
  const destinationModules = destinationYearObj?.categories.flatMap(c => c.modules.map(m => ({...m, categoryName: c.nameFr}))) || [];
  const destination = destinationModules.find(m => m.id === destinationModule);
  useEffect(() => {
    if (!isModalOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); trigger?.focus(); };
  }, [isModalOpen]);
  function openForm() {
    setDestinationYear(''); setDestinationModule(''); setPdfTitle('');
    setProfessor(''); setFaculty(''); setUploadedFile(null);
    setFormError(''); setReviewing(false); setIsModalOpen(true);
  }

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
    if (!destinationYearObj || !destination || !pdfTitle.trim() || !uploadedFile) {
      setFormError('Choisissez une année, un module, un fichier PDF et un titre.'); return;
    }
    if (!uploadedFile.name.toLowerCase().endsWith('.pdf') || uploadedFile.size > 25 * 1024 * 1024 || uploadedFile.size === 0) {
      setFormError('Sélectionnez un PDF non vide de 25 Mo maximum.'); return;
    }
    setFormError('');
    if (!reviewing) { setReviewing(true); return; }

    const newItem: DepotItem = {
      id: crypto.randomUUID(),
      moduleId: destination.id,
      yearNumber: destinationYearObj.number,
      categoryName: destination.categoryName,
      moduleName: destination.nameFr,
      title: pdfTitle.trim(),
      professor: professor.trim(),
      faculty: faculty.trim(),
      isDraft: true,
      fileSize: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} Mo`,
      pagesCount: 0,
      uploadDate: 'Aujourd\'hui',
      isFree: destination.isFree,
    };

    setItems(previous => [newItem, ...previous]);
    setSelectedYear(destinationYearObj.number);
    setSelectedModule(destination.id);
    setSearch('');
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
            Gérez les documents de cours rattachés à chaque année et à chaque module d&apos;étude.
          </p>
        </div>

        <button
          type="button"
          onClick={openForm}
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
              Aucun polycopié PDF n&apos;a encore été déposé pour ce module.
            </p>
            <button
              type="button"
              onClick={openForm}
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
                    <p>👨‍🏫 <strong>Auteur / Prof :</strong> {pdf.professor || 'Non renseigné'}</p>
                    {pdf.faculty && <p><strong>Faculté :</strong> {pdf.faculty}</p>}
                    {pdf.isDraft && <p className="text-amber-700 font-bold">Brouillon local — non publié, perdu après actualisation</p>}
                    <p>📄 <strong>Format :</strong> {pdf.pagesCount ? `${pdf.pagesCount} pages • ` : ''}{pdf.fileSize}</p>
                    <p>📅 <strong>Date d&apos;ajout :</strong> {pdf.uploadDate}</p>
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
                    href={`/${locale}/admin/import?year=${pdf.yearNumber}&module=${pdf.moduleId}`}
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
        <dialog ref={dialogRef} onCancel={() => setIsModalOpen(false)} aria-labelledby="upload-title" className="m-auto p-0 rounded-3xl w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto backdrop:bg-black/70">
          <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="badge-free text-[10px] font-black uppercase mb-1">
                  Nouveau Polycopié
                </span>
                <h3 id="upload-title" className="text-lg font-black text-[#1a2e25] dark:text-green-50">
                  Déposer un document de cours
                </h3>
              </div>
              <button
                type="button" aria-label="Fermer"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-700">Préparation locale uniquement : le fichier n’est pas téléversé. Le stockage et la publication seront connectés ultérieurement.</p>
            <form onSubmit={handleAddPdf} className="space-y-4 text-sm">
              {reviewing ? <section aria-labelledby="review-title" className="space-y-3">
                <h4 id="review-title" className="font-bold">Vérifier le brouillon</h4>
                <dl className="space-y-2 break-words">
                  <div><dt className="font-bold">Destination</dt><dd>{destinationYearObj?.label} → {destination?.nameFr}</dd></div>
                  <div><dt className="font-bold">Fichier</dt><dd>{uploadedFile?.name}</dd></div>
                  <div><dt className="font-bold">Titre</dt><dd>{pdfTitle}</dd></div>
                  <div><dt className="font-bold">Professeur</dt><dd>{professor || 'Non renseigné'}</dd></div>
                  <div><dt className="font-bold">Faculté</dt><dd>{faculty || 'Non renseignée'}</dd></div>
                </dl>
              </section> : <>
                <div><label htmlFor="pdf-year" className="block font-bold mb-1">1. Année / concours *</label>
                  <select id="pdf-year" required value={destinationYear} onChange={e => {setDestinationYear(e.target.value); setDestinationModule('');}} className="input">
                    <option value="">Choisir une année</option>
                    {CURRICULUM_DATA.map(y => <option key={y.number} value={y.number}>{y.label}</option>)}
                  </select>
                </div>
                <div><label htmlFor="pdf-module" className="block font-bold mb-1">2. Module de destination *</label>
                  <select id="pdf-module" required disabled={!destinationYear} value={destinationModule} onChange={e => setDestinationModule(e.target.value)} className="input">
                    <option value="">Choisir un module</option>
                    {destinationModules.map(m => <option key={m.id} value={m.id}>{m.categoryName} — {m.nameFr}</option>)}
                  </select>
                </div>
                <div><label htmlFor="pdf-file" className="block font-bold mb-1">3. Fichier PDF * (25 Mo maximum)</label>
                  <UploadCloud className="text-emerald-600 mb-2" />
                  <input id="pdf-file" type="file" accept=".pdf,application/pdf" required={!uploadedFile} onChange={e => {
                    const file = e.target.files?.[0] || null;
                    if (file && (!file.name.toLowerCase().endsWith('.pdf') || file.size > 25 * 1024 * 1024 || !file.size)) {
                      setUploadedFile(null); setFormError('Sélectionnez un PDF non vide de 25 Mo maximum.'); e.target.value = ''; return;
                    }
                    setFormError(''); setUploadedFile(file);
                    if (file && !pdfTitle.trim()) setPdfTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '));
                  }} className="block w-full" />
                  {uploadedFile && <p className="text-xs mt-1">{uploadedFile.name}</p>}
                </div>
                <div><label htmlFor="pdf-title" className="block font-bold mb-1">4. Titre du document *</label>
                  <input id="pdf-title" required maxLength={250} value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} className="input" />
                </div>
                <div><label htmlFor="pdf-professor" className="block font-bold mb-1">5. Professeur (facultatif)</label>
                  <input id="pdf-professor" maxLength={200} value={professor} onChange={e => setProfessor(e.target.value)} className="input" />
                </div>
                <div><label htmlFor="pdf-faculty" className="block font-bold mb-1">Faculté (facultatif)</label>
                  <input id="pdf-faculty" maxLength={200} value={faculty} onChange={e => setFaculty(e.target.value)} className="input" />
                </div>
              </>}
              {formError && <p role="alert" className="text-red-600">{formError}</p>}
              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Annuler</button>
                {reviewing && <button type="button" onClick={() => setReviewing(false)} className="btn-secondary">Modifier</button>}
                <button type="submit" className="btn-duo-green">{reviewing ? 'Ajouter le brouillon local' : '6. Vérifier le brouillon'}</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
