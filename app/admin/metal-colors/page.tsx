import { AdminLayout } from '@/components/layout/admin-layout';
import { MetalColorList } from '@/components/metal-colors/metal-color-list';

export const metadata = {
  title: 'Metal Colors | Admin',
  description: 'Manage metal colors',
};

export default function MetalColorsPage() {
  return (
    <AdminLayout>
      <MetalColorList />
    </AdminLayout>
  );
}

