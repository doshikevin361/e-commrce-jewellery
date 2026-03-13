import { AdminLayout } from '@/components/layout/admin-layout';
import { PriceCompareView } from '@/components/price-compare/price-compare-view';

export const metadata = {
  title: 'Commission Compare | Admin',
  description: 'Compare vendor and retailer commission by category',
};

export default function AdminPriceComparePage() {
  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <PriceCompareView context="admin" />
      </div>
    </AdminLayout>
  );
}
