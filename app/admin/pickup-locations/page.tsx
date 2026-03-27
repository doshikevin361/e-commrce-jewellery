import { AdminLayout } from '@/components/layout/admin-layout';
import { PickupLocationsPage } from '@/components/pickup-locations/pickup-locations-page';

export const metadata = {
  title: 'Pickup locations | Admin',
  description: 'Shiprocket pickup warehouses',
};

export default function AdminPickupLocationsPage() {
  return (
    <AdminLayout>
      <PickupLocationsPage apiBase="/api/admin/pickup-locations" title="Pickup locations (Shiprocket)" />
    </AdminLayout>
  );
}
