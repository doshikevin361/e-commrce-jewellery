import { PageLayout } from '@/components/layout/page-layout';
import { ProductDetailPage } from '@/components/products/product-detail-page';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <PageLayout>
      <ProductDetailPage productId={id} />
    </PageLayout>
  );
}

