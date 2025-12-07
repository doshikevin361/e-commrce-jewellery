import { Suspense } from 'react';
import { TrendingPage } from '@/components/trending/trending-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Trending() {
  return (
    <Suspense fallback={<PageLoader message="Loading trending products..." className="min-h-screen" />}>
      <TrendingPage />
    </Suspense>
  );
}

