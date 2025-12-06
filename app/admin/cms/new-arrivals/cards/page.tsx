'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { NewArrivalsCardsList } from '@/components/cms/new-arrivals-cards-list';

export default function NewArrivalsCardsPage() {
  return (
    <AdminLayout>
      <NewArrivalsCardsList />
    </AdminLayout>
  );
}

