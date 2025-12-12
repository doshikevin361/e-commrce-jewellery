import { AdminLayout } from '@/components/layout/admin-layout';
import { OrderDetailPage } from '@/components/orders/order-detail-page';

export const metadata = {
  title: 'Order Details | Admin',
  description: 'View and manage order details',
};

export default function OrderDetailPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AdminLayout>
      <OrderDetailPage params={params} />
    </AdminLayout>
  );
}

