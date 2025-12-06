'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { BannerFormPage } from '@/components/cms/dazzle-form-page';
import { useEffect, useState } from 'react';

export default function EditDazzlePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (!id) return null;
  return (
    <AdminLayout>
      <BannerFormPage cardId={id} />
    </AdminLayout>
  );
}

