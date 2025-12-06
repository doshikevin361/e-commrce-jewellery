import { Suspense } from 'react';
import { HomePage } from '@/components/home/dynamic-home-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Home() {
  return (
    <Suspense fallback={<PageLoader message="Loading..." className="min-h-screen" />}>
      <HomePage />
    </Suspense>
  );
}
