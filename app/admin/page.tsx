import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { AdminLayout } from '@/components/layout/admin-layout';

export const metadata = {
  title: 'Admin / Vendor Dashboard',
  description: 'E-commerce Admin and Vendor Dashboard',
};

export default function AdminPage() {
  return (
    <AdminLayout>
      <DashboardClient />
    </AdminLayout>
  );
}
