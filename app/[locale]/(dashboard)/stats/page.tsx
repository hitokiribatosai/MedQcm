'use client';

import { useEffect, useState } from 'react';
import { Flame, Target, Clock, Zap, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface WeakModule {
  moduleId: string;
  count: number;
}

export default function StatisticsPage() {
  const [weakModules, setWeakModules] = useState<WeakModule[]>([]);

  useEffect(() => {
    // Collect mistakes from localStorage to show "Domaines à renforcer"
    const mistakes: WeakModule[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('medqcm_mistakes_')) {
        try {
          const arr = JSON.parse(localStorage.getItem(key) || '[]');
          if (arr.length > 0) {
            const moduleId = key.replace('medqcm_mistakes_', '');
            mistakes.push({ moduleId, count: arr.length });
          }
        } catch (e) {}
      }
    }
    // Sort by most mistakes
    mistakes.sort((a, b) => b.count - a.count);
    setWeakModules(mistakes);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in pb-12">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <TrendingUp className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Statistiques d'Apprentissage
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Suivez votre progression et ciblez vos faiblesses.
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex flex-col items-center text-center space-y-2 border-b-4 border-b-orange-500">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">5</h3>
          <p className="text-sm font-bold text-gray-400">Jours de série</p>
        </div>

        <div className="card p-5 flex flex-col items-center text-center space-y-2 border-b-4 border-b-sky-500">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-500 flex items-center justify-center">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">420</h3>
          <p className="text-sm font-bold text-gray-400">QCM Traités</p>
        </div>

        <div className="card p-5 flex flex-col items-center text-center space-y-2 border-b-4 border-b-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">85%</h3>
          <p className="text-sm font-bold text-gray-400">Précision Globale</p>
        </div>

        <div className="card p-5 flex flex-col items-center text-center space-y-2 border-b-4 border-b-purple-500">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">12h</h3>
          <p className="text-sm font-bold text-gray-400">Temps d'étude</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DOMAINES A RENFORCER */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Domaines à renforcer</h2>
          </div>

          <div className="space-y-3">
            {weakModules.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-dark-bg rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-border">
                <p className="text-gray-500 dark:text-gray-400 font-bold">
                  Aucune erreur enregistrée pour le moment !
                </p>
                <p className="text-sm text-gray-400 mt-1">Continuez s'entraîner.</p>
              </div>
            ) : (
              weakModules.map((wm, idx) => (
                <div key={wm.moduleId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl border-2 border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg text-gray-400">#{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{wm.moduleId}</h4>
                      <p className="text-xs font-bold text-amber-500">{wm.count} erreurs à réviser</p>
                    </div>
                  </div>
                  <Link href={`/fr/quiz/${wm.moduleId}`} className="btn-duo-green px-4 py-2 text-sm">
                    Réviser
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTIVITE RECENTE */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Activité Récente</h2>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-dark-border before:to-transparent">
            {/* Mock Timeline item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-dark-card bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Target className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border-2 border-gray-100 dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-gray-900 dark:text-white text-sm">Session d'entraînement</h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">18/20</span>
                </div>
                <p className="text-xs font-bold text-gray-500">Anatomie Générale</p>
                <p className="text-[10px] text-gray-400 mt-2">Aujourd'hui, 10:30</p>
              </div>
            </div>

            {/* Mock Timeline item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-dark-card bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Clock className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border-2 border-gray-100 dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-gray-900 dark:text-white text-sm">Examen Blanc</h4>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">En cours</span>
                </div>
                <p className="text-xs font-bold text-gray-500">Physiologie Rénale</p>
                <p className="text-[10px] text-gray-400 mt-2">Hier, 15:45</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
