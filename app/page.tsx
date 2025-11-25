import { PageLayout } from '@/components/layout/page-layout';
import { HomePage as LuxeHomePage } from '@/components/home/home-page';

export default function Home() {
  return (
    <PageLayout className='bg-white'>
      <LuxeHomePage />
    </PageLayout>
  );
}
