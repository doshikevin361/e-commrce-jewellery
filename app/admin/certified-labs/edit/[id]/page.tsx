import { AdminLayout } from '@/components/layout/admin-layout';
import { CertifiedLabFormPage } from '@/components/certified-labs/certified-lab-form-page';

export const metadata = {
  title: 'Edit Certified Lab | Admin',
  description: 'Edit certified lab',
};

export default async function EditCertifiedLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <CertifiedLabFormPage certifiedLabId={id} />
    </AdminLayout>
  );
}


