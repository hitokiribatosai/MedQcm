'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard, HelpCircle, Users,
  Clock, ArrowRight, UploadCloud
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [pendingPayments, setPendingPayments] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/subscriptions', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Subscriptions unavailable');
        return response.json() as Promise<{ requests?: unknown[] }>;
      })
      .then(data => {
        if (active) setPendingPayments(data.requests?.length ?? 0);
      })
      .catch(() => {
        if (active) setPendingPayments(null);
      });
    return () => { active = false; };
  }, []);

  const pendingLabel = pendingPayments === null ? '…' : String(pendingPayments);
  const pendingDescription = pendingPayments === null
    ? 'Chargement des demandes en attente…'
    : pendingPayments === 0
      ? 'Aucun reçu en attente de validation'
      : `${pendingPayments} reçu${pendingPayments > 1 ? 's' : ''} en attente de validation manuelle`;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="badge-free text-[11px] mb-1 font-bold uppercase">
          Administration MedQCM
        </span>
        <h1 className="text-3xl font-black text-[#1a2e25] dark:text-green-50">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
          Supervision des inscriptions, validation des paiements et gestion des épreuves.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-primary-200 dark:border-dark-border bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/20 dark:to-transparent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
              Paiements en attente
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-amber-950 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1a2e25] dark:text-green-50">{pendingLabel}</div>
          <Link href="/fr/admin/subscriptions" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline mt-2 inline-flex items-center gap-1">
            Traiter les reçus →
          </Link>
        </div>

        <div className="card p-5 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-500">
              Étudiants Actifs
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 dark:bg-dark-muted flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1a2e25] dark:text-green-50">—</div>
          <span className="text-[11px] text-gray-500 font-semibold">Donnée non connectée</span>
        </div>

        <div className="card p-5 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-500">
              Banque de QCMs
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 dark:bg-dark-muted flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1a2e25] dark:text-green-50">—</div>
          <span className="text-[11px] text-[#4b7a62] dark:text-green-400">Donnée non connectée</span>
        </div>

        <div className="card p-5 border border-primary-100 dark:border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-500">
              Abonnements Actifs
            </span>
            <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-700 dark:bg-accent-950 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1a2e25] dark:text-green-50">—</div>
          <span className="text-[11px] text-gray-500 font-semibold">Donnée non connectée</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/fr/admin/subscriptions"
          className="card p-6 border-2 border-amber-300 dark:border-amber-700/60 hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1a2e25] dark:text-green-50 group-hover:text-amber-700 transition-colors">
            Activer les abonnements
          </h3>
          <p className="text-xs text-[#4b7a62] dark:text-green-400 mt-1">
            {pendingDescription}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-4">
            Gérer les demandes <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/fr/admin/import"
          className="card p-6 border border-primary-200 dark:border-dark-border hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center mb-4">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1a2e25] dark:text-green-50 group-hover:text-primary-600 transition-colors">
            Import de cours PDF via IA
          </h3>
          <p className="text-xs text-[#4b7a62] dark:text-green-400 mt-1">
            Téléversez un cours ou un polycopié pour générer automatiquement des QCMs
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 mt-4">
            Importer un PDF <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/fr/admin/questions"
          className="card p-6 border border-primary-200 dark:border-dark-border hover:shadow-lg transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center mb-4">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1a2e25] dark:text-green-50 group-hover:text-primary-600 transition-colors">
            Banque de questions & CRUD
          </h3>
          <p className="text-xs text-[#4b7a62] dark:text-green-400 mt-1">
            Ajoutez manuellement des QCMs, cas cliniques et corrections médicales
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 mt-4">
            Gérer les questions <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
