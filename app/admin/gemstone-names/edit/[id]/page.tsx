import { AdminLayout } from '@/components/layout/admin-layout';
import { GemstoneNameFormPage } from '@/components/gemstone-names/gemstone-name-form-page';

export const metadata = {
  title: 'Edit Gemstone Name | Admin',
  description: 'Edit gemstone name',
};

export default async function EditGemstoneNamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <GemstoneNameFormPage gemstoneNameId={id} />
    </AdminLayout>
  );
}

