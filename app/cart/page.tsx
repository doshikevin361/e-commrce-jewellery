import { Suspense } from 'react';
import { CartPage } from '@/components/cart/cart-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Cart() {
  return (
    <Suspense fallback={<PageLoader message="Loading cart..." className="min-h-screen" />}>
      <CartPage />
    </Suspense>
  );
}

