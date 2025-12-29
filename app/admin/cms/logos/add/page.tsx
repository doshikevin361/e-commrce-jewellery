'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { LogoFormPage } from '@/components/cms/logo-form-page';

export default function AddLogoPage() {
  return (
    <AdminLayout>
      <LogoFormPage />
    </AdminLayout>
  );
}
