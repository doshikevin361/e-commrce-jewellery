import { AdminLayout } from '@/components/layout/admin-layout';
import { ProductFormPage } from '@/components/products/product-form-page';

export const metadata = {
  title: 'Edit Retailer Product | Admin',
  description: 'Edit retailer product details',
};

export default async function AdminEditRetailerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminLayout>
      <ProductFormPage productId={id} context='admin-retailer' />
    </AdminLayout>
  );
}
