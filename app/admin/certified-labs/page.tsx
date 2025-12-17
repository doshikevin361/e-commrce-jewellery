import { AdminLayout } from '@/components/layout/admin-layout';
import { CertifiedLabList } from '@/components/certified-labs/certified-lab-list';

export const metadata = {
  title: 'Certified Labs | Admin',
  description: 'Manage certified labs',
};

export default function CertifiedLabsPage() {
  return (
    <AdminLayout>
      <CertifiedLabList />
    </AdminLayout>
  );
}


