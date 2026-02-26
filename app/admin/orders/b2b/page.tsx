import { AdminLayout } from '@/components/layout/admin-layout';
import { OrderList } from '@/components/orders/order-list';

export const metadata = {
  title: 'B2B Orders | Admin',
  description: 'View B2B retailer orders',
};

export default function B2BOrdersPage() {
  return (
    <AdminLayout>
      <OrderList orderType="b2b" />
    </AdminLayout>
  );
}
