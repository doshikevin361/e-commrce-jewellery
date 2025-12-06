'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { GalleryList } from '@/components/cms/gallery-list';

export default function GalleryPage() {
  return (
    <AdminLayout>
      <GalleryList />
    </AdminLayout>
  );
}

