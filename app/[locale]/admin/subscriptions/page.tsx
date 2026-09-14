'use client';

import { useState } from 'react';
import {
  CreditCard, CheckCircle2, XCircle, Clock, Eye,
  Search, Filter, ShieldCheck, Mail, Copy, Check,
  ExternalLink, X, AlertCircle
} from 'lucide-react';

interface SubRequest {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  plan: 'Annuel' | 'Semestriel';
  amount: string;
  method: 'BaridiMob' | 'CCP' | 'Virement';
  transactionRef: string;
  date: string;
  proofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const INITIAL_REQUESTS: SubRequest[] = [
  {
    id: 'req-1',
    studentName: 'Dr. Yasmine Benali',
    email: 'yasmine.benali@univ-med.dz',
    phone: '0550 12 34 56',
    plan: 'Annuel',
    amount: '4 500 DA',
    method: 'BaridiMob',
    transactionRef: 'TRX-893214',
    date: 'Aujourd\'hui à 09:42',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    status: 'pending',
    notes: 'Reçu envoyé par BaridiMob vers medqcmpay@gmail.com',
  },
  {
    id: 'req-2',
    studentName: 'Karim Mansouri',
    email: 'k.mansouri@gmail.com',
    phone: '0770 98 76 54',
    plan: 'Annuel',
    amount: '4 500 DA',
    method: 'BaridiMob',
    transactionRef: 'TRX-045129',
    date: 'Hier à 16:15',
    proofUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800',
    status: 'pending',
    notes: 'Avis officiel reçu par mail',
  },
  {
    id: 'req-3',
    studentName: 'Amine Larbi',
    email: 'amine.larbi98@gmail.com',
    phone: '0661 22 33 44',
    plan: 'Semestriel',
    amount: '2 800 DA',
    method: 'BaridiMob',
    transactionRef: 'TRX-551920',
    date: '10 Sept. 2026',
    status: 'approved',
    notes: 'Vérifié dans medqcmpay@gmail.com - Activé',
  },
  {
    id: 'req-4',
    studentName: 'Nadia Cherif',
    email: 'nadia.med@outlook.fr',
    phone: '0541 77 88 99',
    plan: 'Annuel',
    amount: '4 500 DA',
    method: 'CCP',
    transactionRef: 'CCP-09812',
    date: '08 Sept. 2026',
    status: 'rejected',
    notes: 'Montant insuffisant ou référence introuvable',
  }
];

export default function AdminSubscriptionsPage() {
  const [requests, setRequests] = useState<SubRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [selectedProof, setSelectedProof] = useState<SubRequest | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText('medqcmpay@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  }

  const filtered = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.transactionRef.toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-free text-[11px] mb-1 font-black uppercase">
            Espace Modération
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
            Validation des Paiements BaridiMob & Reçus
          </h1>
          <p className="text-xs sm:text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Vérifiez les avis de virement reçus sur <strong className="text-emerald-700 dark:text-emerald-300">medqcmpay@gmail.com</strong> et activez manuellement les abonnements.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 text-amber-950 font-black text-xs shadow-sm self-start sm:self-auto">
            <Clock className="w-4 h-4" />
            <span>{pendingCount} validation(s) en attente</span>
          </div>
        )}
      </div>

