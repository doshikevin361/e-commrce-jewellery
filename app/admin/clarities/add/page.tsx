import { AdminLayout } from '@/components/layout/admin-layout';
import { ClarityFormPage } from '@/components/clarities/clarity-form-page';

export const metadata = {
  title: 'Add Clarity | Admin',
  description: 'Add a new clarity',
};

export default function AddClarityPage() {
  return (
    <AdminLayout>
      <ClarityFormPage />
    </AdminLayout>
  );
}

