import { AdminLayout } from '@/components/layout/admin-layout';
import { VendorCommissionSettings } from '@/components/vendor/vendor-commission-settings';

export const metadata = {
  title: 'Commission Settings | Vendor',
  description: 'Manage your product type commission rates',
};

export default function VendorCommissionPage() {
  return (
    <AdminLayout>
      <VendorCommissionSettings />
    </AdminLayout>
  );
}
