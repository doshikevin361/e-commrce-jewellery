import { Suspense } from 'react';
import { WishlistPage } from '@/components/wishlist/wishlist-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Wishlist() {
  return (
    <Suspense fallback={<PageLoader message="Loading wishlist..." className="min-h-screen" />}>
      <WishlistPage />
    </Suspense>
  );
}

