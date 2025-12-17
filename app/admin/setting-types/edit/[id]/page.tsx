import { AdminLayout } from '@/components/layout/admin-layout';
import { SettingTypeFormPage } from '@/components/setting-types/setting-type-form-page';

export const metadata = {
  title: 'Edit Setting Type | Admin',
  description: 'Edit setting type',
};

export default async function EditSettingTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <SettingTypeFormPage settingTypeId={id} />
    </AdminLayout>
  );
}


