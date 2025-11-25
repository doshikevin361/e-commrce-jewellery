import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { ProductsPage } from '@/components/products/products-page';

export default function Products() {
  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-white'>
      <HomeHeader />
      <main className='w-full overflow-x-hidden pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        <ProductsPage />
      </main>
      <HomeFooter />
    </div>
  );
}

