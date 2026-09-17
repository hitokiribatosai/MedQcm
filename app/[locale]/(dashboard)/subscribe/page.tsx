'use client';

import { useState } from 'react';
import {
  Check, ShieldCheck, UploadCloud, AlertCircle, Clock,
  CreditCard, Phone, FileCheck, ArrowRight, Sparkles, Copy, Mail, CheckCircle2
} from 'lucide-react';
import { SUBSCRIPTION_PRICING } from '@/lib/config/pricing';

interface PaymentDetail {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
}

interface PaymentMethod {
  title: string;
  badge: string;
  details: PaymentDetail[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    title: 'BaridiMob (Recommandé)',
    badge: 'Reçu direct par e-mail',
    details: [
      { label: 'Numéro RIP', value: '00799999000123456789', copyable: true },
      { label: 'Nom du titulaire', value: 'Dr. MedQCM / Rahal' },
      { label: 'E-mail officiel pour le reçu BaridiMob', value: 'medqcmpay@gmail.com', copyable: true, highlight: true },
    ],
  },
  {
    title: 'CCP (Poste Algérie)',
    badge: 'Bordereau guichet',
    details: [
      { label: 'Numéro CCP', value: '12345678 Clé 99', copyable: true },
      { label: 'Titulaire', value: 'Service MedQCM' },
    ],
  },
  {
    title: 'Virement bancaire',
    badge: 'Banques nationales',
    details: [
      { label: 'RIB / IBAN', value: '002 00012 1234567890 55', copyable: true },
      { label: 'Banque', value: 'Banque Nationale / BEA' },
    ],
  },
];

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'semester'>('annual');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'pending' | 'active'>('idle');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!transactionRef && !filePreview) {
      setFormError('Veuillez renseigner le N° de transaction BaridiMob ou joindre une capture de reçu.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionStatus('pending');
    }, 800);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="badge-free px-3 py-1 font-extrabold text-xs tracking-wider uppercase">
          Abonnement MedQCM
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1a2e25] dark:text-green-50 tracking-tight">
          Débloquez l'Intégralité du Programme
        </h1>
        <p className="text-base text-[#4b7a62] dark:text-green-400 max-w-2xl mx-auto">
          Le 1er module de chaque année est 100% gratuit. Accédez à tous les modules des 7 années + Résidanat pour réussir vos épreuves.
        </p>
      </div>

      {/* Current Status Notice (if pending) */}
      {submissionStatus === 'pending' && (
        <div className="card p-6 border-2 border-amber-300 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-700/50 flex items-start gap-4 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              Demande reçue — En attente de validation
            </h3>
            <p className="text-sm text-amber-800/90 dark:text-amber-300/80 mt-1">
              Votre demande pour le compte <strong>{username || 'utilisateur'}</strong> (Réf: {transactionRef || 'En attente'}) est transmise à l'administrateur. Notre équipe vérifiera la réception de l'avis BaridiMob sur <code className="font-bold">medqcmpay@gmail.com</code> et activera votre compte rapidement.
            </p>
          </div>
        </div>
      )}

      {/* Pricing comparison cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free plan */}
        <div className="card p-6 border-2 border-b-4 border-gray-200 dark:border-dark-border flex flex-col justify-between rounded-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Accès Découverte</span>
              <span className="badge-free">Inclus</span>
            </div>
            <div className="text-3xl font-black text-[#1a2e25] dark:text-green-50 mb-2">0 DA</div>
            <p className="text-xs text-[#4b7a62] dark:text-green-400 mb-6">Testez l'interface et la qualité de la banque de questions</p>

            <ul className="space-y-3 text-sm text-[#2d523f] dark:text-green-200">
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Premier module gratuit de la 1ère à la 7ème année</span>
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mode exploration avec corrections immédiates</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 line-through">
                <span>Accès aux modules cliniques avancés</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 line-through">
                <span>Simulations d'examens blancs classés</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-dark-border">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Actif automatiquement</span>
          </div>
        </div>

        {/* Premium plan */}
        <div className="card p-6 border-2 border-b-4 border-emerald-500 dark:border-emerald-600 relative flex flex-col justify-between shadow-glow rounded-2xl">
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow">
            Accès Total Illimité
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Pass MedQCM Pro</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Recommandé
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-[#1a2e25] dark:text-green-50">
                {SUBSCRIPTION_PRICING[selectedPlan].formattedPrice}
              </span>
              <span className="text-sm text-gray-500">
                {SUBSCRIPTION_PRICING[selectedPlan].billingPeriod}
              </span>
            </div>

            <div className="flex gap-2 my-4">
              <button
                type="button"
                onClick={() => setSelectedPlan('annual')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  selectedPlan === 'annual'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-50 text-emerald-800 dark:bg-dark-muted dark:text-green-300'
                }`}
              >
                Annuel (Économisez 30%)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('semester')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  selectedPlan === 'semester'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-50 text-emerald-800 dark:bg-dark-muted dark:text-green-300'
                }`}
              >
                Semestriel
              </button>
            </div>

            <ul className="space-y-3 text-sm text-[#2d523f] dark:text-green-200">
              <li className="flex items-center gap-2.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Tous les modules des 7 années + Concours Résidanat</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>+15 000 QCMs réactualisés avec explications théoriques</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Examens blancs chronométrés & classement live</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Synchronisation multi-supports (Web, iOS, Android)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
            <a href="#payment-section" className="btn-duo-green w-full py-3 text-sm shadow">
              Obtenir l'accès complet <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Payment Instructions & Manual Verification */}
      <div id="payment-section" className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-black text-[#1a2e25] dark:text-green-50 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Coordonnées de paiement & Activation
          </h2>
          <p className="text-sm text-[#4b7a62] dark:text-green-400 mt-1">
            Effectuez votre transfert, envoyez le reçu BaridiMob à notre e-mail dédié, puis saisissez votre référence ci-dessous.
          </p>
        </div>

        {/* Payment accounts grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {PAYMENT_METHODS.map((pm) => (
            <div
              key={pm.title}
              className={`card p-5 border-2 border-b-4 rounded-2xl ${
                pm.title.includes('BaridiMob')
                  ? 'border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/20'
                  : 'border-gray-200 dark:border-dark-border'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-[#1a2e25] dark:text-green-50">{pm.title}</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {pm.badge}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {pm.details.map((d) => (
                  <div
                    key={d.label}
                    className={d.highlight ? 'p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700' : ''}
                  >
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px] font-semibold mb-0.5">
                      {d.label}
                    </span>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono font-black select-all ${
                        d.highlight ? 'text-emerald-900 dark:text-emerald-200 text-sm font-sans' : 'text-[#1a2e25] dark:text-green-100 text-sm'
                      }`}>
                        {d.value}
                      </span>

                      {d.copyable && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(d.value, d.label)}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 transition-all shrink-0 shadow-xs"
                          title="Copier dans le presse-papier"
                        >
                          {copiedKey === d.label ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BaridiMob Direct Email Callout Banner */}
        <div className="card p-5 border-2 border-b-4 border-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                Astuce BaridiMob : Reçu officiel certifié par e-mail
              </h4>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-relaxed max-w-xl">
                Dans votre application <strong>BaridiMob</strong>, cochez l'option <strong>« Envoyer le reçu par e-mail »</strong> et collez l'adresse officielle ci-contre. Votre avis d'opération officiel nous parviendra directement !
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard('medqcmpay@gmail.com', 'tip-email')}
            className="btn-duo-green text-xs py-2.5 px-4 shrink-0 flex items-center gap-2 shadow-xs"
          >
            {copiedKey === 'tip-email' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier medqcmpay@gmail.com</span>
              </>
            )}
          </button>
        </div>

        {/* Proof Submission Form */}
        <div className="card p-6 sm:p-8 border-2 border-b-4 border-gray-200 dark:border-dark-border rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1a2e25] dark:text-green-50">Formulaire d'activation rapide</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Renseignez votre compte pour activer votre accès annuel
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#1a2e25] dark:text-green-100 mb-1.5">
                  Nom d'utilisateur / Email du compte MedQCM *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: dr.amine@gmail.com"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#1a2e25] dark:text-green-100 mb-1.5">
                  Numéro de Transaction BaridiMob ou N° Bordereau CCP *
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Ex: TRX-984210 ou N° bordereau 04512"
                  className="input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1a2e25] dark:text-green-100 mb-1.5">
                Numéro de téléphone (pour confirmation SMS / WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07..."
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Optional proof image upload */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1a2e25] dark:text-green-100 mb-1.5">
                Capture de reçu (Facultatif si vous avez envoyé le reçu à medqcmpay@gmail.com)
              </label>

              <div className="border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-emerald-500 rounded-2xl p-5 text-center transition-all bg-gray-50/50 dark:bg-dark-muted/20">
                {filePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={filePreview}
                      alt="Aperçu reçu"
                      className="max-h-40 rounded-xl object-contain border shadow-xs"
                    />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{fileName}</p>
                    <label className="text-xs text-emerald-600 hover:underline cursor-pointer font-bold">
                      Changer d'image
                      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Joindre une photo du bordereau CCP ou capture BaridiMob
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {formError && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-duo-green w-full py-4 text-base font-black shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Transmission en cours...' : 'Envoyer ma demande d\'activation'}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 text-center pt-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Vérification avec le reçu reçu sur medqcmpay@gmail.com sous 2 à 24h</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
