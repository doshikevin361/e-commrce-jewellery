import { AdminLayout } from '@/components/layout/admin-layout';
import { RetailerFormPage } from '@/components/retailers/retailer-form-page';

export const metadata = {
  title: 'Edit Retailer | Admin',
  description: 'Edit B2B retailer details',
};

export default async function EditRetailerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminLayout>
      <RetailerFormPage retailerId={id} />
    </AdminLayout>
  );
}
