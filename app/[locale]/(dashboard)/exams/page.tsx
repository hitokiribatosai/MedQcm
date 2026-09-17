"use client";

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Clock, Search, BookOpen } from 'lucide-react';
import { CURRICULUM_DATA } from '@/lib/data/curriculum';

export default function ExamsHubPage() {
  const locale = useLocale();
  const en = locale === 'en';
  const [year, setYear] = useState('all');
  const [search, setSearch] = useState('');
  const modules = CURRICULUM_DATA
    .filter(item => year === 'all' || String(item.number) === year)
    .flatMap(item => item.categories.flatMap(category => category.modules.map(module => ({ ...module, year: item.number }))))
    .filter(module => module.nameFr.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-black flex items-center gap-3"><Clock className="text-emerald-600" />{en ? 'Mock exams' : 'Examens blancs'}</h1>
        <p className="text-gray-600 dark:text-gray-300">{en ? 'Browse the curriculum while exam sessions are being prepared.' : 'Parcourez le programme pendant la préparation des sessions d’examen.'}</p>
      </header>
      <section className="card p-6 border-2 border-amber-200 space-y-2" aria-labelledby="exam-status">
        <h2 id="exam-status" className="font-bold">{en ? 'Sessions in preparation' : 'Sessions en préparation'}</h2>
        <p className="text-sm">{en ? 'No mock exam is published yet. Sessions will become available after their questions, scoring and timer have been verified. No official exam date has been announced here.' : 'Aucun examen blanc n’est encore publié. Les sessions seront disponibles après vérification des questions, du barème et du chronomètre. Aucune date officielle d’examen n’est annoncée ici.'}</p>
      </section>
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex flex-col gap-1 text-sm font-bold">
          {en ? 'Year / competition' : 'Année / concours'}
          <select className="input" value={year} onChange={event => setYear(event.target.value)}>
            <option value="all">{en ? 'All years' : 'Toutes les années'}</option>
            {CURRICULUM_DATA.map(item => <option key={item.number} value={item.number}>{en ? (item.number > 6 ? 'Residency competition' : `Year ${item.number}`) : item.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold flex-1">
          <span className="flex items-center gap-2"><Search size={16} />{en ? 'Search modules' : 'Rechercher une matière'}</span>
          <input type="search" className="input" value={search} onChange={event => setSearch(event.target.value)} />
        </label>
      </div>
      <p role="status" className="text-sm text-gray-500">{modules.length} {en ? 'modules' : 'matières'}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {modules.map(module => <article key={module.id} className="card p-5 space-y-3">
          <BookOpen className="text-emerald-600" size={20} />
          <h2 className="font-bold">{module.nameFr}</h2>
          <p className="text-sm text-gray-500">{en ? 'Exam session in preparation' : 'Session d’examen en préparation'}</p>
        </article>)}
      </div>
      {modules.length === 0 && <p className="card p-6">{en ? 'No modules match these filters.' : 'Aucune matière ne correspond à ces critères.'}</p>}
      <Link className="btn-secondary inline-flex" href={`/${locale}/years`}>{en ? 'Browse learning modules' : 'Consulter les modules de cours'}</Link>
    </div>
  );
}
