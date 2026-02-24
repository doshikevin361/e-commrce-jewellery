'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Store, Package, FileText, MoreVertical } from 'lucide-react';

export function RetailerDashboardClient() {
  const [user, setUser] = useState<{
    fullName?: string;
    companyName?: string;
    trustedVendorIds?: string[];
  } | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('retailerUser');
      if (u) setUser(JSON.parse(u));
    } catch {
      setUser(null);
    }
  }, []);

  const stats = [
    { label: 'Company', value: user?.companyName || '—', icon: Store },
    { label: 'Trusted Vendors', value: String(Array.isArray(user?.trustedVendorIds) ? user.trustedVendorIds.length : 0), icon: Package },
    { label: 'Orders', value: 'Coming soon', icon: FileText },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">B2B Retailer Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white p-4 hover:shadow-md transition-all duration-200 border-0">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-0 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome, {user?.fullName || user?.companyName || 'Retailer'}</h3>
        <p className="text-gray-600 text-sm">
          Your B2B account is linked to the trusted vendors you selected during registration. Product access and ordering will use this list. Contact support to update your trusted vendors.
        </p>
      </Card>
    </div>
  );
}
