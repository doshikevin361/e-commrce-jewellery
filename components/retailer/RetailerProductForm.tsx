'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import FormField from '@/components/formField/formField';
import { toast } from 'react-toastify';

const PRODUCT_TYPES = ['Gold', 'Silver', 'Platinum', 'Diamonds', 'Gemstone', 'Imitation'];
const GENDER_OPTIONS = [{ label: 'Man', value: 'Man' }, { label: 'Women', value: 'Women' }, { label: 'Unisex', value: 'Unisex' }];

export type RetailerProductFormData = {
  name: string;
  sku: string;
  category: string;
  product_type: string;
  designType: string;
  goldPurity: string;
  silverPurity: string;
  metalColour: string;
  weight: number | string;
  size: string;
  gender: string[];
  shortDescription: string;
  description: string;
  mainImage: string;
  images: string[];
  seoTitle: string;
  seoDescription: string;
  seoTags: string;
  specifications: { key: string; value: string }[];
  sellingPrice: number | string;
  quantity: number | string;
  status: 'active' | 'inactive';
  hsnCode: string;
  tags: string[];
  urlSlug: string;
};

const emptyForm: RetailerProductFormData = {
  name: '',
  sku: '',
  category: '',
  product_type: '',
  designType: '',
  goldPurity: '',
  silverPurity: '',
  metalColour: '',
  weight: 0,
  size: '',
  gender: [],
  shortDescription: '',
  description: '',
  mainImage: '',
  images: [],
  seoTitle: '',
  seoDescription: '',
  seoTags: '',
  specifications: [{ key: '', value: '' }],
  sellingPrice: 0,
  quantity: 1,
  status: 'active',
  hsnCode: '',
  tags: [],
  urlSlug: '',
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('retailerToken');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

type Props = {
  mode: 'add' | 'edit';
  productId?: string;
  initialData?: Partial<RetailerProductFormData> | null;
  onSuccess: () => void;
};

export function RetailerProductForm({ mode, productId, initialData, onSuccess }: Props) {
  const [form, setForm] = useState<RetailerProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [designTypeOptions, setDesignTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [purityOptions, setPurityOptions] = useState<{ value: string; label: string }[]>([]);
  const [karatOptions, setKaratOptions] = useState<{ value: string; label: string }[]>([]);
  const [metalColorOptions, setMetalColorOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...emptyForm,
        ...prev,
        ...initialData,
        specifications: Array.isArray(initialData.specifications) && initialData.specifications.length > 0
          ? initialData.specifications
          : [{ key: '', value: '' }],
        images: Array.isArray(initialData.images) ? initialData.images : [],
        gender: Array.isArray(initialData.gender) ? initialData.gender : [],
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, designRes, purityRes, karatRes, metalRes] = await Promise.all([
          fetch('/api/retailer/categories', { credentials: 'include', headers: getAuthHeaders() }),
          fetch('/api/retailer/design-types', { credentials: 'include', headers: getAuthHeaders() }),
          fetch('/api/retailer/purities', { credentials: 'include', headers: getAuthHeaders() }),
          fetch('/api/retailer/karats', { credentials: 'include', headers: getAuthHeaders() }),
          fetch('/api/retailer/metal-colors', { credentials: 'include', headers: getAuthHeaders() }),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          const list = Array.isArray(d.categories) ? d.categories : [];
          setCategoryOptions(list.map((c: { name: string }) => ({ value: c.name || '', label: c.name || '' })));
        }
        if (designRes.ok) {
          const d = await designRes.json();
          const list = Array.isArray(d.designTypes) ? d.designTypes : [];
          setDesignTypeOptions(list.map((item: { name: string }) => ({ value: item.name || '', label: item.name || '' })));
        }
        if (purityRes.ok) {
          const d = await purityRes.json();
          const list = Array.isArray(d.purities) ? d.purities : [];
          setPurityOptions(list.map((item: { name: string }) => ({ value: item.name || '', label: item.name || '' })));
        }
        if (karatRes.ok) {
          const d = await karatRes.json();
          const list = Array.isArray(d.karats) ? d.karats : [];
          setKaratOptions(list.map((item: { name: string }) => ({ value: item.name || '', label: item.name || '' })));
        }
        if (metalRes.ok) {
          const d = await metalRes.json();
          const list = Array.isArray(d.metalColors) ? d.metalColors : [];
          setMetalColorOptions(list.map((item: { name: string }) => ({ value: item.name || '', label: item.name || '' })));
        }
      } catch (_) {}
    };
    fetchOptions();
  }, []);

  const update = <K extends keyof RetailerProductFormData>(key: K, value: RetailerProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'mainImage' | 'images') => {
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
          if (field === 'mainImage') update('mainImage', data.url);
          else update('images', [...form.images, data.url]);
          toast.success('Image uploaded');
        } else toast.error('Upload failed');
      } else toast.error('Upload failed');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const addSpec = () => update('specifications', [...form.specifications, { key: '', value: '' }]);
  const updateSpec = (index: number, key: 'key' | 'value', value: string) => {
    const next = [...form.specifications];
    next[index] = { ...next[index], [key]: value };
    update('specifications', next);
  };
  const removeSpec = (index: number) => {
    if (form.specifications.length <= 1) return;
    update('specifications', form.specifications.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => update('images', form.images.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    const sellingPrice = typeof form.sellingPrice === 'number' ? form.sellingPrice : parseFloat(String(form.sellingPrice)) || 0;
    const quantity = typeof form.quantity === 'number' ? form.quantity : parseInt(String(form.quantity), 10) || 0;
    if (sellingPrice < 0) {
      toast.error('Enter a valid selling price');
      return;
    }
    if (quantity < 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    const payload = {
      ...form,
      sellingPrice,
      quantity,
      weight: typeof form.weight === 'number' ? form.weight : parseFloat(String(form.weight)) || 0,
      specifications: form.specifications.filter((s) => s.key.trim() || s.value.trim()),
    };
    setSaving(true);
    try {
      if (mode === 'add') {
        const res = await fetch('/api/retailer/my-products', {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create');
        }
        toast.success('Product created');
      } else if (productId) {
        const res = await fetch(`/api/retailer/my-products/${productId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update');
        }
        toast.success('Product updated');
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product name *" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter product name" required />
          <FormField label="SKU" value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="e.g. SKU-001" />
          <div className="md:col-span-2">
            <Label className="text-sm font-medium">Category</Label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Product Type</Label>
            <select
              value={form.product_type}
              onChange={(e) => update('product_type', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Design Type</Label>
            <select
              value={form.designType}
              onChange={(e) => update('designType', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {designTypeOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Karat</Label>
            <select
              value={form.goldPurity}
              onChange={(e) => update('goldPurity', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {karatOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Purity</Label>
            <select
              value={form.silverPurity}
              onChange={(e) => update('silverPurity', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {purityOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Metal Colour</Label>
            <select
              value={form.metalColour}
              onChange={(e) => update('metalColour', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {metalColorOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <FormField label="Weight (gram)" value={String(form.weight)} onChange={(e) => update('weight', e.target.value)} type="number" placeholder="e.g. 10" />
          <FormField label="Size" value={form.size} onChange={(e) => update('size', e.target.value)} placeholder="e.g. 7, M" />
          <FormField label="HSN Code" value={form.hsnCode} onChange={(e) => update('hsnCode', e.target.value)} placeholder="e.g. 7113" />
          <FormField label="URL Slug" value={form.urlSlug} onChange={(e) => update('urlSlug', e.target.value)} placeholder="optional-url-slug" />
          <div className="md:col-span-2">
            <Label className="text-sm font-medium">Gender</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {GENDER_OPTIONS.map((g) => (
                <label key={g.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.gender.includes(g.value)}
                    onChange={(e) => {
                      const next = e.target.checked ? [...form.gender, g.value] : form.gender.filter((x) => x !== g.value);
                      update('gender', next);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{g.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <div className="space-y-4">
          <FormField label="Short description" value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} placeholder="Brief for listing" textarea />
          <FormField label="Long description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Full description" textarea />
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Images
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Main image *</Label>
            <div className="flex flex-col sm:flex-row gap-4 items-start mt-2">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border shrink-0">
                {form.mainImage ? (
                  <Image src={form.mainImage} alt="" fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400"><Package className="w-10 h-10" /></div>
                )}
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <Input value={form.mainImage} onChange={(e) => update('mainImage', e.target.value)} placeholder="URL or upload" className="w-full" />
                <Label className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, 'mainImage')} disabled={uploadingImage} />
                </Label>
              </div>
            </div>
          </div>
          <div>
            <Label>Gallery images</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded overflow-hidden border">
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <Label className="w-20 h-20 flex items-center justify-center rounded border border-dashed cursor-pointer hover:bg-gray-50">
                <Plus className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(e, 'images')} disabled={uploadingImage} />
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* SEO */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">SEO</h2>
        <div className="space-y-4">
          <FormField label="SEO Title" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} placeholder="Meta title" />
          <FormField label="SEO Description" value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} placeholder="Meta description" textarea />
          <FormField label="SEO Tags" value={form.seoTags} onChange={(e) => update('seoTags', e.target.value)} placeholder="Comma-separated tags" />
        </div>
      </Card>

      {/* Specifications */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Specifications</h2>
        <div className="space-y-2">
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={spec.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} placeholder="Key" className="flex-1" />
              <Input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="Value" className="flex-1" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(i)} disabled={form.specifications.length <= 1}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addSpec}><Plus className="w-4 h-4 mr-2" />Add row</Button>
        </div>
      </Card>

      {/* Tags */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tags</h2>
        <FormField
          label="Tags (comma-separated)"
          value={Array.isArray(form.tags) ? form.tags.join(', ') : ''}
          onChange={(e) => update('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder="tag1, tag2"
        />
      </Card>

      {/* Pricing & Inventory */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Selling price (₹) *" value={String(form.sellingPrice)} onChange={(e) => update('sellingPrice', e.target.value)} type="number" placeholder="e.g. 50000" required />
          <FormField label="Quantity *" value={String(form.quantity)} onChange={(e) => update('quantity', e.target.value)} type="number" placeholder="e.g. 1" required />
        </div>
      </Card>

      {/* Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Visibility</h2>
        <div>
          <Label>Status</Label>
          <select value={form.status} onChange={(e) => update('status', e.target.value as 'active' | 'inactive')} className="mt-1 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="active">Active (visible on website)</option>
            <option value="inactive">Inactive (hidden)</option>
          </select>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {mode === 'add' ? 'Create product' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
      </div>
    </form>
  );
}
