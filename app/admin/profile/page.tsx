import { AdminLayout } from '@/components/layout/admin-layout';
import { VendorProfileClient } from '@/components/vendors/vendor-profile-client';

export const metadata = {
  title: 'Profile | Admin',
  description: 'Manage your profile information',
};

export default function ProfilePage() {
  return (
    <AdminLayout>
      <VendorProfileClient />
    </AdminLayout>
  );
}
