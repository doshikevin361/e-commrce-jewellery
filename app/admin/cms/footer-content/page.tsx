'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { FooterContentList } from '@/components/cms/footer-content-list';

export default function FooterContentPage() {
  return (
    <AdminLayout>
      <FooterContentList />
    </AdminLayout>
  );
}

