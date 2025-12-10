import { Suspense } from 'react';
import { CheckoutPage } from '@/components/checkout/checkout-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Checkout() {
  return (
    <Suspense fallback={<PageLoader message="Loading checkout..." className="min-h-screen" />}>
      <CheckoutPage />
    </Suspense>
  );
}
