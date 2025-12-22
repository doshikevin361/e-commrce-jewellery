import { AdminLayout } from '@/components/layout/admin-layout';
import { GemstoneNameList } from '@/components/gemstone-names/gemstone-name-list';

export const metadata = {
  title: 'Gemstone Names | Admin',
  description: 'Manage gemstone names',
};

export default function GemstoneNamesPage() {
  return (
    <AdminLayout>
      <GemstoneNameList />
    </AdminLayout>
  );
}

