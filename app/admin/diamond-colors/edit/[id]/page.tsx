import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondColorFormPage } from '@/components/diamond-colors/diamond-color-form-page';

export const metadata = {
  title: 'Edit Diamond Color | Admin',
  description: 'Edit diamond color',
};

export default async function EditDiamondColorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <DiamondColorFormPage diamondColorId={id} />
    </AdminLayout>
  );
}

