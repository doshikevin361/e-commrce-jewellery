import { Suspense } from 'react';
import { HomePage } from '@/components/home/dynamic-home-page';
import { PageLoader } from '@/components/common/page-loader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Jewellery Collection | Home',
  description: 'Discover our exquisite collection of premium jewellery including gold, silver, diamonds, and gemstones.',
};

// Enable ISR with revalidation
export const revalidate = 60;

export default function Home() {
  return (
    <Suspense fallback={<PageLoader message="Loading..." className="min-h-screen" />}>
      <HomePage />
    </Suspense>
  );
}
