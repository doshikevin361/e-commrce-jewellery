'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { GalleryFormPage } from '@/components/cms/gallery-form-page';
import { useEffect, useState } from 'react';

export default function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (!id) return null;
  return (
    <AdminLayout>
      <GalleryFormPage itemId={id} />
    </AdminLayout>
  );
}

