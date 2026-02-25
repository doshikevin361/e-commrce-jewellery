'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Search, Users, RefreshCw } from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchRetailers = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/retailers?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.retailers)) {
        setRetailers(data.retailers);
      } else {
        setRetailers([]);
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700';
      case 'blocked':
        return 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">B2B Retailers</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Approve or block retailer accounts. Only approved retailers can sign in to the B2B panel.
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRetailers()}
                    className="pl-10 max-w-[300px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchRetailers} variant="outline" size="default" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-4 text-muted-foreground">Loading retailers...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-muted-foreground">No retailers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Company</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">GST / Tax ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Registered</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 text-center">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow
                        key={r._id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white py-4">{r.fullName}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 py-4">{r.email}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 py-4">{r.companyName}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 py-4 text-sm">{r.gstNumber || '—'}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 py-4">{r.contactNumber}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 py-4 text-sm">{formatDate(r.createdAt)}</TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge className={getStatusBadgeClass(r.status)}>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {r.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={actioning === r._id}
                                  onClick={() => handleApprove(r._id, false)}
                                >
                                  {actioning === r._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
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
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
