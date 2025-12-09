import { ProductDetailPage } from '@/components/products/product-detail-page';

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <ProductDetailPage productSlug={slug} />;
}
