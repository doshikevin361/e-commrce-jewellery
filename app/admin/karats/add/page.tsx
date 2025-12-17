import { AdminLayout } from '@/components/layout/admin-layout';
import { KaratFormPage } from '@/components/karats/karat-form-page';

export const metadata = {
  title: 'Add Karat | Admin',
  description: 'Add a new karat',
};

export default function AddKaratPage() {
  return (
    <AdminLayout>
      <KaratFormPage />
    </AdminLayout>
  );
}

