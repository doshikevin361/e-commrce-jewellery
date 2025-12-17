import { AdminLayout } from '@/components/layout/admin-layout';
import { MetalColorFormPage } from '@/components/metal-colors/metal-color-form-page';

export const metadata = {
  title: 'Edit Metal Color | Admin',
  description: 'Edit metal color',
};

export default async function EditMetalColorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <MetalColorFormPage metalColorId={id} />
    </AdminLayout>
  );
}

