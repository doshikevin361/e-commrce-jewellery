'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';

interface RetailerRow {
  _id: string;
  fullName: string;
  email: string;
  companyName: string;
  gstNumber: string;
  contactNumber: string;
  businessAddress: string;
  trustedVendorIds: string[];
  status: string;
  createdAt: string;
}

export default function AdminRetailersPage() {
  const [retailers, setRetailers] = useState<RetailerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchRetailers = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/retailers?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.retailers)) {
        setRetailers(data.retailers);
      }
    } catch {
      setRetailers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, [statusFilter]);

  const handleApprove = async (id: string, block: boolean) => {
    setActioning(id);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch(`/api/admin/retailers/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: block ? 'blocked' : 'approved' }),
      });
      if (res.ok) await fetchRetailers();
    } finally {
      setActioning(null);
    }
  };

  const filtered = search.trim()
    ? retailers.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()) ||
          r.companyName?.toLowerCase().includes(search.toLowerCase())
      )
    : retailers;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">B2B Retailers</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Approve or block retailer accounts. Only approved retailers can sign in to the B2B panel.
          </p>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRetailers()}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="blocked">Blocked</option>
            </select>
            <Button onClick={fetchRetailers} variant="outline">Refresh</Button>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>GST / Tax ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No retailers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium">{r.fullName}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell>{r.companyName}</TableCell>
                        <TableCell className="text-sm text-slate-600">{r.gstNumber}</TableCell>
                        <TableCell>{r.contactNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={r.status === 'approved' ? 'default' : r.status === 'blocked' ? 'destructive' : 'secondary'}
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="mr-2 bg-green-600 hover:bg-green-700"
                                disabled={actioning === r._id}
                                onClick={() => handleApprove(r._id, false)}
                              >
                                {actioning === r._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {' Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actioning === r._id}
                                onClick={() => handleApprove(r._id, true)}
                              >
                                Block
                              </Button>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actioning === r._id}
                              onClick={() => handleApprove(r._id, true)}
                            >
                              Block
                            </Button>
                          )}
                          {r.status === 'blocked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actioning === r._id}
                              onClick={() => handleApprove(r._id, false)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
