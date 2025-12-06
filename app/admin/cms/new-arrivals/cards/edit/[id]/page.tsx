'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { NewArrivalsCardFormPage } from '@/components/cms/new-arrivals-card-form-page';
import { useEffect, useState } from 'react';

export default function EditNewArrivalsCardPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (!id) return null;
  return (
    <AdminLayout>
      <NewArrivalsCardFormPage cardId={id} />
    </AdminLayout>
  );
}

