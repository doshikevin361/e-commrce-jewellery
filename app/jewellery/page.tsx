import { Suspense } from 'react';
import { JewelleryPage } from '@/components/jewellery/jewellery-page';

export default function Jewellery() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-screen'><p className='text-lg'>Loading jewellery...</p></div>}>
      <JewelleryPage />
    </Suspense>
  );
}

