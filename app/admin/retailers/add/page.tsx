import { AdminLayout } from '@/components/layout/admin-layout';
import { RetailerFormPage } from '@/components/retailers/retailer-form-page';

export const metadata = {
  title: 'Add Retailer | Admin',
  description: 'Add a new B2B retailer',
};

export default function AddRetailerPage() {
  return (
    <AdminLayout>
      <RetailerFormPage />
    </AdminLayout>
  );
}
