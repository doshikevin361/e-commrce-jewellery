import { AdminLayout } from '@/components/layout/admin-layout';
import { DesignTypeFormPage } from '@/components/design-types/design-type-form-page';

export const metadata = {
  title: 'Edit Design Type | Admin',
  description: 'Edit design type',
};

export default async function EditDesignTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <DesignTypeFormPage designTypeId={id} />
    </AdminLayout>
  );
}

