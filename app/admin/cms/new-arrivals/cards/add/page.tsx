'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { NewArrivalsCardFormPage } from '@/components/cms/new-arrivals-card-form-page';

export default function AddNewArrivalsCardPage() {
  return (
    <AdminLayout>
      <NewArrivalsCardFormPage />
    </AdminLayout>
  );
}

