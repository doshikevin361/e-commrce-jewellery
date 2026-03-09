'use client';

import { RetailerLayout } from '@/components/layout/retailer-layout';
import { PriceCompareView } from '@/components/price-compare/price-compare-view';

export default function RetailerPriceComparePage() {
  return (
    <RetailerLayout>
      <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <PriceCompareView context="retailer" />
      </div>
    </RetailerLayout>
  );
}
