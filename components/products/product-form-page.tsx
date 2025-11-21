'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, X, Plus, Package, DollarSign, Archive, Search, Settings, ImageIcon, Loader2, Check, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Dropdown from '../customDropdown/customDropdown';
import FormField from '../formField/formField';
import { MainImageUpload } from '@/components/media/main-image-upload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn, getPlainTextFromHtml } from '@/lib/utils';
import { useSettings } from '@/components/settings/settings-provider';

const PRODUCT_TYPE_OPTIONS = [
  { label: 'Physical Product', value: 'Physical Product' },
  { label: 'Digital Product', value: 'Digital Product' },
  { label: 'External / Affiliate Product', value: 'External / Affiliate Product' },
  { label: 'Jewellery', value: 'Jewellery' },
] as const;

const WHOLESALE_PRICE_TYPE_OPTIONS = [
  { label: 'Fixed', value: 'Fixed' },
  { label: 'Percentage', value: 'Percentage' },
] as const;

const JEWELLERY_PURITY_OPTIONS = [
  { label: '18k', value: '18k' },
  { label: '22k', value: '22k' },
  { label: '24k', value: '24k' },
] as const;

type ProductType = (typeof PRODUCT_TYPE_OPTIONS)[number]['value'];
type WholesalePriceType = (typeof WHOLESALE_PRICE_TYPE_OPTIONS)[number]['value'];
type JewelleryPurity = (typeof JEWELLERY_PURITY_OPTIONS)[number]['value'];

interface Product {
  _id?: string;
  name: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  regularPrice: number;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  stock: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  barcode: string;
  weight: number;
  dimensions: string;
  shippingClass: string;
  processingTime: string;
  product_type: ProductType;
  free_shipping: boolean;
  allow_return: boolean;
  return_policy: string;
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  focusKeyword: string;
  mainImage: string;
  galleryImages: string[];
  sizeChartImage: string;
  productVideo: string;
  wholesalePriceType: WholesalePriceType;
  jewelleryWeight: number;
  jewelleryPurity: JewelleryPurity | '';
  jewelleryMakingCharges: number;
  jewelleryStoneDetails: string;
  jewelleryCertification: string;
  variants: Array<{
    id: string;
    type: string;
    options: Array<{
      name: string;
      sku: string;
      price: number;
      stock: number;
      image: string;
    }>;
  }>;
  relatedProducts: string[];
  status: string;
  visibility: string;
  featured: boolean;
  allowReviews: boolean;
  returnPolicyDays: number;
  warrantyPeriod: string;
  vendor: string;
  createdAt?: string; // Added for potential API response
  updatedAt?: string; // Added for potential API response
}

const INITIAL_PRODUCT: Product = {
  name: '',
  sku: '',
  shortDescription: '',
  longDescription: '',
  category: '',
  subcategory: '',
  brand: '',
  tags: [],
  regularPrice: 0,
  sellingPrice: 0,
  costPrice: 0,
  taxRate: 18,
  stock: 0,
  lowStockThreshold: 10,
  allowBackorders: false,
  barcode: '',
  weight: 0,
  dimensions: '',
  shippingClass: 'Standard',
  processingTime: '1-2 days',
  product_type: 'Physical Product',
  free_shipping: false,
  allow_return: false,
  return_policy: '',
  metaTitle: '',
  metaDescription: '',
  urlSlug: '',
  focusKeyword: '',
  mainImage: '',
  galleryImages: [],
  sizeChartImage: '',
  productVideo: '',
  wholesalePriceType: 'Fixed',
  jewelleryWeight: 0,
  jewelleryPurity: '',
  jewelleryMakingCharges: 0,
  jewelleryStoneDetails: '',
  jewelleryCertification: '',
  variants: [],
  relatedProducts: [],
  status: 'active',
  visibility: 'Public',
  featured: false,
  allowReviews: true,
  returnPolicyDays: 30,
  warrantyPeriod: '1 year',
  vendor: 'Main Store',
};

interface ProductFormPageProps {
  productId?: string;
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  // Filter product type options based on settings
  const availableProductTypes = settings.productType
    ? PRODUCT_TYPE_OPTIONS.filter(option => option.value !== 'Jewellery')
    : [{ label: 'Jewellery', value: 'Jewellery' }];
  
  const [formData, setFormData] = useState<Product>({
    ...INITIAL_PRODUCT,
    tags: [],
    galleryImages: [],
    variants: [],
    relatedProducts: [],
    product_type: settings.productType ? INITIAL_PRODUCT.product_type : 'Jewellery',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchingProduct, setFetchingProduct] = useState(!!productId);
  const [vendors, setVendors] = useState<Array<{ _id: string; storeName: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ _id: string; name: string; status?: string }>>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'>('basic');
  const [tabsWithErrors, setTabsWithErrors] = useState<Set<'basic' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'>>(new Set());
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [loadingTags, setLoadingTags] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    fetchVendors();
    fetchCategories();
    fetchTags();
    fetchBrands();
  }, [productId]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/vendors');
      const data = await response.json();
      const allVendors = Array.isArray(data.vendors) ? data.vendors : [];

