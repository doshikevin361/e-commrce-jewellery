'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Filter, Plus, Pencil, Eye, Package, FileDown } from 'lucide-react';
import { AdminPagination } from '@/components/ui/admin-pagination';
import { formatIndianDate } from '@/app/utils/helper';
import { jsPDF } from 'jspdf';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

interface RetailerProduct {
  _id: string;
  name: string;
  mainImage?: string;
  shortDescription?: string;
  shopName?: string;
  sellingPrice: number;
  quantity: number;
  status: string;
  category?: string;
  sku?: string;
  product_type?: string;
  designType?: string;
  metalType?: string;
  goldPurity?: string;
  silverPurity?: string;
  metalColour?: string;
  weight?: number;
  size?: string;
  hsnCode?: string;
  retailerCommissionRate?: number;
  updatedAt?: string;
  createdAt?: string;
  relatedProducts?: { _id: string; name: string; mainImage?: string; sellingPrice: number; quantity: number; category?: string }[];
}

interface Category {
  _id: string;
  name: string;
}

export function RetailerProductList() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [viewProductData, setViewProductData] = useState<RetailerProduct | null>(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/retailer/my-products?page=1&limit=500&status=all', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        router.replace('/retailer/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/retailer/categories', { credentials: 'include', headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      }
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || (p.category || '') === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
    const qty = p.quantity ?? 0;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && qty > 0) ||
      (stockFilter === 'out-of-stock' && qty === 0) ||
      (stockFilter === 'low-stock' && qty > 0 && qty <= 10);
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, stockFilter]);

  const handleAddProduct = () => router.push('/retailer/my-products/add');
  const handleEditProduct = (p: RetailerProduct) => router.push(`/retailer/my-products/${p._id}/edit`);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setSavingStatusId(id);
    try {
      const res = await fetch(`/api/retailer/my-products/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => (p._id === id ? { ...p, status: newStatus } : p)));
        toast({ title: 'Success', description: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`, variant: 'success' });
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed');
      }
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to update status', variant: 'destructive' });
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleExport = () => {
    try {
      const csvHeaders = [
        'Name',
        'SKU',
        'Product Type',
        'Category',
        'Design Type',
        'Metal Type',
        'Purity',
        'Metal Colour',
        'Weight (g)',
        'Size',
        'Price',
        'Stock (Qty)',
        'Status',
        'Retailer Commission %',
        'Shop Name',
        'HSN Code',
      ];
      const csvRows = filteredProducts.map(p => [
        p.name ?? '',
        p.sku ?? '',
        p.product_type ?? '',
        p.category ?? '',
        p.designType ?? '',
        p.metalType ?? '',
        (p.goldPurity || p.silverPurity || '').trim() || '',
        p.metalColour ?? '',
        p.weight ?? '',
        p.size ?? '',
        p.sellingPrice ?? 0,
        p.quantity ?? 0,
        p.status || 'active',
        p.retailerCommissionRate ?? '',
        p.shopName ?? '',
        p.hsnCode ?? '',
      ]);
      const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.map(escapeCsv).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `my-products_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: 'Success', description: `Exported ${filteredProducts.length} products to CSV`, variant: 'default' });
    } catch {
      toast({ title: 'Error', description: 'Failed to export', variant: 'destructive' });
    }
  };

  const loadImageAsDataUrl = (url: string): Promise<string | null> => {
    if (!url || !url.startsWith('http')) return Promise.resolve(null);
    return fetch(url, { mode: 'cors' })
      .then(r => r.blob())
      .then(blob => new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      }))
      .catch(() => null);
  };

  const handleExportPdf = async () => {
    if (filteredProducts.length === 0) {
      toast({ title: 'No data', description: 'No products to export', variant: 'destructive' });
      return;
    }
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const margin = 6;
      const rowH = 14;
      const cols = {
        img: 12,
        name: 28,
        sku: 12,
        type: 12,
        category: 16,
        designType: 14,
        metalType: 10,
        purity: 10,
        metalColour: 10,
        weight: 8,
        size: 8,
        price: 16,
        qty: 6,
        status: 8,
        commission: 10,
        shopName: 16,
        hsnCode: 12,
      };
      const tableStart = margin + cols.img;
      const headers = [
        'Image',
        'Name',
        'SKU',
        'Type',
        'Category',
        'Design',
        'Metal',
        'Purity',
        'Metal Clr',
        'Wt',
        'Size',
        'Price',
        'Qty',
        'Status',
        'Comm %',
        'Shop',
        'HSN',
      ];
      const colKeys = ['name', 'sku', 'type', 'category', 'designType', 'metalType', 'purity', 'metalColour', 'weight', 'size', 'price', 'qty', 'status', 'commission', 'shopName', 'hsnCode'] as const;
      let y = margin + 8;

      doc.setFontSize(14);
      doc.text('My Products', margin, y);
      y += 6;
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}  |  Total: ${filteredProducts.length} products`, margin, y);
      y += 8;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.15);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      let x = margin;
      doc.rect(x, y, cols.img, rowH);
      doc.text('Image', x + 1, y + 5);
      x += cols.img;
      colKeys.forEach((k, i) => {
        const w = cols[k as keyof typeof cols];
        doc.rect(x, y, w, rowH);
        doc.text(headers[i + 1], x + 1, y + 5);
        x += w;
      });
      y += rowH;
      doc.setFont('helvetica', 'normal');

      const formatPrice = (n: number) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');
      const purityVal = (p: RetailerProduct) => (p.goldPurity || p.silverPurity || '').trim() || '—';

      for (let i = 0; i < filteredProducts.length; i++) {
        if (y > 195) {
          doc.addPage('a4', 'landscape');
          y = margin;
        }
        const p = filteredProducts[i];
        const imgW = cols.img - 2;
        const imgH = rowH - 2;
        doc.rect(margin, y, cols.img, rowH);
        if (p.mainImage) {
          try {
            const dataUrl = await loadImageAsDataUrl(p.mainImage);
            if (dataUrl) {
              const fmt = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
              doc.addImage(dataUrl, fmt, margin + 1, y + 1, imgW, imgH, undefined, 'FAST');
            } else {
              doc.setFontSize(5);
              doc.text('—', margin + cols.img / 2 - 1, y + rowH / 2 + 1);
            }
          } catch {
            doc.setFontSize(5);
            doc.text('—', margin + cols.img / 2 - 1, y + rowH / 2 + 1);
          }
        } else {
          doc.setFontSize(5);
          doc.text('—', margin + cols.img / 2 - 1, y + rowH / 2 + 1);
        }
        doc.setFontSize(6);
        x = tableStart;
        const values: (string | number)[] = [
          (p.name || '—').slice(0, 22),
          (p.sku || '—').slice(0, 8),
          (p.product_type || '—').slice(0, 6),
          (p.category || '—').slice(0, 10),
          (p.designType || '—').slice(0, 8),
          (p.metalType || '—').slice(0, 6),
          purityVal(p).slice(0, 6),
          (p.metalColour || '—').slice(0, 6),
          p.weight ?? '—',
          (p.size || '—').slice(0, 4),
          formatPrice(p.sellingPrice ?? 0),
          p.quantity ?? 0,
          (p.status || 'active').slice(0, 4),
          (p.retailerCommissionRate ?? '') === '' ? '—' : String(p.retailerCommissionRate),
          (p.shopName || '—').slice(0, 10),
          (p.hsnCode || '—').slice(0, 8),
        ];
        colKeys.forEach((k, idx) => {
          const w = cols[k as keyof typeof cols];
          doc.rect(x, y, w, rowH);
          doc.text(String(values[idx] ?? '—'), x + 1, y + 5);
          x += w;
        });
        y += rowH;
      }

      doc.save(`my-products_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: 'Success', description: `PDF downloaded: ${filteredProducts.length} products`, variant: 'default' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
  };

  const fetchProductDetails = async (id: string) => {
    try {
      setLoadingProductDetails(true);
      const res = await fetch(`/api/retailer/my-products/${id}`, { credentials: 'include', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setViewProductData(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load product details', variant: 'destructive' });
    } finally {
      setLoadingProductDetails(false);
    }
  };

  const handleViewProduct = (id: string) => {
    setViewProductId(id);
    setViewProductData(null);
    fetchProductDetails(id);
  };

  const formatCurrency = (value?: number) =>
    typeof value === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value) : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Products</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-600" onClick={handleExportPdf} disabled={filteredProducts.length === 0}>
            <FileDown className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-600" onClick={handleExport} disabled={filteredProducts.length === 0}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="gap-2 bg-[#22c55e] text-white" onClick={handleAddProduct}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <Select value={itemsPerPage.toString()} onValueChange={v => setItemsPerPage(Number(v))}>
              <SelectTrigger className="w-[120px] bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 max-w-[300px]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat._id} value={cat.name || cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue placeholder="All Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock (≤10)</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-slate-600 dark:text-slate-400 !h-[36px] dark:hover:text-white">
              Clear All
            </Button>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">No products found</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">Add a product or use &quot;Sell to Portal&quot; from a B2B order.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={handleAddProduct} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/retailer/orders">My Orders</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <TableHead className="font-semibold text-slate-900 dark:text-white py-4 px-4">Product</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-white py-4 px-4">Category</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-white py-4 px-4">Price</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-white py-4 px-4 text-center">Stock</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-white py-4 px-4 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-white py-4 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map(product => (
                    <TableRow
                      key={product._id}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                    >
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                            {product.mainImage ? (
                              <Image src={product.mainImage} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-slate-900 dark:text-white block truncate">{product.name}</span>
                            {product.sku && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">SKU: {product.sku}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {product.category || '-'}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-sm font-semibold ${
                            (product.quantity ?? 0) === 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : (product.quantity ?? 0) <= 10
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}
                        >
                          {product.quantity ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        <Switch
                          size="md"
                          checked={(product.status || 'active') === 'active'}
                          onCheckedChange={() => handleToggleStatus(product._id, product.status || 'active')}
                          disabled={savingStatusId === product._id}
                        />
                      </TableCell>
                      <TableCell className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => handleViewProduct(product._id)}
                            title="View product"
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-600 rounded p-1"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            title="Edit product"
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-600 rounded p-1"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {filteredProducts.length > 0 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredProducts.length}
            />
          )}
        </div>
      </Card>

      {viewProductId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setViewProductId(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Product Details</h2>
              {loadingProductDetails ? (
                <div className="py-8 text-center text-slate-500">Loading...</div>
              ) : viewProductData ? (
                <div className="space-y-4 text-sm">
                  {viewProductData.mainImage && (
                    <div className="flex justify-center">
                      <Image src={viewProductData.mainImage} alt={viewProductData.name} width={200} height={200} className="rounded-lg object-cover" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-slate-500">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewProductData.name}</p>
                    <p className="text-slate-500">SKU</p>
                    <p className="font-medium">{viewProductData.sku || '-'}</p>
                    <p className="text-slate-500">Category</p>
                    <p className="font-medium">{viewProductData.category || '-'}</p>
                    <p className="text-slate-500">Product Type</p>
                    <p className="font-medium">{viewProductData.product_type || '-'}</p>
                    <p className="text-slate-500">Price</p>
                    <p className="font-medium">{formatCurrency(viewProductData.sellingPrice)}</p>
                    <p className="text-slate-500">Stock</p>
                    <p className="font-medium">{viewProductData.quantity ?? 0}</p>
                    <p className="text-slate-500">Status</p>
                    <p className="font-medium">{viewProductData.status || 'active'}</p>
                    <p className="text-slate-500">Updated</p>
                    <p className="font-medium">{viewProductData.updatedAt ? formatIndianDate(viewProductData.updatedAt) : '-'}</p>
                  </div>
                  {viewProductData.shortDescription && (
                    <div>
                      <p className="text-slate-500 mb-1">Short Description</p>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{viewProductData.shortDescription}</p>
                    </div>
                  )}
                  {Array.isArray(viewProductData.relatedProducts) && viewProductData.relatedProducts.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                      <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">Your related products (same category)</p>
                      <div className="flex flex-wrap gap-2">
                        {viewProductData.relatedProducts.slice(0, 6).map(rel => (
                          <button
                            key={rel._id}
                            type="button"
                            onClick={() => handleViewProduct(rel._id)}
                            className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left min-w-0 max-w-full"
                          >
                            {rel.mainImage ? (
                              <Image src={rel.mainImage} alt={rel.name} width={40} height={40} className="rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-600 shrink-0 flex items-center justify-center">
                                <Package className="w-5 h-5 text-slate-500" />
                              </div>
                            )}
                            <span className="truncate text-sm font-medium text-slate-900 dark:text-white">{rel.name}</span>
                            <span className="text-xs text-slate-500 shrink-0">{formatCurrency(rel.sellingPrice)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setViewProductId(null)}>
                  Close
                </Button>
                <Button className="ml-2" onClick={() => viewProductId && handleEditProduct({ _id: viewProductId } as RetailerProduct)}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
