import { AdminLayout } from '@/components/layout/admin-layout';
import { VendorSubscriptionPanel } from '@/components/subscription/vendor-subscription-panel';

export const metadata = {
  title: 'Vendor Subscription',
  description: 'Manage your vendor subscription plan',
};

export default function VendorSubscriptionPage() {
  return (
    <AdminLayout>
      <VendorSubscriptionPanel />
    </AdminLayout>
  );
}