      // Filter only approved vendors
      const approvedVendors = allVendors.filter((vendor: any) => vendor.status === 'approved');

      setVendors(approvedVendors);
    } catch (error) {
      console.error('[v0] Failed to fetch vendors:', error);
      setVendors([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      const allCategories = Array.isArray(data) ? data : Array.isArray(data.categories) ? data.categories : [];

      // Filter only active categories
      const activeCategories = allCategories.filter((cat: any) => cat.status === 'active');

      setCategories(activeCategories);
    } catch (error) {
      console.error('[v0] Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/admin/brands?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      const activeBrands = Array.isArray(data) ? data.filter((brand: any) => brand?.status !== 'inactive') : [];
      setBrands(
        activeBrands.map((brand: any) => ({
          _id: brand._id,
          name: brand.name,
          status: brand.status,
        }))
      );
    } catch (error) {
      console.error('[v0] Failed to fetch brands:', error);
      setBrands([]);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const response = await fetch('/api/admin/tags?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      const tagNames = Array.isArray(data)
        ? data.map((tag: any) => (typeof tag?.name === 'string' ? tag.name.trim() : '')).filter((name: string) => !!name)
        : [];
      setAvailableTags(prev => {
        const combined = [...prev, ...tagNames];
        return Array.from(new Set(combined));
      });
    } catch (error) {
      console.error('[v0] Failed to fetch tags:', error);
      toast({
        title: 'Error',
        description: 'Unable to load tag options',
        variant: 'destructive',
      });
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchProduct = async () => {
    try {
      console.log('[v0] Fetching product with ID:', productId);
      const response = await fetch(`/api/admin/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Fetched product data:', data);

        const safeData = {
          ...INITIAL_PRODUCT,
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : [],
          galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
          variants: Array.isArray(data.variants)
            ? data.variants.map((v: any) => ({
                ...v,
                id: v.id || v._id || Date.now().toString() + Math.random(),
                options: Array.isArray(v.options) ? v.options : [],
              }))
            : [],
          relatedProducts: Array.isArray(data.relatedProducts) ? data.relatedProducts : [],
        };

        console.log('[v0] Safe product data:', safeData);
        setFormData(safeData);
        console.log('[v0] Form data set successfully');
      } else {
        const errorData = await response.json();
        console.error('[v0] Failed to fetch product:', errorData);
        toast({
          title: 'Error',
          description: 'Failed to load product',
          variant: 'destructive',
        });
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('[v0] Failed to fetch product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
      router.push('/admin/products');
    } finally {
      setFetchingProduct(false);
    }
  };

  // Map field names to their corresponding tabs
  const fieldToTabMap: Record<string, 'basic' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'> = {
    product_type: 'basic',
    name: 'basic',
    sku: 'basic',
    shortDescription: 'basic',
    longDescription: 'basic',
    category: 'basic',
    brand: 'basic',
    vendor: 'basic',
    free_shipping: 'basic',
    allow_return: 'basic',
    return_policy: 'basic',
    regularPrice: 'pricing',
    sellingPrice: 'pricing',
    costPrice: 'pricing',
    taxRate: 'pricing',
    wholesalePriceType: 'pricing',
    jewelleryWeight: 'pricing',
    jewelleryPurity: 'pricing',
    jewelleryMakingCharges: 'pricing',
    jewelleryStoneDetails: 'pricing',
    jewelleryCertification: 'pricing',
    stock: 'inventory',
    lowStockThreshold: 'inventory',
    allowBackorders: 'inventory',
    barcode: 'inventory',
    mainImage: 'images',
    galleryImages: 'images',
    sizeChartImage: 'images',
    productVideo: 'images',
    urlSlug: 'seo',
    focusKeyword: 'seo',
    metaTitle: 'seo',
    metaDescription: 'seo',
    // Other fields in 'other' tab don't have validation errors
  };

  useEffect(() => {
    // Hide scroll
    document.body.style.overflowY = 'hidden';

    // Cleanup when leaving page
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setTagsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get which tabs have errors
  const getTabsWithErrors = (errorFields: Record<string, string>): Set<'basic' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'> => {
    const tabs = new Set<'basic' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'>();
    Object.keys(errorFields).forEach(field => {
      const tab = fieldToTabMap[field];
      if (tab) {
        tabs.add(tab);
      }
    });
    return tabs;
  };

  // Check if field belongs to active tab
  const isFieldInActiveTab = (fieldName: string): boolean => {
    const tab = fieldToTabMap[fieldName];
    return tab === activeTab;
  };

  // Filter errors to only show errors for fields in the active tab
  const getFilteredErrors = (): Record<string, string> => {
    const filtered: Record<string, string> = {};
    Object.keys(errors).forEach(field => {
      if (isFieldInActiveTab(field)) {
        filtered[field] = errors[field];
      }
    });
    return filtered;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const isJewelleryProduct = formData.product_type === 'Jewellery';

    if (!formData.product_type?.trim()) newErrors.product_type = 'Product type is required';
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.shortDescription?.trim()) newErrors.shortDescription = 'Short description is required';
    if (!getPlainTextFromHtml(formData.longDescription)) newErrors.longDescription = 'Long description is required';
    if (!isJewelleryProduct) {
      if (formData.regularPrice <= 0) newErrors.regularPrice = 'Regular price must be greater than 0';
      if (formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
      if (formData.sellingPrice > formData.regularPrice) newErrors.sellingPrice = 'Selling price cannot exceed regular price';
    } else {
      if (formData.jewelleryWeight <= 0) newErrors.jewelleryWeight = 'Weight is required for jewellery';
      if (!formData.jewelleryPurity?.trim()) newErrors.jewelleryPurity = 'Purity is required for jewellery';
      if (formData.jewelleryMakingCharges <= 0) newErrors.jewelleryMakingCharges = 'Making charges must be greater than 0';
    }
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.urlSlug?.trim()) newErrors.urlSlug = 'URL slug is required';
    if (!formData.metaTitle?.trim()) newErrors.metaTitle = 'Meta title is required';
    if (!formData.metaDescription?.trim()) newErrors.metaDescription = 'Meta description is required';
    if (!formData.mainImage?.trim()) newErrors.mainImage = 'Main image is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.vendor?.trim()) newErrors.vendor = 'Vendor is required';
    if (formData.allow_return && !formData.return_policy?.trim()) {
      newErrors.return_policy = 'Return policy is required when returns are enabled';
    }

    setErrors(newErrors);
    const tabsWithErrorsSet = getTabsWithErrors(newErrors);
    setTabsWithErrors(tabsWithErrorsSet);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all required fields before submitting',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const method = productId ? 'PUT' : 'POST';
      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';

      const { _id, createdAt, updatedAt, ...cleanData } = formData as any;

      console.log('[v0] Submitting product data:', cleanData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: productId ? 'Product updated successfully' : 'Product created successfully',
          variant: 'success',
        });
        router.push('/admin/products');
      } else {
        toast({
          title: 'Error',
          description: responseData.error || `Failed to save product`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        // Update tabs with errors when field error is cleared
        const updatedTabsWithErrors = getTabsWithErrors(newErrors);
        setTabsWithErrors(updatedTabsWithErrors);
        return newErrors;
      });
    }
  };

  const addTag = (tag: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (tag && !currentTags.includes(tag)) {
      handleChange('tags', [...currentTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    handleChange(
      'tags',
      currentTags.filter(t => t !== tag)
    );
  };

  const handleCreateTag = async (tagNameParam?: string) => {
    if (creatingTag) return;
    const newTagName = (tagNameParam ?? tagSearchTerm).trim();
    if (!newTagName) return;

    setCreatingTag(true);
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName, status: 'active' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create tag');
      }

      const createdTagName = typeof data?.name === 'string' ? data.name : newTagName;
      setAvailableTags(prev => Array.from(new Set([...prev, createdTagName])));
      addTag(createdTagName);
      setTagSearchTerm('');
      toast({
        title: 'Tag added',
        description: `"${createdTagName}" is now available`,
        variant: 'success',
      });
    } catch (error) {
      console.error('[v0] Failed to create tag:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add tag',
        variant: 'destructive',
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleAddOrCreateTag = (value?: string) => {
    const candidate = (value ?? tagSearchTerm).trim();
    if (!candidate) return;

    const matchedTag = availableTags.find(tag => tag.toLowerCase() === candidate.toLowerCase());
    if (matchedTag) {
      addTag(matchedTag);
      setTagSearchTerm('');
      return;
    }

    void handleCreateTag(candidate);
  };

  const autoGenerateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    handleChange('urlSlug', slug);
  };

  const trimmedTagInput = tagSearchTerm.trim();
  const normalizedTagQuery = trimmedTagInput.toLowerCase();
  const filteredTags = normalizedTagQuery ? availableTags.filter(tag => tag.toLowerCase().includes(normalizedTagQuery)) : availableTags;
  const tagExists = trimmedTagInput ? availableTags.some(tag => tag.toLowerCase() === trimmedTagInput.toLowerCase()) : false;
  const isJewellery = formData.product_type === 'Jewellery';

  if (fetchingProduct) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-lg'>Loading product...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: Package },
    { id: 'pricing', label: 'Pricing & Tax', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Archive },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'other', label: 'Other Details', icon: Settings },
  ];

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => router.push('/admin/products')}
              className='inline-flex items-center justify-center cursor-pointer bg-white p-2 text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200'>
              <ArrowLeft className='h-5 w-5' />
            </button>
            <h1 className='text-2xl md:text-3xl font-bold text-slate-900 dark:text-white'>
              {productId ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            <aside className='lg:col-span-3'>
              <div className='bg-white rounded-lg shadow-sm p-2 space-y-1'>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const hasError = tabsWithErrors.has(tab.id);
                  return (
                    <button
                      type='button'
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex cursor-pointer items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                        activeTab === tab.id ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      <Icon className='w-5 h-5' />
                      <span className={cn('text-sm md:text-base', hasError && 'text-red-600')}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Tab Content */}
            <section className='lg:col-span-9 space-y-6'>
              <Card className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                <div className='space-y-6 px-6 py-6'>
                  {activeTab === 'basic' && (
                    <div className='space-y-6'>
                      <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Basic Information</h3>

                      <Dropdown
                        options={settings.productType ? [{ label: 'Select Product Type', value: '' }, ...availableProductTypes] : availableProductTypes}
                        placeholder='Select product type'
                        labelMain='Product Type *'
                        value={formData.product_type}
                        onChange={option => handleChange('product_type', option.value as ProductType)}
                        error={isFieldInActiveTab('product_type') ? errors.product_type : undefined}
                      />

                      <Dropdown
                        labelMain='Vendor *'
                        options={[
                          { label: 'Select Vendor', value: '' },
                          ...(vendors || []).map(vendor => ({
                            label: vendor.storeName,
                            value: vendor.storeName,
                          })),
                        ]}
                        value={formData.vendor}
                        onChange={option => handleChange('vendor', option.value)}
                        placeholder='Select vendor'
                        error={isFieldInActiveTab('vendor') ? errors.vendor : undefined}
                      />

                      <FormField
                        label='Product Name'
                        required
                        placeholder='Enter product name'
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        error={getFilteredErrors().name}
                      />

                      <FormField
                        label='SKU'
                        required
                        value={formData.sku}
                        onChange={e => handleChange('sku', e.target.value)}
                        placeholder='Auto-generate or enter SKU'
                        error={getFilteredErrors().sku}
                      />

                      <Dropdown
                        options={[
                          { label: 'Select Brand', value: '' },
                          ...brands.map(brand => ({
                            label: brand.name,
                            value: brand.name,
                          })),
                        ]}
                        placeholder='Select Brand'
                        withSearch={true}
                        labelMain='Brand'
                        value={formData.brand}
                        onChange={option => handleChange('brand', option.value)}
                      />

                      <Dropdown
                        options={categories.map(cat => ({
                          label: cat.name,
                          value: cat.name,
                        }))}
                        placeholder='Select Category'
                        withSearch={true}
                        labelMain='Category *'
                        error={isFieldInActiveTab('category') ? errors.category : undefined}
                        value={formData.category}
                        onChange={val => handleChange('category', val.value)}
                      />

                      <FormField
                        label='Short Description'
                        required
                        textarea
                        rows={2}
                        placeholder='Brief product description'
                        value={formData.shortDescription}
                        onChange={e => handleChange('shortDescription', e.target.value)}
                        error={isFieldInActiveTab('shortDescription') ? errors.shortDescription : undefined}
                      />

                      <RichTextEditor
                        label='Long Description'
                        required
                        value={formData.longDescription}
                        onChange={val => handleChange('longDescription', val)}
                        placeholder='Detailed product description'
                        error={isFieldInActiveTab('longDescription') ? errors.longDescription : undefined}
                      />

                      <div className='space-y-3' ref={tagDropdownRef}>
                        <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>Tags (Multi-select)</label>
                        <div className='relative'>
                          <button
                            type='button'
                            onClick={() => setTagsDropdownOpen(prev => !prev)}
                            className='flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'>
                            <span>
                              {(formData.tags || []).length
                                ? `${formData.tags.length} tag${formData.tags.length > 1 ? 's' : ''} selected`
                                : 'Select tags'}
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${tagsDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {tagsDropdownOpen && (
                            <div className='absolute z-30 mt-2 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800 space-y-3'>
                              <div className='flex gap-2'>
                                <Input
                                  value={tagSearchTerm}
                                  onChange={e => setTagSearchTerm(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddOrCreateTag();
                                    }
                                  }}
                                  placeholder='Search or create tags'
                                  className='flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                                />
                                <Button
                                  type='button'
                                  onClick={() => handleAddOrCreateTag()}
                                  disabled={!trimmedTagInput || creatingTag}
                                  className='bg-green-600 hover:bg-green-700 text-white flex items-center gap-2'>
                                  {creatingTag ? <Loader2 className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4' />}
                                  {tagExists ? 'Add' : 'Create'}
                                </Button>
                              </div>
                              <p className='text-xs text-slate-500 dark:text-slate-400'>Select existing tags or create a new one.</p>
                              <div className='max-h-56 overflow-y-auto rounded-md border border-slate-100 dark:border-slate-700'>
                                {loadingTags ? (
                                  <div className='flex items-center justify-center py-6 text-sm text-slate-500 gap-2'>
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                    Loading tags...
                                  </div>
                                ) : filteredTags.length ? (
                                  filteredTags.map(tag => {
                                    const isSelected = (formData.tags || []).includes(tag);
                                    return (
                                      <button
                                        type='button'
                                        key={tag}
                                        onClick={() => handleAddOrCreateTag(tag)}
                                        disabled={isSelected}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm transition ${
                                          isSelected
                                            ? 'text-green-600 cursor-not-allowed bg-green-50 dark:bg-green-900/10'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                        }`}>
                                        <span>{tag}</span>
                                        {isSelected ? <Check className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className='px-4 py-4 text-sm text-slate-500'>No tags found. Create a new one above.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {(formData.tags || []).map(tag => (
                            <span
                              key={tag}
                              className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm'>
                              {tag}
                              <button
                                type='button'
                                onClick={() => removeTag(tag)}
                                className='hover:text-green-900 dark:hover:text-green-100'>
                                <X className='w-4 h-4' />
                              </button>
                            </span>
                          ))}
                          {!(formData.tags || []).length && <span className='text-xs text-slate-500'>No tags selected yet.</span>}
                        </div>
                      </div>

                      <div className='grid gap-4 md:grid-cols-2'>
                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Free Shipping</p>
                            <p className='text-xs text-muted-foreground'>Offer free shipping for this product</p>
                          </div>
                          <Switch
                            id='free-shipping'
                            checked={formData.free_shipping}
                            onCheckedChange={checked => handleChange('free_shipping', checked)}
                          />
                        </div>

                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Allow Returns</p>
                            <p className='text-xs text-muted-foreground'>Enable customer returns for this product</p>
                          </div>
                          <Switch
                            id='allow-return'
                            checked={formData.allow_return}
                            onCheckedChange={checked => {
                              handleChange('allow_return', checked);
                              if (!checked) {
                                handleChange('return_policy', '');
                              }
                            }}
                          />
                        </div>
                      </div>

                      {formData.allow_return && (
                        <FormField
                          label='Return Policy'
                          textarea
                          rows={3}
                          value={formData.return_policy}
                          onChange={e => handleChange('return_policy', e.target.value)}
                          placeholder='Describe your return policy'
                          error={isFieldInActiveTab('return_policy') ? errors.return_policy : undefined}
                        />
                      )}
                    </div>
                  )}

                  {/* Pricing & Tax */}
                  {activeTab === 'pricing' && (
                    <div className='space-y-6'>
                      <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Pricing & Tax</h3>
                      {!isJewellery ? (
                        <>
                          <FormField
                            label='Regular Price (MRP)'
                            required
                            type='number'
                            value={formData.regularPrice}
                            onChange={e => handleChange('regularPrice', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                            error={isFieldInActiveTab('regularPrice') ? errors.regularPrice : undefined}
                          />

                          <FormField
                            label='Selling Price'
                            required
                            type='number'
                            value={formData.sellingPrice}
                            onChange={e => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                            error={isFieldInActiveTab('sellingPrice') ? errors.sellingPrice : undefined}
                          />

                          <FormField
                            label='Cost Price'
                            type='number'
                            value={formData.costPrice}
                            onChange={e => handleChange('costPrice', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                          />

                          <Dropdown
                            labelMain='Wholesale Price Type'
                            options={WHOLESALE_PRICE_TYPE_OPTIONS}
                            value={formData.wholesalePriceType}
                            onChange={option => handleChange('wholesalePriceType', option.value as WholesalePriceType)}
                            placeholder='Select wholesale price type'
                          />

                          <Dropdown
                            labelMain='Tax/GST Rate (%)'
                            options={[
                              { label: '5%', value: '5' },
                              { label: '12%', value: '12' },
                              { label: '18%', value: '18' },
                              { label: '28%', value: '28' },
                            ]}
                            value={String(formData.taxRate)}
                            onChange={option => handleChange('taxRate', parseFloat(option.value))}
                            placeholder='Select tax rate'
                          />

                          <div className='p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                              Discount:{' '}
                              <span className='font-semibold text-slate-900 dark:text-white'>
                                {formData.regularPrice > 0
                                  ? (((formData.regularPrice - formData.sellingPrice) / formData.regularPrice) * 100).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className='text-sm text-slate-600 dark:text-slate-400'>
                            Jewellery pricing replaces standard price fields. Provide the attributes below.
                          </p>

                          <FormField
                            label='Weight (grams)'
                            required
                            type='number'
                            value={formData.jewelleryWeight}
                            onChange={e => handleChange('jewelleryWeight', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                            error={isFieldInActiveTab('jewelleryWeight') ? errors.jewelleryWeight : undefined}
                          />

                          <Dropdown
                            labelMain='Purity'
                            options={JEWELLERY_PURITY_OPTIONS}
                            value={formData.jewelleryPurity}
                            onChange={option => handleChange('jewelleryPurity', option.value as JewelleryPurity)}
                            placeholder='Select purity'
                            error={isFieldInActiveTab('jewelleryPurity') ? errors.jewelleryPurity : undefined}
                          />

                          <FormField
                            label='Making Charges'
                            required
                            type='number'
                            value={formData.jewelleryMakingCharges}
                            onChange={e => handleChange('jewelleryMakingCharges', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                            error={isFieldInActiveTab('jewelleryMakingCharges') ? errors.jewelleryMakingCharges : undefined}
                          />

                          <FormField
                            label='Stone Details (optional)'
                            textarea
                            rows={2}
                            value={formData.jewelleryStoneDetails}
                            onChange={e => handleChange('jewelleryStoneDetails', e.target.value)}
                            placeholder='Describe stone quality, type, cut, etc.'
                          />

                          <FormField
                            label='Certification (optional)'
                            value={formData.jewelleryCertification}
                            onChange={e => handleChange('jewelleryCertification', e.target.value)}
                            placeholder='e.g., BIS Hallmark, GIA, IGI'
                          />
                        </>
                      )}
                    </div>
                  )}

                  {/* Inventory */}
                  {activeTab === 'inventory' && (
                    <div className='space-y-6'>
                      <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Inventory</h3>

                      <FormField
                        label='Stock Quantity'
                        required
                        type='number'
                        value={formData.stock}
                        onChange={e => handleChange('stock', parseInt(e.target.value) || 0)}
                        placeholder='0'
                        error={isFieldInActiveTab('stock') ? errors.stock : undefined}
                      />

                      <FormField
                        label='Low Stock Threshold'
                        type='number'
                        value={formData.lowStockThreshold}
                        onChange={e => handleChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                        placeholder='10'
                      />

                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          id='backorders'
                          checked={formData.allowBackorders}
                          onChange={e => handleChange('allowBackorders', e.target.checked)}
                          className='w-4 h-4 rounded border-slate-300 dark:border-slate-600'
                        />
                        <label htmlFor='backorders' className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                          Allow Backorders
                        </label>
                      </div>

                      <FormField
                        label='Barcode/UPC'
                        value={formData.barcode}
                        onChange={e => handleChange('barcode', e.target.value)}
                        placeholder='Enter barcode or UPC'
                      />
                    </div>
                  )}

                  {/* Images */}
                  {activeTab === 'images' && (
                    <div className='space-y-6'>
                      <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Images & Media</h3>

                      <div className='space-y-4'>
                        <MainImageUpload
                          label='Main Image'
                          required
                          value={formData.mainImage}
                          onChange={val => handleChange('mainImage', val)}
                          error={isFieldInActiveTab('mainImage') ? errors.mainImage : undefined}
                        />

                        <div className='space-y-2'>
                          <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>Gallery Images</label>
                          <Input
                            type='file'
                            accept='image/*'
                            multiple
                            onChange={e => {
                              if (e.target.files) {
                                const newImages: string[] = [];
                                Array.from(e.target.files).forEach(file => {
                                  const reader = new FileReader();
                                  reader.onload = event => {
                                    newImages.push(event.target?.result as string);
                                    if (newImages.length === e.target.files?.length) {
                                      handleChange('galleryImages', [...formData.galleryImages, ...newImages]);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                            className='bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                          />
                          <div className='grid grid-cols-3 gap-2 mt-4'>
                            {(formData.galleryImages || []).map((img, idx) => (
                              <div key={`gallery-${idx}`} className='relative'>
                                <img src={img || '/placeholder.svg'} alt={`Gallery ${idx}`} className='h-24 w-full object-cover rounded' />
                                <button
                                  type='button'
                                  onClick={() => {
                                    const currentImages = Array.isArray(formData.galleryImages) ? formData.galleryImages : [];
                                    handleChange(
                                      'galleryImages',
                                      currentImages.filter((_, i) => i !== idx)
                                    );
                                  }}
                                  className='absolute top-1 right-1 bg-red-600 text-white p-1 rounded'>
                                  <X className='w-3 h-3' />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>Size Chart (Image)</label>
                          <Input
                            type='file'
                            accept='image/*'
                            onChange={e => {
                              if (e.target.files?.[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = event => {
                                  handleChange('sizeChartImage', event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className='bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                          />
                          {formData.sizeChartImage && (
                            <div className='relative mt-3 w-32 h-32'>
                              <img
                                src={formData.sizeChartImage || '/placeholder.svg'}
                                alt='Size chart preview'
                                className='w-full h-full object-cover rounded'
                              />
                              <button
                                type='button'
                                onClick={() => handleChange('sizeChartImage', '')}
                                className='absolute top-1 right-1 bg-red-600 text-white p-1 rounded'>
                                <X className='w-3 h-3' />
                              </button>
                            </div>
                          )}
                        </div>

                        <FormField
                          label='Product Video URL'
                          value={formData.productVideo}
                          onChange={e => handleChange('productVideo', e.target.value)}
                          placeholder='https://youtube.com/watch?v=...'
                        />
                      </div>
                    </div>
                  )}

                  {/* SEO */}
                  {activeTab === 'seo' && (
                    <div className='space-y-6'>
                      <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>SEO Settings</h3>

                      <div className='space-y-2'>
                        <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                          URL Slug <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-2'>
                          <FormField
                            label='URL Slug'
                            required
                            hideLabel
                            value={formData.urlSlug}
                            onChange={e => handleChange('urlSlug', e.target.value)}
                            placeholder='product-name'
                            error={isFieldInActiveTab('urlSlug') ? errors.urlSlug : undefined}
                            containerClassName='flex-1'
                          />
                          <Button
                            type='button'
                            onClick={autoGenerateSlug}
                            className='bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white'>
                            Auto
                          </Button>
                        </div>
                      </div>

                      <FormField
                        label='Focus Keyword'
                        value={formData.focusKeyword}
                        onChange={e => handleChange('focusKeyword', e.target.value)}
                        placeholder='Main keyword to optimize for'
                      />

                      <FormField
                        label={`Meta Title (${formData.metaTitle.length}/60)`}
                        required
                        value={formData.metaTitle}
                        onChange={e => handleChange('metaTitle', e.target.value.slice(0, 60))}
                        placeholder='SEO title'
                        maxLength={60}
                        error={isFieldInActiveTab('metaTitle') ? errors.metaTitle : undefined}
                      />

                      <FormField
                        label={`Meta Description (${formData.metaDescription.length}/160)`}
                        required
                        textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={e => handleChange('metaDescription', e.target.value.slice(0, 160))}
                        placeholder='SEO description'
                        maxLength={160}
                        error={isFieldInActiveTab('metaDescription') ? errors.metaDescription : undefined}
                      />

                      <div className='p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'>
                        <p className='text-sm font-medium text-slate-700 dark:text-white mb-2'>Google Preview Snippet</p>
                        <div className='text-sm'>
                          <p className='text-blue-600 dark:text-blue-400 truncate'>{formData.urlSlug || 'product-url'}</p>
                          <p className='font-medium text-slate-900 dark:text-white truncate'>{formData.metaTitle || 'Your page title'}</p>
                          <p className='text-slate-600 dark:text-slate-400 line-clamp-2'>
                            {formData.metaDescription || 'Your description will appear here'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Details */}
                  {activeTab === 'other' && (
                    <div className='space-y-8'>
                      {/* Variants */}
                      {!isJewellery ? (
                        <div className='space-y-4'>
                          <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Product Variants</h3>
                          <p className='text-sm text-slate-600 dark:text-slate-400'>Add product variants like different sizes or colors</p>
                          <Button
                            type='button'
                            onClick={() => {
                              const newVariant = {
                                id: Date.now().toString(),
                                type: 'Color',
                                options: [],
                              };
                              const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                              handleChange('variants', [...currentVariants, newVariant]);
                            }}
                            className='bg-green-600 hover:bg-green-700 text-white'>
                            <Plus className='w-4 h-4 mr-2' />
                            Add Variant Type
                          </Button>

                          {(formData.variants || []).map((variant, variantIdx) => (
                            <div key={variant.id} className='p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4'>
                              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                                <FormField
                                  label='Variant Type'
                                  value={variant.type}
                                  onChange={e => {
                                    const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                    const newVariants = [...currentVariants];
                                    newVariants[variantIdx].type = e.target.value;
                                    handleChange('variants', newVariants);
                                  }}
                                  placeholder='e.g., Color, Size'
                                  containerClassName='flex-1'
                                />
                                <button
                                  type='button'
                                  onClick={() => {
                                    const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                    handleChange(
                                      'variants',
                                      currentVariants.filter((_, i) => i !== variantIdx)
                                    );
                                  }}
                                  className='text-red-600 hover:text-red-700'>
                                  <X className='w-4 h-4' />
                                </button>
                              </div>

                              <div className='space-y-3'>
                                <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Options</p>
                                {(variant.options || []).map((option, optionIdx) => (
                                  <div
                                    key={`option-${variantIdx}-${optionIdx}`}
                                    className='space-y-3 rounded-md border border-slate-200 dark:border-slate-700 p-3'>
                                    <FormField
                                      label='Option Name'
                                      value={option.name}
                                      onChange={e => {
                                        const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                        const newVariants = [...currentVariants];
                                        newVariants[variantIdx].options[optionIdx].name = e.target.value;
                                        handleChange('variants', newVariants);
                                      }}
                                      placeholder='Option Name'
                                    />
                                    <FormField
                                      label='SKU'
                                      value={option.sku}
                                      onChange={e => {
                                        const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                        const newVariants = [...currentVariants];
                                        newVariants[variantIdx].options[optionIdx].sku = e.target.value;
                                        handleChange('variants', newVariants);
                                      }}
                                      placeholder='SKU'
                                    />
                                    <FormField
                                      label='Price'
                                      type='number'
                                      value={option.price}
                                      onChange={e => {
                                        const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                        const newVariants = [...currentVariants];
                                        newVariants[variantIdx].options[optionIdx].price = parseFloat(e.target.value) || 0;
                                        handleChange('variants', newVariants);
                                      }}
                                      placeholder='Price'
                                    />
                                    <div className='flex items-end gap-2'>
                                      <FormField
                                        label='Stock'
                                        type='number'
                                        value={option.stock}
                                        onChange={e => {
                                          const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                          const newVariants = [...currentVariants];
                                          newVariants[variantIdx].options[optionIdx].stock = parseInt(e.target.value) || 0;
                                          handleChange('variants', newVariants);
                                        }}
                                        placeholder='Stock'
                                        containerClassName='flex-1'
                                      />
                                      <button
                                        type='button'
                                        onClick={() => {
                                          const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                          const newVariants = [...currentVariants];
                                          newVariants[variantIdx].options.splice(optionIdx, 1);
                                          handleChange('variants', newVariants);
                                        }}
                                        className='text-red-600 hover:text-red-700 mb-1'>
                                        <X className='w-4 h-4' />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <Button
                                  type='button'
                                  onClick={() => {
                                    const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
                                    const newVariants = [...currentVariants];
                                    newVariants[variantIdx].options.push({
                                      name: '',
                                      sku: '',
                                      price: 0,
                                      stock: 0,
                                      image: '',
                                    });
                                    handleChange('variants', newVariants);
                                  }}
                                  className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'>
                                  <Plus className='w-4 h-4 mr-2' />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div></div>
                      )}

                      {/* Shipping */}
                      <div className='space-y-4'>
                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Shipping Details</h3>

                        <FormField
                          label='Weight (kg)'
                          type='number'
                          value={formData.weight}
                          onChange={e => handleChange('weight', parseFloat(e.target.value) || 0)}
                          placeholder='0.00'
                        />

                        <FormField
                          label='Dimensions (L × W × H in cm)'
                          value={formData.dimensions}
                          onChange={e => handleChange('dimensions', e.target.value)}
                          placeholder='e.g., 10 × 10 × 10'
                        />

                        <Dropdown
                          labelMain='Shipping Class'
                          options={[
                            { label: 'Free', value: 'Free' },
                            { label: 'Standard', value: 'Standard' },
                            { label: 'Express', value: 'Express' },
                          ]}
                          value={formData.shippingClass}
                          onChange={option => handleChange('shippingClass', option.value)}
                          placeholder='Select shipping class'
                        />

                        <FormField
                          label='Processing Time'
                          value={formData.processingTime}
                          onChange={e => handleChange('processingTime', e.target.value)}
                          placeholder='e.g., 1-2 days'
                        />
                      </div>

                      {/* Additional Settings */}
                      <div className='space-y-4'>
                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Additional Settings</h3>

                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Product Status</p>
                            <p className='text-xs text-muted-foreground'>
                              {formData.status === 'active' ? 'Product is live in the catalog' : 'Product is hidden'}
                            </p>
                          </div>
                          <Switch
                            id='product-status'
                            checked={formData.status === 'active'}
                            onCheckedChange={checked => handleChange('status', checked ? 'active' : 'inactive')}
                          />
                        </div>

                        <Dropdown
                          labelMain='Visibility'
                          options={[
                            { label: 'Public', value: 'Public' },
                            { label: 'Hidden', value: 'Hidden' },
                          ]}
                          value={formData.visibility}
                          onChange={option => handleChange('visibility', option.value)}
                          placeholder='Select visibility'
                        />

                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Featured Product</p>
                            <p className='text-xs text-muted-foreground'>Highlight this product across the store</p>
                          </div>
                          <Switch
                            id='featured'
                            checked={formData.featured}
                            onCheckedChange={checked => handleChange('featured', checked)}
                          />
                        </div>

                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Allow Reviews</p>
                            <p className='text-xs text-muted-foreground'>Let customers review this product</p>
                          </div>
                          <Switch
                            id='reviews'
                            checked={formData.allowReviews}
                            onCheckedChange={checked => handleChange('allowReviews', checked)}
                          />
                        </div>

                        <FormField
                          label='Return Policy (Days)'
                          type='number'
                          value={formData.returnPolicyDays}
                          onChange={e => handleChange('returnPolicyDays', parseInt(e.target.value) || 0)}
                          placeholder='30'
                        />

                        <FormField
                          label='Warranty Period'
                          value={formData.warrantyPeriod}
                          onChange={e => handleChange('warrantyPeriod', e.target.value)}
                          placeholder='e.g., 1 year'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Form Actions */}
              <div className='flex flex-col sm:flex-row gap-3 justify-end pt-4'>
                <Button
                  type='button'
                  onClick={() => router.push('/admin/products')}
                  variant='outline'
                  className='border-slate-200 dark:border-slate-700'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'>
                  {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
