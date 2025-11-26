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
  { label: 'Gold Jewelry', value: 'Gold' },
  { label: 'Silver Jewelry', value: 'Silver' },
  { label: 'Platinum Jewelry', value: 'Platinum' },
  { label: 'Diamond Jewelry', value: 'Diamond' },
  { label: 'Gemstone Jewelry', value: 'Gemstone' },
] as const;

const WHOLESALE_PRICE_TYPE_OPTIONS = [
  { label: 'Fixed', value: 'Fixed' },
  { label: 'Percentage', value: 'Percentage' },
] as const;

const JEWELLERY_PURITY_OPTIONS = [
  { label: '14K (58.3% Pure)', value: '14K' },
  { label: '18K (75% Pure)', value: '18K' },
  { label: '22K (91.6% Pure)', value: '22K' },
  { label: '24K (99.9% Pure)', value: '24K' },
  { label: '925 Silver (92.5% Pure)', value: '925 Silver' },
  { label: '999 Silver (99.9% Pure)', value: '999 Silver' },
  { label: '950 Platinum (95% Pure)', value: '950 Platinum' },
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
  sizeChartImage: string;
  productVideo: string;
  wholesalePriceType: WholesalePriceType;
  // Legacy fields - removed to avoid duplicates
  // jewelleryWeight: use metalWeight instead
  // jewelleryPurity: use metalPurity instead  
  // jewelleryMakingCharges: use makingCharges instead
  // jewelleryStoneDetails: use individual stone fields instead
  // jewelleryCertification: use certification instead
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
  trending: boolean;
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
  taxRate: 3, // GST for jewelry in India
  stock: 0,
  lowStockThreshold: 10,
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
  sizeChartImage: '',
  productVideo: '',
  wholesalePriceType: 'Fixed',
  // Legacy fields removed - using new jewelry fields instead
  variants: [],
  relatedProducts: [],
  status: 'active',
  visibility: 'Public',
  featured: false,
  trending: false,
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
  
  const [formData, setFormData] = useState<Product>({
    ...INITIAL_PRODUCT,
    tags: [],
    galleryImages: [],
    variants: [],
    relatedProducts: [],
  });
  const [loading, setLoading] = useState(false);
  const [livePrices, setLivePrices] = useState<{
    gold: number;
    silver: number;
    platinum: number;
  }>({ gold: 0, silver: 0, platinum: 0 });
  const [priceLoading, setPriceLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchingProduct, setFetchingProduct] = useState(!!productId);
  const [vendors, setVendors] = useState<Array<{ _id: string; storeName: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ _id: string; name: string; status?: string }>>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'>('basic');
  const [tabsWithErrors, setTabsWithErrors] = useState<Set<'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'>>(new Set());
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

  // Fetch live metal prices
  const fetchLivePrices = async () => {
    setPriceLoading(true);
    try {
      const response = await fetch('/api/live-prices');
      if (response.ok) {
        const data = await response.json();
        setLivePrices({
          gold: data.gold || 6500,
          silver: data.silver || 85,
          platinum: data.platinum || 3200,
        });
      } else {
        setLivePrices({
          gold: 6500,
          silver: 85,
          platinum: 3200,
        });
      }
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
      setLivePrices({
        gold: 6500,
        silver: 85,
        platinum: 3200,
      });
    }
    setPriceLoading(false);
  };

  // Calculate detailed price breakdown for jewelry
  const calculateDetailedPricing = () => {
    // Basic validation - only calculate if we have metal info
    if (!formData.metalType || !formData.metalWeight || formData.metalWeight <= 0) {
      return {
        metalCost: 0,
        makingChargeAmount: 0,
        stoneCost: formData.stoneCost || 0,
        otherCharges: formData.otherCharges || 0,
        subtotal: 0,
        gstAmount: 0,
        totalCostPrice: 0,
        profitAmount: 0,
        sellingPrice: 0,
        mrp: 0
      };
    }
    
    // Get base metal price per gram
    let basePricePerGram = 0;
    switch (formData.metalType.toLowerCase()) {
      case 'gold':
      case 'rose gold':
      case 'white gold':
        basePricePerGram = formData.livePriceEnabled ? livePrices.gold : 6500;
        // Apply purity factor
        if (formData.metalPurity === '24K') basePricePerGram *= 1.0;
        else if (formData.metalPurity === '22K') basePricePerGram *= 0.916;
        else if (formData.metalPurity === '18K') basePricePerGram *= 0.75;
        else if (formData.metalPurity === '14K') basePricePerGram *= 0.583;
        break;
      case 'silver':
        basePricePerGram = formData.livePriceEnabled ? livePrices.silver : 85;
        if (formData.metalPurity === '999 Silver') basePricePerGram *= 0.999;
        else if (formData.metalPurity === '925 Silver') basePricePerGram *= 0.925;
        break;
      case 'platinum':
        basePricePerGram = formData.livePriceEnabled ? livePrices.platinum : 3200;
        if (formData.metalPurity === '950 Platinum') basePricePerGram *= 0.95;
        break;
    }
    
    // 1. Metal Cost = Weight × Price per gram
    const metalCost = basePricePerGram * formData.metalWeight;
    
    // 2. Making Charges
    const makingChargeAmount = formData.makingChargesType === 'percentage' 
      ? metalCost * (formData.makingCharges / 100)
      : formData.makingCharges;
    
    // 3. Stone Cost (manual input for diamonds/gemstones)
    const stoneCost = formData.stoneCost || 0;
    
    // 4. Other Charges (certification, packaging, etc.)
    const otherCharges = formData.otherCharges || 0;
    
    // 5. Subtotal (before GST) - This is the base cost
    const subtotal = metalCost + makingChargeAmount + stoneCost + otherCharges;
    
    // 6. GST Calculation (3% for jewelry in India)
    const gstAmount = subtotal * (formData.taxRate / 100);
    
    // 7. Total Cost Price (what it costs us)
    const totalCostPrice = subtotal + gstAmount;
    
    // 8. Profit Calculation
    const profitAmount = totalCostPrice * (formData.profitMargin / 100);
    
    // 9. Selling Price (Cost + Profit) - This is what customer pays
    const sellingPrice = totalCostPrice + profitAmount;
    
    // 10. MRP (Maximum Retail Price) - Usually 10-15% higher than selling price
    const mrp = sellingPrice * 1.12; // 12% higher than selling price
    
    return {
      metalCost: Math.round(metalCost),
      makingChargeAmount: Math.round(makingChargeAmount),
      stoneCost: Math.round(stoneCost),
      otherCharges: Math.round(otherCharges),
      subtotal: Math.round(subtotal),
      gstAmount: Math.round(gstAmount),
      totalCostPrice: Math.round(totalCostPrice),
      profitAmount: Math.round(profitAmount),
      sellingPrice: Math.round(sellingPrice),
      mrp: Math.round(mrp)
    };
  };

  // Update prices when jewelry details change
  useEffect(() => {
    // Only auto-calculate if we have metal info
    if (formData.metalType && formData.metalWeight > 0) {
      if (formData.livePriceEnabled) {
        fetchLivePrices();
      }
      
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
          costPrice: pricing.totalCostPrice, // Cost price = Total cost (including GST)
          regularPrice: pricing.mrp, // MRP = Regular price
          priceLastUpdated: new Date().toISOString(),
        }));
      }
    }
  }, [formData.metalType, formData.metalPurity, formData.metalWeight, formData.makingCharges, formData.makingChargesType, formData.stoneCost, formData.otherCharges, formData.profitMargin, formData.taxRate, formData.livePriceEnabled]);

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
    // Legacy fields removed - mapped to new jewelry fields
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

    // Basic required fields - matches backend validation
    if (!formData.product_type?.trim()) newErrors.product_type = 'Product type is required';
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.shortDescription?.trim()) newErrors.shortDescription = 'Short description is required';
    if (!getPlainTextFromHtml(formData.longDescription)) newErrors.longDescription = 'Long description is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    
    // Pricing validation - only if live pricing is disabled
    if (!formData.livePriceEnabled) {
      if (formData.regularPrice <= 0) newErrors.regularPrice = 'Regular price must be greater than 0';
      if (formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
      if (formData.costPrice <= 0) newErrors.costPrice = 'Cost price must be greater than 0';
    }
    
    // Jewelry validation using new fields - matches backend validation exactly
    if (formData.product_type && ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'].includes(formData.product_type)) {
      if (formData.metalWeight <= 0) newErrors.metalWeight = 'Metal weight (grams) is required and must be greater than 0';
      if (!formData.metalPurity?.trim()) newErrors.metalPurity = 'Metal purity is required for jewelry products';
      if (formData.makingCharges <= 0) newErrors.makingCharges = 'Making charges are required and must be greater than 0';
    }
    
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.urlSlug?.trim()) newErrors.urlSlug = 'URL slug is required';
    if (!formData.metaTitle?.trim()) newErrors.metaTitle = 'Meta title is required';
    if (!formData.metaDescription?.trim()) newErrors.metaDescription = 'Meta description is required';
    if (!formData.mainImage?.trim()) newErrors.mainImage = 'Main image is required';
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
    { id: 'jewelry', label: 'Jewelry Details', icon: Settings },
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

                        <FormField
                          label="Product Type"
                          required={true}
                        >
                          <select
                            value={formData.product_type}
                            onChange={(e) => {
                              const selectedType = e.target.value as ProductType;
                              handleChange('product_type', selectedType);
                              // Auto-set metal type based on product type
                              if (selectedType === 'Gold') {
                                setFormData(prev => ({ ...prev, metalType: 'Gold' }));
                              } else if (selectedType === 'Silver') {
                                setFormData(prev => ({ ...prev, metalType: 'Silver' }));
                              } else if (selectedType === 'Platinum') {
                                setFormData(prev => ({ ...prev, metalType: 'Platinum' }));
                              }
                            }}
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
                        </FormField>

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

                  {/* Jewelry Details Tab */}
                  {activeTab === 'jewelry' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Jewelry Details</h3>
                      
                      {/* Metal Information */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Metal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="Metal Variant"
                            error={errors.metalType}
                            required={false}
                          >
                            <select
                              value={formData.metalType}
                              onChange={(e) => setFormData(prev => ({ ...prev, metalType: e.target.value as any }))}
                              className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                              <option value="">Auto-selected from Product Type</option>
                              {formData.product_type === 'Gold' && (
                                <>
                                  <option value="Gold">Yellow Gold</option>
                                  <option value="Rose Gold">Rose Gold</option>
                                  <option value="White Gold">White Gold</option>
                                </>
                              )}
                              {formData.product_type === 'Silver' && (
                                <option value="Silver">Silver</option>
                              )}
                              {formData.product_type === 'Platinum' && (
                                <option value="Platinum">Platinum</option>
                              )}
                              {(formData.product_type === 'Diamond' || formData.product_type === 'Gemstone') && (
                                <>
                                  <option value="Gold">Yellow Gold</option>
                                  <option value="Rose Gold">Rose Gold</option>
                                  <option value="White Gold">White Gold</option>
                                  <option value="Silver">Silver</option>
                                  <option value="Platinum">Platinum</option>
                                </>
                              )}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                              {formData.product_type ? `Based on ${formData.product_type} jewelry selection` : 'Select Product Type first'}
                            </p>
                          </FormField>
                          
                          <FormField
                            label="Metal Purity"
                            error={errors.metalPurity}
                            required={false}
                          >
                            <select
                              value={formData.metalPurity}
                              onChange={(e) => setFormData(prev => ({ ...prev, metalPurity: e.target.value as any }))}
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
                          </FormField>
                          
                          <FormField
                            label="Metal Weight (grams)"
                            error={errors.metalWeight}
                            required={false}
                          >
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.metalWeight}
                              onChange={(e) => setFormData(prev => ({ ...prev, metalWeight: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                            />
                          </FormField>
                        </div>
                      </div>

                      {/* Stone Information */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Stone Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <FormField
                            label="Stone Type"
                            error={errors.stoneType}
                            required={false}
                          >
                            <select
                              value={formData.stoneType}
                              onChange={(e) => setFormData(prev => ({ ...prev, stoneType: e.target.value as any }))}
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
                          </FormField>
                          
                          <FormField
                            label="Stone Weight (carats)"
                            error={errors.stoneWeight}
                            required={false}
                          >
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.stoneWeight}
                              onChange={(e) => setFormData(prev => ({ ...prev, stoneWeight: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                            />
                          </FormField>
                          
                          {formData.stoneType === 'Diamond' && (
                            <>
                              <FormField
                                label="Clarity"
                                error={errors.stoneClarity}
                                required={false}
                              >
                                <select
                                  value={formData.stoneClarity}
                                  onChange={(e) => setFormData(prev => ({ ...prev, stoneClarity: e.target.value as any }))}
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
                              </FormField>
                              
                              <FormField
                                label="Color Grade"
                                error={errors.stoneColor}
                                required={false}
                              >
                                <select
                                  value={formData.stoneColor}
                                  onChange={(e) => setFormData(prev => ({ ...prev, stoneColor: e.target.value as any }))}
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
                              </FormField>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Making Charges & Certification */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Making Charges & Certification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="Making Charges"
                            error={errors.makingCharges}
                            required={false}
                          >
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={formData.makingCharges}
                                onChange={(e) => setFormData(prev => ({ ...prev, makingCharges: parseFloat(e.target.value) || 0 }))}
                                placeholder="15"
                                className="flex-1"
                              />
                              <select
                                value={formData.makingChargesType}
                                onChange={(e) => setFormData(prev => ({ ...prev, makingChargesType: e.target.value as any }))}
                                className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              >
                                <option value="percentage">%</option>
                                <option value="fixed">₹</option>
                              </select>
                            </div>
                          </FormField>
                          
                          <FormField
                            label="Certification"
                            error={errors.certification}
                            required={false}
                          >
                            <Input
                              type="text"
                              value={formData.certification}
                              onChange={(e) => setFormData(prev => ({ ...prev, certification: e.target.value }))}
                              placeholder="GIA, IGI, BIS, etc."
                            />
                          </FormField>
                          
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.hallmarked}
                                onChange={(e) => setFormData(prev => ({ ...prev, hallmarked: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">Hallmarked</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.bis_hallmark}
                                onChange={(e) => setFormData(prev => ({ ...prev, bis_hallmark: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">BIS Hallmark</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Product Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <FormField
                            label="Occasion"
                            required={false}
                          >
                            <select
                              value={formData.occasion}
                              onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value as any }))}
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
                          </FormField>
                          
                          <FormField
                            label="Gender"
                            required={false}
                          >
                            <select
                              value={formData.gender}
                              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                              className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                              <option value="">Select Gender</option>
                              <option value="Men">Men</option>
                              <option value="Women">Women</option>
                              <option value="Unisex">Unisex</option>
                            </select>
                          </FormField>
                          
                          <FormField
                            label="Age Group"
                            required={false}
                          >
                            <select
                              value={formData.ageGroup}
                              onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value as any }))}
                              className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                              <option value="">Select Age Group</option>
                              <option value="Kids">Kids</option>
                              <option value="Teens">Teens</option>
                              <option value="Adults">Adults</option>
                              <option value="All Ages">All Ages</option>
                            </select>
                          </FormField>
                          
                          <FormField
                            label="Size"
                            required={false}
                          >
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={formData.size}
                                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                                placeholder="Size"
                                className="flex-1"
                              />
                              <select
                                value={formData.sizeUnit}
                                onChange={(e) => setFormData(prev => ({ ...prev, sizeUnit: e.target.value as any }))}
                                className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              >
                                <option value="">Unit</option>
                                <option value="ring_size">Ring Size</option>
                                <option value="inches">Inches</option>
                                <option value="cm">CM</option>
                              </select>
                            </div>
                          </FormField>
                        </div>
                        
                        {/* Additional Features */}
                        <div className="mt-4">
                          <h5 className="text-md font-medium text-slate-900 dark:text-white mb-3">Additional Features</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.customizable}
                                onChange={(e) => setFormData(prev => ({ ...prev, customizable: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">Customizable</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.engraving_available}
                                onChange={(e) => setFormData(prev => ({ ...prev, engraving_available: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">Engraving Available</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.gift_wrapping}
                                onChange={(e) => setFormData(prev => ({ ...prev, gift_wrapping: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">Gift Wrapping</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.livePriceEnabled}
                                onChange={(e) => setFormData(prev => ({ ...prev, livePriceEnabled: e.target.checked }))}
                                className="mr-2"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">Live Pricing</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing & Tax */}
                  {activeTab === 'pricing' && (
                    <div className='space-y-6'>
                      <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Pricing & Tax</h3>
                      
                      {/* Live Pricing Section */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Live Pricing System</h4>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.livePriceEnabled}
                              onChange={(e) => setFormData(prev => ({ ...prev, livePriceEnabled: e.target.checked }))}
                              className="mr-2"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Enable Live Pricing</span>
                          </label>
                        </div>
                        
                        {formData.livePriceEnabled && (
                          <>
                            {/* Live Metal Rates */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
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
                            </div>
                            
                            {/* Price Breakdown */}
                            {formData.metalType && formData.metalWeight > 0 && (
                              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <h5 className="text-md font-semibold text-green-900 dark:text-green-100 mb-3">
                                  Jewelry Price Calculation
                                  <span className="text-xs font-normal ml-2">
                                    ({formData.metalType} {formData.metalPurity} - {formData.metalWeight}g)
                                  </span>
                                </h5>
                                {(() => {
                                  const pricing = calculateDetailedPricing();
                                  return (
                                    <div className="space-y-4">
                                      {/* Cost Breakdown */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                        <div className="space-y-2">
                                          <h6 className="font-medium text-green-800 dark:text-green-200">Material Costs</h6>
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
                                          <div className="flex justify-between">
                                            <span>Other Charges:</span>
                                            <span className="font-semibold">₹{pricing.otherCharges}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h6 className="font-medium text-green-800 dark:text-green-200">Tax & Costs</h6>
                                          <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">₹{pricing.subtotal}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>GST ({formData.taxRate}%):</span>
                                            <span className="font-semibold">₹{pricing.gstAmount}</span>
                                          </div>
                                          <div className="flex justify-between border-t pt-1">
                                            <span className="font-medium">Total Cost Price:</span>
                                            <span className="font-bold">₹{pricing.totalCostPrice}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h6 className="font-medium text-green-800 dark:text-green-200">Selling Prices</h6>
                                          <div className="flex justify-between">
                                            <span>Profit ({formData.profitMargin}%):</span>
                                            <span className="font-semibold">₹{pricing.profitAmount}</span>
                                          </div>
                                          <div className="flex justify-between border-t pt-1">
                                            <span className="font-medium">Selling Price:</span>
                                            <span className="font-bold text-green-600">₹{pricing.sellingPrice}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">MRP:</span>
                                            <span className="font-bold text-blue-600">₹{pricing.mrp}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Summary */}
                                      <div className="bg-white dark:bg-slate-700 p-3 rounded border-l-4 border-green-500">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                          Price Formula: Metal Cost + Making Charges + Stone Cost + Other Charges + GST + Profit
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium">Final Customer Price:</span>
                                          <span className="text-lg font-bold text-green-600">₹{pricing.sellingPrice}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                          * GST is included in the price | MRP for display purposes
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Additional Cost Fields - Only show if live pricing is enabled */}
                      {formData.livePriceEnabled && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Additional Costs</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              label="Stone Cost (₹)"
                              type="number"
                              step="0.01"
                              value={formData.stoneCost}
                              onChange={(e) => setFormData(prev => ({ ...prev, stoneCost: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                              helperText="Cost of diamonds/gemstones"
                              error={errors.stoneCost}
                            />
                            
                            <FormField
                              label="Other Charges (₹)"
                              type="number"
                              step="0.01"
                              value={formData.otherCharges}
                              onChange={(e) => setFormData(prev => ({ ...prev, otherCharges: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                              helperText="Certification, packaging, etc."
                              error={errors.otherCharges}
                            />
                            
                            <FormField
                              label="Profit Margin (%)"
                              type="number"
                              step="0.1"
                              value={formData.profitMargin}
                              onChange={(e) => setFormData(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))}
                              placeholder="20"
                              helperText="Profit margin percentage"
                              error={errors.profitMargin}
                            />
                          </div>
                        </div>
                      )}
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

                        {/* Weight field moved to Jewelry Details tab as Metal Weight */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> Weight is now configured as "Metal Weight" in the "Jewelry Details" tab.
                          </p>
                        </div>

                          <Dropdown
                            labelMain='Purity'
                            options={JEWELLERY_PURITY_OPTIONS}
                            value={formData.jewelleryPurity}
                            onChange={option => handleChange('jewelleryPurity', option.value as JewelleryPurity)}
                            placeholder='Select purity'
                            error={isFieldInActiveTab('jewelleryPurity') ? errors.jewelleryPurity : undefined}
                          />

                          {/* Making Charges and Stone Details moved to Jewelry Details tab */}
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Note:</strong> Making charges and stone details are now configured in the "Jewelry Details" tab for better organization.
                            </p>
                          </div>

                          {/* Certification moved to Jewelry Details tab */}
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
                            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Trending Product</p>
                            <p className='text-xs text-muted-foreground'>Show this product in trending section</p>
                          </div>
                          <Switch
                            id='trending'
                            checked={formData.trending}
                            onCheckedChange={checked => handleChange('trending', checked)}
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
