'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ScrollVideoPanelFormPage } from '@/components/cms/scroll-video-panel-form-page';

export default function EditScrollVideoPanelPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (!id) return null;

  return (
    <AdminLayout>
      <ScrollVideoPanelFormPage panelId={id} />
    </AdminLayout>
  );
}

