import { requireAdmin } from '@/lib/auth/server';
import AdminShell from '@/components/layout/AdminShell';

export default async function AdminLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <AdminShell>{children}</AdminShell>;
}
