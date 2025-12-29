'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { LogoList } from '@/components/cms/logo-list';

export default function LogosPage() {
  return (
    <AdminLayout>
      <LogoList />
    </AdminLayout>
  );
}
