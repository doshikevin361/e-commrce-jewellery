import { AdminLayout } from '@/components/layout/admin-layout';
import { GemstoneNameFormPage } from '@/components/gemstone-names/gemstone-name-form-page';

export const metadata = {
  title: 'Add Gemstone Name | Admin',
  description: 'Add a new gemstone name',
};

export default function AddGemstoneNamePage() {
  return (
    <AdminLayout>
      <GemstoneNameFormPage />
    </AdminLayout>
  );
}

