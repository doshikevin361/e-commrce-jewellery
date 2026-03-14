import { AdminLayout } from '@/components/layout/admin-layout';
import { SubscriptionSettingsPanel } from '@/components/settings/subscription-settings-panel';

export const metadata = {
  title: 'Subscription Settings',
  description: 'Manage vendor and retailer subscription plans and pricing',
};

export default function SubscriptionSettingsPage() {
  return (
    <AdminLayout>
      <SubscriptionSettingsPanel />
    </AdminLayout>
  );
}
