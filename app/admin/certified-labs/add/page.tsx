import { AdminLayout } from '@/components/layout/admin-layout';
import { CertifiedLabFormPage } from '@/components/certified-labs/certified-lab-form-page';

export const metadata = {
  title: 'Add Certified Lab | Admin',
  description: 'Add a new certified lab',
};

export default function AddCertifiedLabPage() {
  return (
    <AdminLayout>
      <CertifiedLabFormPage />
    </AdminLayout>
  );
}


