'use client';

import { RetailerLayout } from '@/components/layout/retailer-layout';
import { RetailerDashboardClient } from '@/components/dashboard/retailer-dashboard-client';

export default function RetailerDashboardPage() {
  return (
    <RetailerLayout>
      <RetailerDashboardClient />
    </RetailerLayout>
  );
}
