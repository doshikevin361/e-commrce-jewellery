import { AdminLayout } from '@/components/layout/admin-layout';
import { PurityFormPage } from '@/components/purities/purity-form-page';

export const metadata = {
  title: 'Add Purity | Admin',
  description: 'Add a new purity',
};

export default function AddPurityPage() {
  return (
    <AdminLayout>
      <PurityFormPage />
    </AdminLayout>
  );
}

