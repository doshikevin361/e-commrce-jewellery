'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { NewArrivalsFormPage } from '@/components/cms/new-arrivals-form-page';

export default function NewArrivalsPage() {
  return (
    <AdminLayout>
      <NewArrivalsFormPage />
    </AdminLayout>
  );
}

