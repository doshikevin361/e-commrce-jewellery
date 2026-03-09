'use client';

import { RetailerLayout } from '@/components/layout/retailer-layout';
import { ProductFormPage } from '@/components/products/product-form-page';

export default function RetailerAddProductPage() {
  return (
    <RetailerLayout>
      <ProductFormPage context="retailer" />
    </RetailerLayout>
  );
}
