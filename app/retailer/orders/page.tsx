'use client';

import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function RetailerOrdersPage() {
  return (
    <RetailerLayout>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Card className="bg-white border-0 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Orders will appear here. Coming soon.</p>
        </Card>
      </div>
    </RetailerLayout>
  );
}
