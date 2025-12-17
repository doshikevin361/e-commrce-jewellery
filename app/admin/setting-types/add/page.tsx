import { AdminLayout } from '@/components/layout/admin-layout';
import { SettingTypeFormPage } from '@/components/setting-types/setting-type-form-page';

export const metadata = {
  title: 'Add Setting Type | Admin',
  description: 'Add a new setting type',
};

export default function AddSettingTypePage() {
  return (
    <AdminLayout>
      <SettingTypeFormPage />
    </AdminLayout>
  );
}


