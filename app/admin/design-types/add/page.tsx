import { AdminLayout } from '@/components/layout/admin-layout';
import { DesignTypeFormPage } from '@/components/design-types/design-type-form-page';

export const metadata = {
  title: 'Add Design Type | Admin',
  description: 'Add a new design type',
};

export default function AddDesignTypePage() {
  return (
    <AdminLayout>
      <DesignTypeFormPage />
    </AdminLayout>
  );
}