      {/* Gmail Cross-Verification Toolbar */}
      <div className="card p-5 border-2 border-b-4 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Boîte e-mail officielle de réception :</span>
              <code className="font-mono font-black text-sm text-emerald-900 dark:text-emerald-200 bg-white dark:bg-dark-card px-2 py-0.5 rounded-lg border">
                medqcmpay@gmail.com
              </code>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-0.5">
              Tous les reçus officiels transmis par Algérie Poste / BaridiMob atterrissent dans cette boîte de messagerie.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={copyEmail}
            className="px-3 py-2 rounded-xl bg-white dark:bg-dark-card border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5 hover:bg-emerald-100 transition-all shadow-xs"
          >
            {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedEmail ? 'Copié !' : 'Copier l\'adresse'}</span>
          </button>

          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-duo-green text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ouvrir Gmail</span>
          </a>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-dark-muted rounded-2xl self-start">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'pending'
                ? 'bg-white dark:bg-dark-card text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            En attente ({requests.filter((r) => r.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'approved'
                ? 'bg-white dark:bg-dark-card text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Validées ({requests.filter((r) => r.status === 'approved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'rejected'
                ? 'bg-white dark:bg-dark-card text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Rejetées ({requests.filter((r) => r.status === 'rejected').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Toutes ({requests.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, N° transaction, email..."
            className="input pl-9 text-xs py-2 w-full rounded-xl"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="card border-2 border-b-4 border-gray-200 dark:border-dark-border overflow-hidden rounded-2xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-dark-muted/50 border-b border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px] font-black">
              <tr>
                <th className="p-4">Étudiant</th>
                <th className="p-4">Réf. Transaction BaridiMob</th>
                <th className="p-4">Offre & Montant</th>
                <th className="p-4">Moyen</th>
                <th className="p-4">Date</th>
                <th className="p-4">Vérification</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-emerald-50/20 dark:hover:bg-dark-muted/20 transition-colors">
                  {/* Student */}
                  <td className="p-4">
                    <div className="font-black text-[#1a2e25] dark:text-green-50">{req.studentName}</div>
                    <div className="text-gray-400 text-xs">{req.email}</div>
                    <div className="text-emerald-700 dark:text-emerald-400 text-xs font-mono mt-0.5">{req.phone}</div>
                  </td>

                  {/* Transaction Ref */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 select-all">
                        {req.transactionRef}
                      </span>
                      <a
                        href={`https://mail.google.com/mail/u/0/#search/${req.transactionRef}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                        title="Rechercher cette transaction dans medqcmpay@gmail.com"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="p-4">
                    <span className="font-black text-[#1a2e25] dark:text-green-100">{req.plan}</span>
                    <span className="block text-xs text-gray-400 font-bold">{req.amount}</span>
                  </td>

                  {/* Method */}
                  <td className="p-4">
                    <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-muted text-gray-700 dark:text-gray-300">
                      {req.method}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                    {req.date}
                  </td>

                  {/* Proof */}
                  <td className="p-4">
                    {req.proofUrl ? (
                      <button
                        type="button"
                        onClick={() => setSelectedProof(req)}
                        className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Voir capture
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-600" /> Reçu par mail
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Activé
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Rejeté
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right whitespace-nowrap">
                    {req.status === 'pending' ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          className="btn-duo-green text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-all"
                        >
                          Rejeter
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApprove(req.id)}
                        className="text-xs text-gray-400 hover:text-emerald-600 underline font-semibold"
                      >
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black text-emerald-600 uppercase">Preuve de paiement</span>
                <h3 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
                  {selectedProof.studentName} ({selectedProof.amount})
                </h3>
                <p className="text-xs text-gray-400">Réf: {selectedProof.transactionRef} • {selectedProof.date}</p>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProof.proofUrl && (
              <div className="border rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center max-h-80">
                <img
                  src={selectedProof.proofUrl}
                  alt="Reçu de paiement"
                  className="w-full object-cover max-h-80 rounded-2xl"
                />
              </div>
            )}

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <strong>Vérification rapide :</strong>
              <p>Recherchez la référence <code>{selectedProof.transactionRef}</code> sur votre boîte <strong>medqcmpay@gmail.com</strong> pour confirmer le montant de {selectedProof.amount}.</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  handleReject(selectedProof.id);
                  setSelectedProof(null);
                }}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50"
              >
                Rejeter la demande
              </button>

              <button
                type="button"
                onClick={() => {
                  handleApprove(selectedProof.id);
                  setSelectedProof(null);
                }}
                className="btn-duo-green text-xs py-2 px-4 shadow"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Valider & Activer l'accès (1 an)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
