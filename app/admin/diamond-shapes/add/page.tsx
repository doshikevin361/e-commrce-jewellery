import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondShapeFormPage } from '@/components/diamond-shapes/diamond-shape-form-page';

export const metadata = {
  title: 'Add Diamond Shape | Admin',
  description: 'Add a new diamond shape',
};

export default function AddDiamondShapePage() {
  return (
    <AdminLayout>
      <DiamondShapeFormPage />
    </AdminLayout>
  );
}


