import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { HomePage as LuxeHomePage } from '@/components/home/home-page';

export default function Home() {
  return (
    <div className='min-h-screen w-full overflow-x-hidden'>
      <HomeHeader />
      <main className='w-full overflow-x-hidden pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        <LuxeHomePage />
      </main>
      <HomeFooter />
    </div>
  );
}
