import SubscriptionPanel from "@/components/subscriptions/SubscriptionPanel";
import { requirePaymentManager } from "@/lib/auth/server";
export default async function AdminSubscriptionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requirePaymentManager(locale);
  return <SubscriptionPanel admin />;
}
