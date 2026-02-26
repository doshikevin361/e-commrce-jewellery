'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { RetailerLayout } from '@/components/layout/retailer-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Package, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import FormField from '@/components/formField/formField';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

type Product = {
  _id: string;
  name: string;
  mainImage: string;
  shortDescription?: string;
  shopName?: string;
  sellingPrice: number;
  quantity: number;
  status: string;
};

export default function RetailerMyProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    mainImage: '',
    sellingPrice: '',
    quantity: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/retailer/my-products/${id}`, { credentials: 'include', headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/retailer/login');
          return null;
        }
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setProduct(data);
          setForm({
            name: data.name || '',
            shortDescription: data.shortDescription || '',
            mainImage: data.mainImage || '',
            sellingPrice: String(data.sellingPrice ?? 0),
            quantity: String(data.quantity ?? 0),
            status: data.status === 'inactive' ? 'inactive' : 'active',
          });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setForm((f) => ({ ...f, mainImage: data.url }));
          toast.success('Image uploaded');
        } else {
          toast.error('Upload failed');
        }
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.sellingPrice);
    const qty = parseInt(form.quantity, 10);
    if (isNaN(price) || price < 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/retailer/my-products/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          shortDescription: form.shortDescription.trim() || undefined,
          mainImage: form.mainImage.trim() || undefined,
          sellingPrice: price,
          quantity: qty,
          status: form.status,
        }),
      });
      if (res.ok) {
        toast.success('Product updated');
        router.push('/retailer/my-products');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RetailerLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
        </div>
      </RetailerLayout>
    );
  }

  if (!product) {
    return (
      <RetailerLayout>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <Button variant="outline" asChild>
            <Link href="/retailer/my-products">Back to My Products</Link>
          </Button>
        </div>
      </RetailerLayout>
    );
  }

  return (
    <RetailerLayout>
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/retailer/my-products">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic information - same section style as admin */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Product name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
              <FormField
                label="Short description (optional)"
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                placeholder="Brief description for listing"
                textarea
              />
            </div>
          </Card>

          {/* Image - same as admin product form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Product Image
            </h2>
            <div className="space-y-4">
              <Label>Main image</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  {form.mainImage ? (
                    <Image
                      src={form.mainImage}
                      alt={form.name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <Input
                    value={form.mainImage}
                    onChange={(e) => setForm((f) => ({ ...f, mainImage: e.target.value }))}
                    placeholder="Image URL or upload below"
                    className="w-full"
                  />
                  <div className="flex items-center gap-2">
                    <Label htmlFor="retailer-product-image-upload" className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload image
                      </span>
                      <input
                        id="retailer-product-image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing & inventory - same as admin */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Selling price (₹) *"
                value={form.sellingPrice}
                onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                type="number"
                placeholder="e.g. 50000"
                required
              />
              <FormField
                label="Quantity in stock *"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                type="number"
                placeholder="e.g. 1"
                required
              />
            </div>
          </Card>

          {/* Status - same as admin */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Visibility
            </h2>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="active">Active (visible on website)</option>
                <option value="inactive">Inactive (hidden from website)</option>
              </select>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save changes
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/retailer/my-products">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </RetailerLayout>
  );
}
