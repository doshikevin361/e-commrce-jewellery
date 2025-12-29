'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { LogoFormPage } from '@/components/cms/logo-form-page';

export default function EditLogoPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <LogoFormPage logoId={params.id} />
    </AdminLayout>
  );
}
