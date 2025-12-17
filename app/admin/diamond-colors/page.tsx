import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondColorList } from '@/components/diamond-colors/diamond-color-list';

export const metadata = {
  title: 'Diamond Colors | Admin',
  description: 'Manage diamond colors',
};

export default function DiamondColorsPage() {
  return (
    <AdminLayout>
      <DiamondColorList />
    </AdminLayout>
  );
}

