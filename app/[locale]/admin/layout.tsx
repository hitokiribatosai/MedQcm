import { requireStaff } from "@/lib/auth/server";
import AdminShell from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireStaff(locale);
  return (
    <AdminShell role={String(user.app_metadata.role)}>{children}</AdminShell>
  );
}
