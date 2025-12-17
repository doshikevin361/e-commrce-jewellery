import { AdminLayout } from '@/components/layout/admin-layout';
import { ClarityList } from '@/components/clarities/clarity-list';

export const metadata = {
  title: 'Clarities | Admin',
  description: 'Manage diamond clarities',
};

export default function ClaritiesPage() {
  return (
    <AdminLayout>
      <ClarityList />
    </AdminLayout>
  );
}

