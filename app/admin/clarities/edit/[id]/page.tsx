import { AdminLayout } from '@/components/layout/admin-layout';
import { ClarityFormPage } from '@/components/clarities/clarity-form-page';

export const metadata = {
  title: 'Edit Clarity | Admin',
  description: 'Edit clarity',
};

export default async function EditClarityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <ClarityFormPage clarityId={id} />
    </AdminLayout>
  );
}

