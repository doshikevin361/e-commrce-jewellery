import { AdminLayout } from '@/components/layout/admin-layout';
import { DiamondTypeFormPage } from '@/components/diamond-types/diamond-type-form-page';

export const metadata = {
  title: 'Edit Diamond Type | Admin',
  description: 'Edit diamond type',
};

export default async function EditDiamondTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminLayout>
      <DiamondTypeFormPage diamondTypeId={id} />
    </AdminLayout>
  );
}

