import { AdminLayout } from '@/components/layout/admin-layout';
import { BannerFormPage } from '@/components/cms/banner-form-page';

export const metadata = {
  title: 'Edit Banner | CMS',
  description: 'Edit homepage banner',
};

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <AdminLayout>
      <BannerFormPage bannerId={id} />
    </AdminLayout>
  );
}

