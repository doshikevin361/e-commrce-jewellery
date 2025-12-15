import { AdminLayout } from '@/components/layout/admin-layout';
import { SubcategoryEditForm } from '@/components/subcategories/subcategory-edit-form';

export const metadata = {
  title: 'Edit Subcategory | Admin',
  description: 'Edit subcategory details',
};

export default async function EditSubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <SubcategoryEditForm subcategoryId={id} />
    </AdminLayout>
  );
}
