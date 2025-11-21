import { AdminLayout } from '@/components/layout/admin-layout';
import { BannerFormPage } from '@/components/cms/banner-form-page';

export const metadata = {
  title: 'Add Banner | CMS',
  description: 'Add new homepage banner',
};

export default function AddBannerPage() {
  return (
    <AdminLayout>
      <BannerFormPage />
    </AdminLayout>
  );
}

