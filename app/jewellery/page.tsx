import { Suspense } from 'react';
import { JewelleryPage } from '@/components/jewellery/jewellery-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Jewellery() {
  return (
    <Suspense fallback={<PageLoader message="Loading jewellery..." className="min-h-screen" />}>
      <JewelleryPage />
    </Suspense>
  );
}

