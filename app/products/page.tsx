import { Suspense } from 'react';
import { DynamicProductsPage } from '@/components/products/dynamic-products-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Products() {
  return (
    <Suspense fallback={<PageLoader message="Loading products..." className="min-h-screen" />}>
      <DynamicProductsPage />
    </Suspense>
  );
}

