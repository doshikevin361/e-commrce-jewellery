import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondColorFormPage } from '@/components/diamond-colors/diamond-color-form-page';

export const metadata = {
  title: 'Add Diamond Color | Admin',
  description: 'Add a new diamond color',
};

export default function AddDiamondColorPage() {
  return (
    <AdminLayout>
      <DiamondColorFormPage />
    </AdminLayout>
  );
}

