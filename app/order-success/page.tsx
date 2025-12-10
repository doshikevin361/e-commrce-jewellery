import { Suspense } from 'react';
import { OrderSuccessPage } from '@/components/order/order-success-page';
import { PageLoader } from '@/components/common/page-loader';

export default function OrderSuccess() {
  return (
    <Suspense fallback={<PageLoader message="Loading..." className="min-h-screen" />}>
      <OrderSuccessPage />
    </Suspense>
  );
}
