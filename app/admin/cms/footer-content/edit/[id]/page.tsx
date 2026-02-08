'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { FooterContentFormPage } from '@/components/cms/footer-content-form-page';

export default function FooterContentEditPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <FooterContentFormPage pageId={params.id} />
    </AdminLayout>
  );
}


