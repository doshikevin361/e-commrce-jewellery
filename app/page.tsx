import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { HomePage as LuxeHomePage } from '@/components/home/home-page';

export default function Home() {
  return (
    <div className='min-h-screen bg-[#FDFBF7]'>
      <HomeHeader />
      <main className='py-6'>
        <LuxeHomePage />
      </main>
      <HomeFooter />
    </div>
  );
}
