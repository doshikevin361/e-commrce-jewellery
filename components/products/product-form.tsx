'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ArrowLeft, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  product_type: 'Gold' | 'Silver' | 'Platinum' | 'Diamond' | 'Gemstone';
  // Jewelry specific fields
  metalType: 'Gold' | 'Silver' | 'Platinum' | 'Rose Gold' | 'White Gold' | '';
  metalPurity: '14K' | '18K' | '22K' | '24K' | '925 Silver' | '999 Silver' | '950 Platinum' | '';
  metalWeight: number; // in grams
  stoneType: 'Diamond' | 'Ruby' | 'Emerald' | 'Sapphire' | 'Pearl' | 'Amethyst' | 'Topaz' | 'None' | '';
  stoneWeight: number; // in carats
  stoneClarity: 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | 'I3' | '';
  stoneColor: 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | '';
  stoneCut: 'Round' | 'Princess' | 'Emerald' | 'Asscher' | 'Oval' | 'Radiant' | 'Cushion' | 'Marquise' | 'Pear' | 'Heart' | '';
  makingCharges: number; // percentage or fixed amount
  makingChargesType: 'percentage' | 'fixed';
  certification: string; // GIA, IGI, etc.
  occasion: 'Wedding' | 'Engagement' | 'Anniversary' | 'Birthday' | 'Festival' | 'Daily Wear' | 'Party' | '';
  gender: 'Men' | 'Women' | 'Unisex' | '';
  ageGroup: 'Kids' | 'Teens' | 'Adults' | 'All Ages' | '';
  size: string; // ring size, chain length, etc.
  sizeUnit: 'inches' | 'cm' | 'ring_size' | '';
  hallmarked: boolean;
  bis_hallmark: boolean;
  customizable: boolean;
  engraving_available: boolean;
  gift_wrapping: boolean;
  // Live pricing fields
  baseMaterialCost: number; // cost without live pricing
  livePriceEnabled: boolean;
  priceLastUpdated: string;
  // Detailed pricing breakdown
  metalCost: number; // Metal weight × Live rate × Purity
  stoneCost: number; // Cost of stones/gems
  makingChargeAmount: number; // Calculated making charges
  gstAmount: number; // GST amount
  otherCharges: number; // Any other charges (packaging, certification, etc.)
  totalCostPrice: number; // Sum of all costs
  profitMargin: number; // Profit margin percentage
  profitAmount: number; // Calculated profit amount
  free_shipping: boolean;
  allow_return: boolean;
  return_policy: string;
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  focusKeyword: string;
  mainImage: string;
  galleryImages: string[];
  productVideo: string;
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
  taxRate: 3, // GST for jewelry in India
  stock: 0,
  lowStockThreshold: 5,
  allowBackorders: false,
  barcode: '',
  weight: 0,
  dimensions: '',
  shippingClass: 'Standard',
  processingTime: '3-5 days',
  product_type: 'Gold',
  // Jewelry specific defaults
  metalType: '',
  metalPurity: '',
  metalWeight: 0,
  stoneType: '',
  stoneWeight: 0,
  stoneClarity: '',
  stoneColor: '',
  stoneCut: '',
  makingCharges: 15, // 15% default making charges
  makingChargesType: 'percentage',
  certification: '',
  occasion: '',
  gender: '',
  ageGroup: '',
  size: '',
  sizeUnit: '',
  hallmarked: false,
  bis_hallmark: false,
  customizable: false,
  engraving_available: false,
  gift_wrapping: true,
  baseMaterialCost: 0,
  livePriceEnabled: false,
  priceLastUpdated: '',
  // Detailed pricing defaults
  metalCost: 0,
  stoneCost: 0,
  makingChargeAmount: 0,
  gstAmount: 0,
  otherCharges: 0,
  totalCostPrice: 0,
  profitMargin: 20, // 20% default profit margin
  profitAmount: 0,
  free_shipping: false,
  allow_return: true,
  return_policy: '30 days return policy for jewelry items',
  metaTitle: '',
  metaDescription: '',
  urlSlug: '',
  focusKeyword: '',
  mainImage: '',
  galleryImages: [],
  productVideo: '',
  variants: [],
  relatedProducts: [],
  status: 'Draft',
  visibility: 'Public',
  featured: false,
  allowReviews: true,
  returnPolicyDays: 30,
  warrantyPeriod: '1 year',
  vendor: 'Main Store',
};

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Product>(() => {
    if (!product) return INITIAL_PRODUCT;
    return {
      ...INITIAL_PRODUCT,
      ...product,
      tags: product.tags || [],
      galleryImages: product.galleryImages || [],
      variants: product.variants || [],
      relatedProducts: product.relatedProducts || [],
    };
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [livePrices, setLivePrices] = useState<{
    gold: number;
    silver: number;
    platinum: number;
  }>({ gold: 0, silver: 0, platinum: 0 });
  const [priceLoading, setPriceLoading] = useState(false);

  // Fetch categories and vendors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/categories');
        const categoriesData = await categoriesResponse.json();
        const allCategories = Array.isArray(categoriesData) ? categoriesData : Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
        
        // Filter only active categories
        const activeCategories = allCategories.filter((cat: any) => cat.status === 'active');
        
        setCategories(activeCategories);

        // Fetch vendors
        const vendorsResponse = await fetch('/api/admin/vendors');
        const vendorsData = await vendorsResponse.json();
        const allVendors = Array.isArray(vendorsData.vendors) ? vendorsData.vendors : [];
        
        // Filter only approved vendors
        const approvedVendors = allVendors.filter((vendor: any) => vendor.status === 'approved');
        
        setVendors(approvedVendors);
      } catch (error) {
        console.error('[v0] Failed to fetch categories or vendors:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch live metal prices
  const fetchLivePrices = async () => {
    setPriceLoading(true);
    try {
      // Using a mock API for demonstration - replace with actual API
      // Example: MetalAPI.com or Metals.dev
      const response = await fetch('/api/live-prices');
      if (response.ok) {
        const data = await response.json();
        setLivePrices({
          gold: data.gold || 6500, // Default INR per gram
          silver: data.silver || 85, // Default INR per gram
          platinum: data.platinum || 3200, // Default INR per gram
        });
      } else {
        // Fallback prices (INR per gram)
        setLivePrices({
          gold: 6500,
          silver: 85,
          platinum: 3200,
        });
      }
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
      // Fallback prices
      setLivePrices({
        gold: 6500,
        silver: 85,
        platinum: 3200,
      });
    }
    setPriceLoading(false);
  };

  // Calculate detailed price breakdown
  const calculateDetailedPricing = () => {
    if (!formData.livePriceEnabled || !formData.metalWeight) {
      return {
        metalCost: 0,
        makingChargeAmount: 0,
        stoneCost: formData.stoneCost || 0,
        otherCharges: formData.otherCharges || 0,
        subtotal: 0,
        gstAmount: 0,
        totalCostPrice: 0,
        profitAmount: 0,
        sellingPrice: 0
      };
    }
    
    // 1. Calculate Metal Cost (Live Rate × Weight × Purity)
    let pricePerGram = 0;
    switch (formData.metalType.toLowerCase()) {
      case 'gold':
        pricePerGram = livePrices.gold;
        // Adjust for purity
        if (formData.metalPurity === '22K') pricePerGram *= 0.916;
        else if (formData.metalPurity === '18K') pricePerGram *= 0.75;
        else if (formData.metalPurity === '14K') pricePerGram *= 0.583;
        break;
      case 'silver':
        pricePerGram = livePrices.silver;
        if (formData.metalPurity === '925 Silver') pricePerGram *= 0.925;
        else if (formData.metalPurity === '999 Silver') pricePerGram *= 0.999;
        break;
      case 'platinum':
        pricePerGram = livePrices.platinum;
        if (formData.metalPurity === '950 Platinum') pricePerGram *= 0.95;
        break;
    }
    
    const metalCost = pricePerGram * formData.metalWeight;
    
    // 2. Calculate Making Charges
    const makingChargeAmount = formData.makingChargesType === 'percentage' 
      ? metalCost * (formData.makingCharges / 100)
      : formData.makingCharges;
    
    // 3. Stone Cost (manual input)
    const stoneCost = formData.stoneCost || 0;
    
    // 4. Other Charges (certification, packaging, etc.)
    const otherCharges = formData.otherCharges || 0;
    
    // 5. Subtotal (before GST)
    const subtotal = metalCost + makingChargeAmount + stoneCost + otherCharges;
    
    // 6. GST Calculation (3% for jewelry in India)
    const gstAmount = subtotal * (formData.taxRate / 100);
    
    // 7. Total Cost Price
    const totalCostPrice = subtotal + gstAmount;
    
    // 8. Profit Calculation
    const profitAmount = totalCostPrice * (formData.profitMargin / 100);
    
    // 9. Final Selling Price
    const sellingPrice = totalCostPrice + profitAmount;
    
    return {
      metalCost: Math.round(metalCost),
      makingChargeAmount: Math.round(makingChargeAmount),
      stoneCost: Math.round(stoneCost),
      otherCharges: Math.round(otherCharges),
      subtotal: Math.round(subtotal),
      gstAmount: Math.round(gstAmount),
      totalCostPrice: Math.round(totalCostPrice),
      profitAmount: Math.round(profitAmount),
      sellingPrice: Math.round(sellingPrice)
    };
  };

  // Update prices when live pricing is enabled
  useEffect(() => {
    if (formData.livePriceEnabled) {
      fetchLivePrices();
      const pricing = calculateDetailedPricing();
      if (pricing.sellingPrice > 0) {
        setFormData(prev => ({
          ...prev,
          metalCost: pricing.metalCost,
          makingChargeAmount: pricing.makingChargeAmount,
          gstAmount: pricing.gstAmount,
          totalCostPrice: pricing.totalCostPrice,
          profitAmount: pricing.profitAmount,
          sellingPrice: pricing.sellingPrice,
          costPrice: pricing.totalCostPrice,
          regularPrice: pricing.sellingPrice + (pricing.sellingPrice * 0.1), // 10% higher than selling price
          priceLastUpdated: new Date().toISOString(),
        }));
      }
    }
  }, [formData.livePriceEnabled, formData.metalType, formData.metalPurity, formData.metalWeight, formData.makingCharges, formData.makingChargesType, formData.stoneCost, formData.otherCharges, formData.profitMargin, formData.taxRate]);

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'jewelry', label: 'Jewelry Details' },
    { id: 'pricing', label: 'Pricing & Tax' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'images', label: 'Images' },
    { id: 'variants', label: 'Variants' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'seo', label: 'SEO' },
    { id: 'settings', label: 'Additional Settings' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const errors: string[] = [];

      if (!formData.product_type?.trim()) errors.push('Product type');
      if (!formData.name?.trim()) errors.push('Product name');
      if (!formData.sku?.trim()) errors.push('SKU');
      if (!formData.shortDescription?.trim()) errors.push('Short description');
      if (!formData.longDescription?.trim()) errors.push('Long description');
      if (formData.regularPrice <= 0) errors.push('Regular price (must be > 0)');
      if (formData.sellingPrice <= 0) errors.push('Selling price (must be > 0)');
      if (formData.sellingPrice > formData.regularPrice) errors.push('Selling price cannot exceed regular price');
      if (formData.stock < 0) errors.push('Stock cannot be negative');
      if (!formData.urlSlug?.trim()) errors.push('URL slug');
      if (!formData.metaTitle?.trim()) errors.push('Meta title');
      if (!formData.metaDescription?.trim()) errors.push('Meta description');
      if (!formData.mainImage?.trim()) errors.push('Main image');
      if (!formData.category?.trim()) errors.push('Category');
      if (!formData.vendor?.trim()) errors.push('Vendor');
      if (formData.allow_return && !formData.return_policy?.trim()) {
        errors.push('Return policy (required when returns are enabled)');
      }

      // Jewelry specific validations
      if (formData.metalType && !formData.metalPurity) {
        errors.push('Metal purity (required when metal type is selected)');
      }
      if (formData.metalType && formData.metalWeight <= 0) {
        errors.push('Metal weight (must be > 0 when metal type is selected)');
      }
      if (formData.stoneType && formData.stoneType !== 'None' && formData.stoneWeight <= 0) {
        errors.push('Stone weight (must be > 0 when stone type is selected)');
      }
      if (formData.stoneType === 'Diamond' && (!formData.stoneClarity || !formData.stoneColor)) {
        errors.push('Diamond clarity and color (required for diamond stones)');
      }
      if (formData.makingCharges < 0) {
        errors.push('Making charges cannot be negative');
      }

      if (errors.length > 0) {
        const errorMessage = `Missing or invalid required fields:\n${errors.map(e => `• ${e}`).join('\n')}`;
        toast({
          title: 'Validation Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const method = product?._id ? 'PUT' : 'POST';
      const url = product?._id ? `/api/admin/products/${product._id}` : '/api/admin/products';

      const dataToSubmit = {
        ...formData,
        ...(product?._id && { _id: product._id }),
      };

      console.log('[v0] Submitting product:', { method, url, productId: product?._id });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      const responseData = await response.json();
      
      console.log('[v0] Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        toast({
          title: 'Success',
          description: product ? 'Product updated successfully' : 'Product created successfully',
          variant: 'default',
        });
        onSave();
      } else {
        console.error('[v0] API error:', responseData);
        toast({
          title: 'Error',
          description: responseData.error || `Failed to save product (${response.status})`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[v0] Submit error:', error);
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag));
  };

  const autoGenerateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    handleChange('urlSlug', slug);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Product Type *
                  </label>
                  <select
                    value={formData.product_type}
                    onChange={(e) => handleChange('product_type', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Select Product Type</option>
                    <option value="Gold">Gold Jewelry</option>
                    <option value="Silver">Silver Jewelry</option>
                    <option value="Platinum">Platinum Jewelry</option>
                    <option value="Diamond">Diamond Jewelry</option>
                    <option value="Gemstone">Gemstone Jewelry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Vendor *
                  </label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => handleChange('vendor', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor: any) => (
                      <option key={vendor._id} value={vendor.storeName || vendor.name}>
                        {vendor.storeName || vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SKU *</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="Auto-generate or enter SKU"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="Product brand"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sub-category
                  </label>
                  <Input
                    value={formData.subcategory}
                    onChange={(e) => handleChange('subcategory', e.target.value)}
                    placeholder="Sub-category"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  placeholder="Brief product description"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Long Description *
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => handleChange('longDescription', e.target.value)}
                  placeholder="Detailed product description"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags (Multi-select)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tagInput"
                    placeholder="Enter tag and press Add"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('tagInput') as HTMLInputElement;
                      if (input) {
                        addTag(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="freeShipping"
                    checked={formData.free_shipping}
                    onChange={(e) => handleChange('free_shipping', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <label htmlFor="freeShipping" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Free Shipping
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowReturn"
                    checked={formData.allow_return}
                    onChange={(e) => {
                      handleChange('allow_return', e.target.checked);
                      if (!e.target.checked) {
                        handleChange('return_policy', '');
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <label htmlFor="allowReturn" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Allow Returns
                  </label>
                </div>

                {formData.allow_return && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Return Policy
                    </label>
                    <textarea
                      value={formData.return_policy}
                      onChange={(e) => handleChange('return_policy', e.target.value)}
                      placeholder="Describe return policy for this product"
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jewelry Details Tab */}
          {activeTab === 'jewelry' && (
            <div className="space-y-6">
              {/* Metal Information */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Metal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Metal Type
                    </label>
                    <select
                      value={formData.metalType}
                      onChange={(e) => handleChange('metalType', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Metal Type</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Rose Gold">Rose Gold</option>
                      <option value="White Gold">White Gold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Metal Purity
                    </label>
                    <select
                      value={formData.metalPurity}
                      onChange={(e) => handleChange('metalPurity', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Purity</option>
                      {formData.metalType === 'Gold' && (
                        <>
                          <option value="24K">24K (99.9% Pure)</option>
                          <option value="22K">22K (91.6% Pure)</option>
                          <option value="18K">18K (75% Pure)</option>
                          <option value="14K">14K (58.3% Pure)</option>
                        </>
                      )}
                      {formData.metalType === 'Silver' && (
                        <>
                          <option value="999 Silver">999 Silver (99.9% Pure)</option>
                          <option value="925 Silver">925 Silver (92.5% Pure)</option>
                        </>
                      )}
                      {formData.metalType === 'Platinum' && (
                        <option value="950 Platinum">950 Platinum (95% Pure)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Metal Weight (grams)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.metalWeight}
                      onChange={(e) => handleChange('metalWeight', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Stone Information */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Stone Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Stone Type
                    </label>
                    <select
                      value={formData.stoneType}
                      onChange={(e) => handleChange('stoneType', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Stone</option>
                      <option value="None">No Stone</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Ruby">Ruby</option>
                      <option value="Emerald">Emerald</option>
                      <option value="Sapphire">Sapphire</option>
                      <option value="Pearl">Pearl</option>
                      <option value="Amethyst">Amethyst</option>
                      <option value="Topaz">Topaz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Stone Weight (carats)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stoneWeight}
                      onChange={(e) => handleChange('stoneWeight', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {formData.stoneType === 'Diamond' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Clarity
                        </label>
                        <select
                          value={formData.stoneClarity}
                          onChange={(e) => handleChange('stoneClarity', e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="">Select Clarity</option>
                          <option value="FL">FL (Flawless)</option>
                          <option value="IF">IF (Internally Flawless)</option>
                          <option value="VVS1">VVS1</option>
                          <option value="VVS2">VVS2</option>
                          <option value="VS1">VS1</option>
                          <option value="VS2">VS2</option>
                          <option value="SI1">SI1</option>
                          <option value="SI2">SI2</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Color Grade
                        </label>
                        <select
                          value={formData.stoneColor}
                          onChange={(e) => handleChange('stoneColor', e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="">Select Color</option>
                          <option value="D">D (Colorless)</option>
                          <option value="E">E (Colorless)</option>
                          <option value="F">F (Colorless)</option>
                          <option value="G">G (Near Colorless)</option>
                          <option value="H">H (Near Colorless)</option>
                          <option value="I">I (Near Colorless)</option>
                          <option value="J">J (Near Colorless)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Making Charges & Certification */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Making Charges & Certification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Making Charges
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.makingCharges}
                        onChange={(e) => handleChange('makingCharges', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="15"
                      />
                      <select
                        value={formData.makingChargesType}
                        onChange={(e) => handleChange('makingChargesType', e.target.value)}
                        className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">₹</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Certification
                    </label>
                    <input
                      type="text"
                      value={formData.certification}
                      onChange={(e) => handleChange('certification', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="GIA, IGI, BIS, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hallmarked}
                        onChange={(e) => handleChange('hallmarked', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Hallmarked</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.bis_hallmark}
                        onChange={(e) => handleChange('bis_hallmark', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">BIS Hallmark</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Occasion
                    </label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => handleChange('occasion', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Occasion</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Festival">Festival</option>
                      <option value="Daily Wear">Daily Wear</option>
                      <option value="Party">Party</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Size
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => handleChange('size', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="Size"
                      />
                      <select
                        value={formData.sizeUnit}
                        onChange={(e) => handleChange('sizeUnit', e.target.value)}
                        className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Unit</option>
                        <option value="ring_size">Ring Size</option>
                        <option value="inches">Inches</option>
                        <option value="cm">CM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Age Group
                    </label>
                    <select
                      value={formData.ageGroup}
                      onChange={(e) => handleChange('ageGroup', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Age Group</option>
                      <option value="Kids">Kids</option>
                      <option value="Teens">Teens</option>
                      <option value="Adults">Adults</option>
                      <option value="All Ages">All Ages</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Additional Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.customizable}
                      onChange={(e) => handleChange('customizable', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Customizable</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.engraving_available}
                      onChange={(e) => handleChange('engraving_available', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Engraving Available</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.gift_wrapping}
                      onChange={(e) => handleChange('gift_wrapping', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Gift Wrapping</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.livePriceEnabled}
                      onChange={(e) => handleChange('livePriceEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Live Pricing</span>
                  </label>
                </div>
                
                {formData.livePriceEnabled && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Live Metal Prices (₹/gram)</span>
                      <button
                        type="button"
                        onClick={fetchLivePrices}
                        disabled={priceLoading}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {priceLoading ? 'Updating...' : 'Refresh Prices'}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>Gold: ₹{livePrices.gold}</div>
                      <div>Silver: ₹{livePrices.silver}</div>
                      <div>Platinum: ₹{livePrices.platinum}</div>
                    </div>
                    {formData.metalWeight > 0 && (
                      <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                        <div>Metal Cost: ₹{calculateDetailedPricing().metalCost}</div>
                        <div>Making Charges: ₹{calculateDetailedPricing().makingChargeAmount}</div>
                        <div className="font-semibold">Total Selling Price: ₹{calculateDetailedPricing().sellingPrice}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing & Tax Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Live Pricing Breakdown */}
              {formData.livePriceEnabled && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Live Price Breakdown</h3>
                  {(() => {
                    const pricing = calculateDetailedPricing();
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Metal Cost:</span>
                            <span className="font-semibold">₹{pricing.metalCost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Making Charges:</span>
                            <span className="font-semibold">₹{pricing.makingChargeAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stone Cost:</span>
                            <span className="font-semibold">₹{pricing.stoneCost}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Other Charges:</span>
                            <span className="font-semibold">₹{pricing.otherCharges}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST ({formData.taxRate}%):</span>
                            <span className="font-semibold">₹{pricing.gstAmount}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span>Total Cost:</span>
                            <span className="font-bold">₹{pricing.totalCostPrice}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Profit ({formData.profitMargin}%):</span>
                            <span className="font-semibold">₹{pricing.profitAmount}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="text-lg">Selling Price:</span>
                            <span className="font-bold text-lg text-green-600">₹{pricing.sellingPrice}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Additional Cost Fields */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Additional Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Stone Cost (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stoneCost}
                      onChange={(e) => handleChange('stoneCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-slate-500 mt-1">Cost of diamonds/gemstones</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Other Charges (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.otherCharges}
                      onChange={(e) => handleChange('otherCharges', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-slate-500 mt-1">Certification, packaging, etc.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.profitMargin}
                      onChange={(e) => handleChange('profitMargin', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="20"
                    />
                    <p className="text-xs text-slate-500 mt-1">Profit margin percentage</p>
                  </div>
                </div>
              </div>

              {/* Manual Pricing Fields */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {formData.livePriceEnabled ? 'Manual Override (Optional)' : 'Manual Pricing'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Regular Price (MRP) *
                  </label>
                  <Input
                    type="number"
                    value={formData.regularPrice}
                    onChange={(e) => handleChange('regularPrice', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Selling Price *
                  </label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cost Price (optional)
                  </label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tax/GST Rate * (%)
                </label>
                <select
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Discount: <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.regularPrice > 0
                      ? (((formData.regularPrice - formData.sellingPrice) / formData.regularPrice) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stock Status *
                </label>
                <select
                  value={formData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  onChange={(e) => handleChange('stock', e.target.value === 'In Stock' ? formData.stock || 1 : 0)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stock Quantity *
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', parseInt(e.target.value))}
                  placeholder="0"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Low Stock Threshold (alert)
                </label>
                <Input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                  placeholder="10"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="backorders"
                  checked={formData.allowBackorders}
                  onChange={(e) => handleChange('allowBackorders', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <label htmlFor="backorders" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Allow Backorders
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Barcode/UPC (optional)
                </label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="Enter barcode or UPC"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Main Image * (Drag & drop)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleChange('mainImage', event.target?.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="mainImage"
                  />
                  <label htmlFor="mainImage" className="cursor-pointer">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Recommended: 800×800px, JPG/PNG</p>
                  </label>
                  {formData.mainImage && (
                    <div className="mt-4">
                      <img src={formData.mainImage || "/placeholder.svg"} alt="Main" className="h-32 mx-auto rounded" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Gallery Images (Multiple upload)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newImages: string[] = [];
                      Array.from(e.target.files).forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          newImages.push(event.target?.result as string);
                          if (newImages.length === e.target.files?.length) {
                            handleChange('galleryImages', [...formData.galleryImages, ...newImages]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {(formData.galleryImages || []).map((img, idx) => (
                    <div key={`gallery-${idx}`} className="relative">
                      <img src={img || "/placeholder.svg"} alt={`Gallery ${idx}`} className="h-24 w-full object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => handleChange('galleryImages', (formData.galleryImages || []).filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Video URL (optional)
                </label>
                <Input
                  value={formData.productVideo}
                  onChange={(e) => handleChange('productVideo', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add product variants like different sizes or colors
              </p>
              <Button
                type="button"
                onClick={() => {
                  const newVariant = {
                    id: Date.now().toString(),
                    type: 'Color',
                    options: [],
                  };
                  handleChange('variants', [...formData.variants, newVariant]);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant Type
              </Button>

              {(formData.variants || []).map((variant, variantIdx) => (
                <div key={variant.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={variant.type}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[variantIdx].type = e.target.value;
                        handleChange('variants', newVariants);
                      }}
                      placeholder="e.g., Color, Size"
                      className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('variants', formData.variants.filter((_, i) => i !== variantIdx));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add options for the variant */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Options</p>
                    {(variant.options || []).map((option, optionIdx) => (
                      <div key={`option-${variantIdx}-${optionIdx}`} className="grid grid-cols-4 gap-4 items-center">
                        <Input
                          value={option.name}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[variantIdx].options[optionIdx].name = e.target.value;
                            handleChange('variants', newVariants);
                          }}
                          placeholder="Option Name (e.g., Red)"
                          className="col-span-1"
                        />
                        <Input
                          value={option.sku}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[variantIdx].options[optionIdx].sku = e.target.value;
                            handleChange('variants', newVariants);
                          }}
                          placeholder="Option SKU"
                          className="col-span-1"
                        />
                        <Input
                          type="number"
                          value={option.price}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[variantIdx].options[optionIdx].price = parseFloat(e.target.value);
                            handleChange('variants', newVariants);
                          }}
                          placeholder="Price"
                          className="col-span-1"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={option.stock}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[variantIdx].options[optionIdx].stock = parseInt(e.target.value);
                              handleChange('variants', newVariants);
                            }}
                            placeholder="Stock"
                            className="w-16"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newVariants = [...formData.variants];
                              newVariants[variantIdx].options.splice(optionIdx, 1);
                              handleChange('variants', newVariants);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => {
                        const newVariants = [...formData.variants];
                        newVariants[variantIdx].options.push({
                          id: Date.now().toString(),
                          name: '',
                          sku: '',
                          price: 0,
                          stock: 0,
                          image: '',
                        });
                        handleChange('variants', newVariants);
                      }}
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dimensions (L × W × H in cm)
                </label>
                <Input
                  value={formData.dimensions}
                  onChange={(e) => handleChange('dimensions', e.target.value)}
                  placeholder="e.g., 10 × 10 × 10"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Shipping Class
                </label>
                <select
                  value={formData.shippingClass}
                  onChange={(e) => handleChange('shippingClass', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option>Free</option>
                  <option>Standard</option>
                  <option>Express</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Processing Time
                </label>
                <Input
                  value={formData.processingTime}
                  onChange={(e) => handleChange('processingTime', e.target.value)}
                  placeholder="e.g., 1-2 days"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  URL Slug * (auto from name)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.urlSlug}
                    onChange={(e) => handleChange('urlSlug', e.target.value)}
                    placeholder="product-name"
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    required
                  />
                  <Button
                    type="button"
                    onClick={autoGenerateSlug}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                  >
                    Auto
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Focus Keyword
                </label>
                <Input
                  value={formData.focusKeyword}
                  onChange={(e) => handleChange('focusKeyword', e.target.value)}
                  placeholder="Main keyword to optimize for"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meta Title * <span className="text-slate-500">{formData.metaTitle.length}/60</span>
                </label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value.slice(0, 60))}
                  placeholder="SEO title"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  maxLength={60}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meta Description * <span className="text-slate-500">{formData.metaDescription.length}/160</span>
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value.slice(0, 160))}
                  placeholder="SEO description"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  maxLength={160}
                  rows={3}
                  required
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Google Preview Snippet</p>
                <div className="text-sm">
                  <p className="text-blue-600 dark:text-blue-400 truncate">{formData.urlSlug}</p>
                  <p className="font-medium text-slate-900 dark:text-white truncate">{formData.metaTitle || 'Your page title'}</p>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{formData.metaDescription || 'Your description will appear here'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option>Public</option>
                  <option>Hidden</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <label htmlFor="featured" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Featured Product
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reviews"
                  checked={formData.allowReviews}
                  onChange={(e) => handleChange('allowReviews', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                />
                <label htmlFor="reviews" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Allow Reviews
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Return Policy (Days)
                </label>
                <Input
                  type="number"
                  value={formData.returnPolicyDays}
                  onChange={(e) => handleChange('returnPolicyDays', parseInt(e.target.value))}
                  placeholder="30"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Warranty Period
                </label>
                <Input
                  value={formData.warrantyPeriod}
                  onChange={(e) => handleChange('warrantyPeriod', e.target.value)}
                  placeholder="e.g., 1 year"
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Related Products (Select)
                </label>
                <Input
                  placeholder="Search and select related products..."
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                  disabled
                />
                <p className="text-xs text-slate-500 mt-1">Feature coming soon</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white">
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
            {product && (
              <Button type="button" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white">
                Preview
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
