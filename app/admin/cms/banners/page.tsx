import { AdminLayout } from '@/components/layout/admin-layout';
import { BannerList } from '@/components/cms/banner-list';

export const metadata = {
  title: 'Homepage Banners | CMS',
  description: 'Manage homepage banners',
};

export default function BannersPage() {
  return (
    <AdminLayout>
      <BannerList />
    </AdminLayout>
  );
}

