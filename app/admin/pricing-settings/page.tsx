import { AdminLayout } from '@/components/layout/admin-layout';
import { PricingSettingsPanel } from '@/components/settings/pricing-settings-panel';

export const metadata = {
  title: 'Pricing & Commission Settings',
  description: 'Manage metal prices and commission rates',
};

export default function PricingSettingsPage() {
  return (
    <AdminLayout>
      <PricingSettingsPanel />
    </AdminLayout>
  );
}
