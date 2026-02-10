'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Store, Percent, Search } from 'lucide-react';

interface CommissionRow {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  vendorCommission: number;
}

interface VendorCommissionSummary {
  _id: string;
  storeName: string;
  ownerName?: string;
  email: string;
  status?: string;
  commissionSetupCompleted?: boolean;
  commissionRows: CommissionRow[];
  productTypeCommissions?: Record<string, number>;
  allowedProductTypes?: string[];
  allowedCategories?: string[];
}

export default function VendorCommissionsPage() {
  const [vendors, setVendors] = useState<VendorCommissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/vendor-commissions', { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data) => {
        setVendors(data.vendors ?? []);
      })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredVendors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter((vendor) => {
      const storeName = vendor.storeName?.toLowerCase() ?? '';
      const ownerName = vendor.ownerName?.toLowerCase() ?? '';
      const email = vendor.email?.toLowerCase() ?? '';
      return (
        storeName.includes(term) ||
        ownerName.includes(term) ||
        email.includes(term)
      );
    });
  }, [vendors, searchTerm]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Commission
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Vendor-wise Commission Details
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Saved commission settings for each vendor (product type, category,
              design, metal, purity, %).
            </p>
          </div>
          <div className="flex w-full justify-end sm:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by store, owner, or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </Card>
        ) : vendors.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">
            No vendors found.
          </Card>
        ) : filteredVendors.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">
            No vendors match your search.
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredVendors.map((v) => (
              <Card
                key={v._id}
                className="overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/20">
                  <div className="flex flex-wrap items-center gap-3">
                    <Store className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {v.storeName || '—'}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {v.ownerName && `${v.ownerName} · `}
                        {v.email}
                      </p>
                    </div>
                    {v.status && (
                      <Badge
                        variant={
                          v.status === 'approved'
                            ? 'default'
                            : v.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {v.status}
                      </Badge>
                    )}
                    {v.commissionSetupCompleted ? (
                      <Badge variant="default" className="gap-1">
                        <Percent className="h-3 w-3" />
                        Setup done
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Setup pending</Badge>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {v.commissionRows.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">
                      No commission rows saved.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/20">
                          <TableHead className="whitespace-nowrap">
                            Product Type
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Category
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Design Type
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Metal
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Purity / Karat
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Vendor Commission (%)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {v.commissionRows.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="whitespace-nowrap">
                              {row.productType || '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {row.category || '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {row.designType || '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {row.metal || '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {row.purityKarat || '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-medium">
                              {row.vendorCommission}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
