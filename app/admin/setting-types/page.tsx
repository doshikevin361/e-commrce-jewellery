import { AdminLayout } from '@/components/layout/admin-layout';
import { SettingTypeList } from '@/components/setting-types/setting-type-list';

export const metadata = {
  title: 'Setting Types | Admin',
  description: 'Manage setting types',
};

export default function SettingTypesPage() {
  return (
    <AdminLayout>
      <SettingTypeList />
    </AdminLayout>
  );
}


