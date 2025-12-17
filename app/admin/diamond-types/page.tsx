import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondTypeList } from '@/components/diamond-types/diamond-type-list';

export const metadata = {
  title: 'Diamond Types | Admin',
  description: 'Manage diamond types',
};

export default function DiamondTypesPage() {
  return (
    <AdminLayout>
      <DiamondTypeList />
    </AdminLayout>
  );
}

