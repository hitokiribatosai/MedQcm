import Link from 'next/link';

export default async function AdminImportPage({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  const en = locale === 'en';
  return <section className="card max-w-3xl p-8 space-y-4">
    <h1 className="text-2xl font-bold">{en ? 'PDF import in preparation' : 'Import PDF en préparation'}</h1>
    <p>{en ? 'Automatic PDF extraction and QCM generation are not active. Uploaded files would not be saved, so this screen is unavailable until secure storage, source permissions, and medical review are implemented.' : 'L’extraction automatique de PDF et la génération de QCMs ne sont pas actives. Les fichiers ne seraient pas enregistrés ; cet écran restera indisponible jusqu’à la mise en place du stockage sécurisé, des autorisations de contenu et de la relecture médicale.'}</p>
    <Link className="btn-primary inline-flex" href={`/${locale}/admin/questions`}>{en ? 'Prepare a question draft' : 'Préparer un brouillon QCM'}</Link>
  </section>;
}
