import { AdminLayout } from '@/components/layout/admin-layout';
import { KaratList } from '@/components/karats/karat-list';

export const metadata = {
  title: 'Karats | Admin',
  description: 'Manage karats',
};

export default function KaratsPage() {
  return (
    <AdminLayout>
      <KaratList />
    </AdminLayout>
  );
}

