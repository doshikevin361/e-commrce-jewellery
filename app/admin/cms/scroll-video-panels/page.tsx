'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { ScrollVideoPanelsList } from '@/components/cms/scroll-video-panels-list';

export default function ScrollVideoPanelsPage() {
  return (
    <AdminLayout>
      <ScrollVideoPanelsList />
    </AdminLayout>
  );
}

