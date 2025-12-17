import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondShapeList } from '@/components/diamond-shapes/diamond-shape-list';

export const metadata = {
  title: 'Diamond Shapes | Admin',
  description: 'Manage diamond shapes',
};

export default function DiamondShapesPage() {
  return (
    <AdminLayout>
      <DiamondShapeList />
    </AdminLayout>
  );
}


