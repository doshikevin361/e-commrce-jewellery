import { AdminLayout } from '@/components/layout/admin-layout';
import { MetalColorFormPage } from '@/components/metal-colors/metal-color-form-page';

export const metadata = {
  title: 'Add Metal Color | Admin',
  description: 'Add a new metal color',
};

export default function AddMetalColorPage() {
  return (
    <AdminLayout>
      <MetalColorFormPage />
    </AdminLayout>
  );
}

