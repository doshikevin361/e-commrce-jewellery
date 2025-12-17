import { AdminLayout } from '@/components/layout/admin-layout';
import { DesignTypeList } from '@/components/design-types/design-type-list';

export const metadata = {
  title: 'Design Types | Admin',
  description: 'Manage design types',
};

export default function DesignTypesPage() {
  return (
    <AdminLayout>
      <DesignTypeList />
    </AdminLayout>
  );
}

