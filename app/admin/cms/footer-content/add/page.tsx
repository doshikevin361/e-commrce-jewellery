'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { FooterContentFormPage } from '@/components/cms/footer-content-form-page';

export default function FooterContentAddPage() {
  return (
    <AdminLayout>
      <FooterContentFormPage />
    </AdminLayout>
  );
}

