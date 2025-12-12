import { AdminLayout } from '@/components/layout/admin-layout';
import { CustomJewelleryList } from '@/components/custom-jewellery/custom-jewellery-list';

export const metadata = {
  title: 'Custom Jewellery | Admin',
  description: 'Manage custom jewellery requests',
};

export default function CustomJewelleryPage() {
  return (
    <AdminLayout>
      <CustomJewelleryList />
    </AdminLayout>
  );
}

