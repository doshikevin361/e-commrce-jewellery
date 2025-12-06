'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { DazzleList } from '@/components/cms/dazzle-list';

export default function DazzlePage() {
  return (
    <AdminLayout>
      <DazzleList />
    </AdminLayout>
  );
}

