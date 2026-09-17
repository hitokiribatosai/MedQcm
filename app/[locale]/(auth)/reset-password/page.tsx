import PasswordForm from '@/components/auth/PasswordForm';
import { requireUser } from '@/lib/auth/server';
import Link from 'next/link';

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  return <main className="max-w-md mx-auto p-8 my-12 card">
    <PasswordForm />
    <Link className="block mt-6" href={`/${locale}/dashboard`}>Retour au tableau de bord</Link>
  </main>;
}
