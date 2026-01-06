import { ProductDetailPage } from '@/components/products/product-detail-page';
import type { Metadata } from 'next';

// Enable ISR with revalidation
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: 'Product Details',
    description: 'View product details and specifications',
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <ProductDetailPage productSlug={slug} />;
}
