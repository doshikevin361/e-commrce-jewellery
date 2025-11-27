import { Suspense } from 'react';
import { DynamicProductsPage } from '@/components/products/dynamic-products-page';

export default function Products() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-screen'><p className='text-lg'>Loading products...</p></div>}>
      <DynamicProductsPage />
    </Suspense>
  );
}

