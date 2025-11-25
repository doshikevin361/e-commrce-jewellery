import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { ProductDetailPage } from '@/components/products/product-detail-page';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-white'>
      <HomeHeader />
      <main className='w-full overflow-x-hidden pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        <ProductDetailPage productId={id} />
      </main>
      <HomeFooter />
    </div>
  );
}

