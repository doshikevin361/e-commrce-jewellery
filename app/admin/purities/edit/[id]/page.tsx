import { AdminLayout } from '@/components/layout/admin-layout';
import { PurityFormPage } from '@/components/purities/purity-form-page';

export const metadata = {
  title: 'Edit Purity | Admin',
  description: 'Edit purity',
};

export default async function EditPurityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <PurityFormPage purityId={id} />
    </AdminLayout>
  );
}

