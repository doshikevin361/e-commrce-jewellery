import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondTypeFormPage } from '@/components/diamond-types/diamond-type-form-page';

export const metadata = {
  title: 'Add Diamond Type | Admin',
  description: 'Add a new diamond type',
};

export default function AddDiamondTypePage() {
  return (
    <AdminLayout>
      <DiamondTypeFormPage />
    </AdminLayout>
  );
}

