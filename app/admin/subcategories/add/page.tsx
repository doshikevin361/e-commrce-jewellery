import { AdminLayout } from '@/components/layout/admin-layout';
import { SubcategoryAddForm } from '@/components/subcategories/subcategory-add-form';

export const metadata = {
  title: 'Add Subcategory | Admin',
  description: 'Add a new subcategory',
};

export default function AddSubcategoryPage() {
  return (
    <AdminLayout>
      <SubcategoryAddForm />
    </AdminLayout>
  );
}
