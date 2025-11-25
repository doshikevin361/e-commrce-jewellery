import { ProductDetailPage } from '@/components/products/product-detail-page';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <ProductDetailPage productId={id} />;
}

