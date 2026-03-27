import { RetailerLayout } from '@/components/layout/retailer-layout';
import { PickupLocationsPage } from '@/components/pickup-locations/pickup-locations-page';

export const metadata = {
  title: 'Pickup locations | Retailer',
  description: 'Shiprocket pickup warehouses',
};

export default function RetailerPickupLocationsPage() {
  return (
    <RetailerLayout>
      <PickupLocationsPage apiBase="/api/retailer/pickup-locations" title="Pickup locations (Shiprocket)" />
    </RetailerLayout>
  );
}
