'use client';

import { useParams } from 'next/navigation';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { ProductFormPage } from '@/components/products/product-form-page';

export default function RetailerMyProductEditPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RetailerLayout>
      <ProductFormPage productId={id} context="retailer" />
    </RetailerLayout>
  );
}
