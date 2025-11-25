import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { GiftGuidePage } from '@/components/gift-guide/gift-guide-page';

export default function GiftGuide() {
  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-white'>
      <HomeHeader />
      <main className='w-full overflow-x-hidden pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        <GiftGuidePage />
      </main>
      <HomeFooter />
    </div>
  );
}

