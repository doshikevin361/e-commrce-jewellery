'use client';

import { RetailerLayout } from '@/components/layout/retailer-layout';
import { RetailerSubscriptionPanel } from '@/components/subscription/retailer-subscription-panel';

export default function RetailerSubscriptionPage() {
  return (
    <RetailerLayout>
      <RetailerSubscriptionPanel />
    </RetailerLayout>
  );
}
