import { AdminLayout } from '@/components/layout/admin-layout';
import { PurityList } from '@/components/purities/purity-list';

export const metadata = {
  title: 'Purities | Admin',
  description: 'Manage purities',
};

export default function PuritiesPage() {
  return (
    <AdminLayout>
      <PurityList />
    </AdminLayout>
  );
}

