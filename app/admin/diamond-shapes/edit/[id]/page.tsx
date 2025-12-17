import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondShapeFormPage } from '@/components/diamond-shapes/diamond-shape-form-page';

export const metadata = {
  title: 'Edit Diamond Shape | Admin',
  description: 'Edit diamond shape',
};

export default async function EditDiamondShapePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <DiamondShapeFormPage diamondShapeId={id} />
    </AdminLayout>
  );
}


