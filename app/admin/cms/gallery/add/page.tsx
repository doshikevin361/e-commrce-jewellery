'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { GalleryFormPage } from '@/components/cms/gallery-form-page';

export default function AddGalleryPage() {
  return (
    <AdminLayout>
      <GalleryFormPage />
    </AdminLayout>
  );
}

