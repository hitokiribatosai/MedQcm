import Link from 'next/link';
import { CURRICULUM_DATA } from '@/lib/data/curriculum-metadata';
import { BookOpen, Star, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default async function YearsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const en = locale === 'en';
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-100 dark:border-dark-border pb-6">
        <div>
          <span className="badge-free mb-2 uppercase text-[11px] font-bold tracking-wider">
            {en ? 'Study paths in preparation' : 'Parcours de révision en préparation'}
          </span>
          <h1 className="text-3xl font-extrabold text-[#1a2e25] dark:text-green-50">
            {en ? 'Years of study & residency' : 'Années d’Études & Résidanat'}
          </h1>
          <p className="text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            {en ? 'Choose your year to explore the draft subjects and modules.' : 'Sélectionnez votre année d’étude pour explorer les matières et modules provisoires.'}
          </p>
        </div>

        <Link href={`/${locale}/subscribe`} className="btn-primary self-start sm:self-auto gap-2">
          <Sparkles className="w-4 h-4 text-accent-300" />
          {en ? 'Planned offers' : 'Offres prévues'}
        </Link>
      </div>

      {/* Freemium reminder banner */}
      <div className="card p-4 bg-gradient-to-r from-primary-50 to-emerald-50/50 dark:bg-dark-card border border-primary-200 dark:border-dark-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-[#2d523f] dark:text-green-200">
            <strong>{en ? 'Sample questions:' : 'Questions exemples :'}</strong> {en ? 'A few modules have demonstration QCMs. The Oran curriculum and content still need validation.' : 'Quelques modules proposent des QCMs de démonstration. Le programme et les contenus d’Oran restent à valider.'}
          </p>
        </div>
        <Link href={`/${locale}/subscribe`} className="text-xs font-bold text-primary-700 hover:underline shrink-0 dark:text-primary-400">
          {en ? 'View planned offers' : 'Voir les offres prévues'} →
        </Link>
      </div>

      {/* Grid of 8 years */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CURRICULUM_DATA.map((year) => {
          const totalModules = year.categories.reduce((acc, cat) => acc + cat.modules.length, 0);
          const isSpecial = year.number === 8;

          return (
            <Link
              key={year.number}
              href={`/${locale}/years/${year.number}`}
              className={`card-hover p-6 flex flex-col justify-between group relative border ${
                isSpecial
                  ? 'border-accent-400/80 dark:border-accent-700/60 shadow-glow'
                  : 'border-primary-100 dark:border-dark-border'
              }`}
            >
              {isSpecial && (
                <div className="absolute -top-3 right-5 bg-gradient-to-r from-accent-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                  {en ? 'Residency exam' : 'Concours classant'}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-card ${
                    isSpecial
                      ? 'bg-gradient-to-br from-accent-500 to-amber-600 text-white'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                  }`}>
                    {isSpecial ? <Star className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>

                  <span className="badge-free text-[11px]">
                    {en ? 'Path in preparation' : 'Parcours en préparation'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#1a2e25] dark:text-green-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {year.label}
                </h2>
                <p className="text-xs text-[#4b7a62] dark:text-green-400 mt-1 line-clamp-2">
                  {year.description}
                </p>

                {/* Categories preview chips */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {year.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat.id}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary-50 text-primary-800 dark:bg-dark-muted dark:text-green-300"
                    >
                      {cat.nameFr}
                    </span>
                  ))}
                  {year.categories.length > 3 && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md text-gray-400">
                      +{year.categories.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-primary-100 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4b7a62] dark:text-green-400">
                  {totalModules} {en ? 'draft modules' : 'modules proposés'}
                </span>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {en ? 'Explore' : 'Accéder'} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
