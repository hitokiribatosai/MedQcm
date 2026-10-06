import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/server';

type Metrics = {
  registered_accounts: number;
  sample_questions: number;
  reviewed_questions: number;
  private_drafts: number;
  pending_receipts: number;
  active_subscriptions: number;
};

export default async function AdminOverviewPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const en = locale === 'en';
  await requireAdmin(locale);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_overview_metrics');
  const metrics = data as Metrics | null;
  const cards = metrics ? [
    { label: en ? 'Pending receipts' : 'Reçus en attente', value: metrics.pending_receipts },
    { label: en ? 'Registered accounts' : 'Comptes inscrits', value: metrics.registered_accounts },
    { label: en ? 'Sample questions' : 'Questions exemples', value: metrics.sample_questions },
    { label: en ? 'Active subscriptions' : 'Abonnements actifs', value: metrics.active_subscriptions },
    { label: en ? 'Private question drafts' : 'Brouillons QCM privés', value: metrics.private_drafts },
    { label: en ? 'Reviewed questions' : 'Questions relues', value: metrics.reviewed_questions },
  ] : [];

  return <div className="space-y-8 pb-16">
    <header className="space-y-2">
      <h1 className="text-3xl font-black">{en ? 'MedQCM administration' : 'Administration MedQCM'}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {en ? 'Live account, question, and subscription figures.' : 'Comptes, questions et abonnements enregistrés dans la base de données.'}
      </p>
    </header>
    {error || !metrics ? <p role="alert" className="card p-5 border border-amber-300">
      {en ? 'Live metrics are unavailable. Apply the pending admin migration before using this dashboard.' : 'Les chiffres réels sont indisponibles. Appliquez la migration administrateur en attente avant d’utiliser ce tableau de bord.'}
    </p> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(card => <div key={card.label} className="card p-5 border border-primary-100 dark:border-dark-border">
        <p className="text-xs font-bold uppercase text-gray-500">{card.label}</p>
        <strong className="text-3xl font-black text-[#1a2e25] dark:text-green-50">{card.value}</strong>
      </div>)}
    </div>}
    <div className="grid sm:grid-cols-2 gap-4">
      <Link href={`/${locale}/admin/subscriptions`} className="card p-6 border border-primary-200 hover:border-primary-500">
        <h2 className="font-bold">{en ? 'Review subscription requests' : 'Examiner les demandes d’abonnement'}</h2>
        <p className="text-sm text-gray-500 mt-2">{en ? 'Receipts remain private. Payment collection is closed until commercial terms and live acceptance are confirmed.' : 'Les reçus restent privés. Les paiements sont fermés jusqu’à validation des conditions commerciales et des tests en production.'}</p>
      </Link>
      <Link href={`/${locale}/admin/questions`} className="card p-6 border border-primary-200 hover:border-primary-500">
        <h2 className="font-bold">{en ? 'Prepare QCM drafts' : 'Préparer les brouillons QCM'}</h2>
        <p className="text-sm text-gray-500 mt-2">{en ? 'Drafts are private and do not appear in student quizzes before review and publication.' : 'Les brouillons restent privés et ne figurent pas dans les quiz étudiants avant relecture et publication.'}</p>
      </Link>
    </div>
  </div>;
}
