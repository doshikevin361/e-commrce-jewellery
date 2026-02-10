'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Package, Upload, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormField from '../formField/formField';
import Dropdown from '../customDropdown/customDropdown';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

// Product Type Options
const PRODUCT_TYPE_OPTIONS = [
  { label: 'Gold', value: 'Gold' },
  { label: 'Silver', value: 'Silver' },
  { label: 'Diamonds', value: 'Diamonds' },
  { label: 'Platinum', value: 'Platinum' },
  { label: 'Gemstone', value: 'Gemstone' },
  { label: 'Imitation', value: 'Imitation' },
] as const;

// Category Options
const CATEGORY_OPTIONS = [
  { label: 'Earring', value: 'Earring' },
  { label: 'Bracelet', value: 'Bracelet' },
  { label: 'Necklace', value: 'Necklace' },
  { label: 'Ring', value: 'Ring' },
  { label: 'Chain', value: 'Chain' },
  { label: 'Pendant', value: 'Pendant' },
  { label: 'Bangle', value: 'Bangle' },
  { label: 'Mangalsutra', value: 'Mangalsutra' },
  { label: 'Nose Pin', value: 'Nose Pin' },
  { label: 'Anklet', value: 'Anklet' },
] as const;

// Design Type: loaded from /api/admin/design-types (design_types table), no static list

// Gold Purity/Karat Options
const GOLD_PURITY_OPTIONS = [
  { label: '24 kt = 100%', value: '24kt' },
  { label: '22 kt = 92%', value: '22kt' },
  { label: '20 kt = 84%', value: '20kt' },
  { label: '18 kt = 75%', value: '18kt' },
  { label: '14 kt = 58.3%', value: '14kt' },
] as const;

// Silver Purity Options
const SILVER_PURITY_OPTIONS = [
  { label: '24 kt = 100% Pure Silver', value: '24kt' },
  { label: '22 kt = 92.5%', value: '22kt' },
  { label: '80%', value: '80%' },
] as const;

// Metal Colour Options
const METAL_COLOUR_OPTIONS = [
  { label: 'Rose Gold', value: 'Rose Gold' },
  { label: 'Yellow Gold', value: 'Yellow Gold' },
  { label: 'White Gold', value: 'White Gold' },
] as const;

// Gender Options
const GENDER_OPTIONS = [
  { label: 'Man', value: 'Man' },
  { label: 'Women', value: 'Women' },
  { label: 'Unisex', value: 'Unisex' },
] as const;

// Diamonds Type Options (fallback)
const DEFAULT_DIAMONDS_TYPE_OPTIONS = [
  { label: 'Natural Diamonds', value: 'Natural Diamonds' },
  { label: 'Lab Grown Diamonds', value: 'Lab Grown Diamonds' },
] as const;

// Clarity Options
const CLARITY_OPTIONS = [
  { label: 'FL', value: 'FL' },
  { label: 'IF', value: 'IF' },
  { label: 'VVS1', value: 'VVS1' },
  { label: 'VVS2', value: 'VVS2' },
  { label: 'VS1', value: 'VS1' },
  { label: 'VS2', value: 'VS2' },
  { label: 'SI1', value: 'SI1' },
  { label: 'SI2', value: 'SI2' },
  { label: 'I1', value: 'I1' },
  { label: 'I2', value: 'I2' },
  { label: 'I3', value: 'I3' },
] as const;

// Diamonds Colour Options
const DIAMONDS_COLOUR_OPTIONS = [
  { label: 'D', value: 'D' },
  { label: 'EF', value: 'EF' },
  { label: 'GH', value: 'GH' },
  { label: 'IJ', value: 'IJ' },
  { label: 'FG', value: 'FG' },
] as const;

// Diamonds Shape Options
const DIAMONDS_SHAPE_OPTIONS = [
  { label: 'Round', value: 'Round' },
  { label: 'Oval', value: 'Oval' },
  { label: 'Emerald', value: 'Emerald' },
  { label: 'Princess', value: 'Princess' },
  { label: 'Radiant', value: 'Radiant' },
  { label: 'Radiant Square', value: 'Radiant Square' },
  { label: 'Cushion', value: 'Cushion' },
  { label: 'Cushion Square', value: 'Cushion Square' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Marquise', value: 'Marquise' },
  { label: 'Asscher', value: 'Asscher' },
  { label: 'Brilliant Emerald', value: 'Brilliant Emerald' },
  { label: 'Heart', value: 'Heart' },
  { label: 'Triangle', value: 'Triangle' },
  { label: 'Trillion Curved', value: 'Trillion Curved' },
  { label: 'Half Moon', value: 'Half Moon' },
  { label: 'Fan', value: 'Fan' },
  { label: 'Calf', value: 'Calf' },
  { label: 'Hexagon', value: 'Hexagon' },
  { label: 'Octagon', value: 'Octagon' },
  { label: 'Seminavette', value: 'Seminavette' },
  { label: 'Emerald Square', value: 'Emerald Square' },
  { label: 'Kite', value: 'Kite' },
  { label: 'Coffin', value: 'Coffin' },
  { label: 'Baguette', value: 'Baguette' },
  { label: 'Passion', value: 'Passion' },
  { label: 'Round Rose', value: 'Round Rose' },
  { label: 'Regulus', value: 'Regulus' },
  { label: 'Harmonia', value: 'Harmonia' },
] as const;

// Certified Labs Options
const CERTIFIED_LABS_OPTIONS = [
  { label: 'SGI', value: 'SGI' },
  { label: 'IGI', value: 'IGI' },
] as const;

const PURITY_MAP: Record<string, number> = {
  '24kt': 1,
  '22kt': 0.92,
  '20kt': 0.84,
  '18kt': 0.75,
  '14kt': 0.583,
};

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(isFinite(value) ? value : 0);

const getOptionLabel = (options: { label: string; value: string }[], value: string | undefined) =>
  options.find(o => o.value === value)?.label || value || '—';

const parsePurityPercent = (purity: string) => {
  if (!purity) return 1;
  const lower = purity.toLowerCase().trim();
  if (PURITY_MAP[lower] !== undefined) return PURITY_MAP[lower];
  const numeric = parseFloat(purity);
  if (isFinite(numeric)) {
    // If user enters a percentage (e.g., 92), treat >24 as percent/100.
    if (numeric > 24) return Math.min(numeric / 100, 1);
    // If user enters karat (e.g., 22), convert to 24k scale.
    if (numeric > 1.5) return Math.min(numeric / 24, 1);
    // If already in 0-1 range, use directly.
    return Math.min(numeric, 1);
  }
  return 1;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const generateSkuValue = (productType?: string) => {
  const prefix = (productType || 'PRD').slice(0, 3).toUpperCase();
  const timePart = Date.now().toString().slice(-6);
  return `${prefix}-${timePart}`;
};

const GST_OPTIONS = [
  { label: '0%', value: '0' },
  { label: '1%', value: '1' },
  { label: '3%', value: '3' },
  { label: '5%', value: '5' },
  { label: '12%', value: '12' },
  { label: '18%', value: '18' },
  { label: '28%', value: '28' },
];

// Gemstone Name Options
const GEMSTONE_NAME_OPTIONS = [
  { label: 'Amethyst (Kathela)', value: 'Amethyst' },
  { label: 'Aquamarine (Beruj)', value: 'Aquamarine' },
  { label: 'Blue Sapphire (Neelam)', value: 'Blue Sapphire' },
  { label: "Cat's Eye (Lehsunia)", value: "Cat's Eye" },
  { label: 'Citrine (Sunela)', value: 'Citrine' },
  { label: 'Coral Red (Moonga)', value: 'Coral Red' },
  { label: 'Diamond (Heera)', value: 'Diamond' },
  { label: 'Emerald (Panna)', value: 'Emerald' },
  { label: 'Hessonite Garnet (Gomed)', value: 'Hessonite Garnet' },
  { label: 'Iolite (Neeli)', value: 'Iolite' },
  { label: 'Jade', value: 'Jade' },
  { label: 'Lapis Lazuli (Lajvart)', value: 'Lapis Lazuli' },
  { label: 'Moonstone', value: 'Moonstone' },
  { label: 'Onyx', value: 'Onyx' },
  { label: 'Pearl (Moti)', value: 'Pearl' },
  { label: 'Peridot', value: 'Peridot' },
  { label: 'Rose Quartz', value: 'Rose Quartz' },
  { label: 'Ruby (Manik)', value: 'Ruby' },
  { label: 'Turquoise (Firoza)', value: 'Turquoise' },
  { label: 'White Sapphire (Safed Pukhraj)', value: 'White Sapphire' },
  { label: 'Yellow Sapphire (Pukhraj)', value: 'Yellow Sapphire' },
] as const;

interface Diamond {
  id: string;
  metalType?: 'Gold' | 'Silver' | 'Platinum'; // For Diamonds product type
  diamondsType: string;
  noOfDiamonds: number;
  diamondWeight: number;
  diamondSize: string;
  settingType: string;
  clarity: string;
  diamondsColour: string;
  diamondsShape: string;
  diamondSetting: string;
  certifiedLabs: string;
  certificateNo: string;
  certificateImages: string[];
  occasion?: string;
  dimension?: string;
  height?: number;
  width?: number;
  length?: number;
  brand?: string;
  collection?: string;
  thickness?: number;
  description?: string;
  specifications?: { key: string; value: string }[];
  pricePerCarat?: number;
  diamondDiscount?: number;
  diamondPrice?: number;
  // Metal fields for Diamonds product type
  metalWeight?: number;
  metalPurity?: string;
  customMetalRate?: number; // Custom metal rate to override live price (like main section)
  makingCharges?: number;
  metalValue?: number;
}

interface ProductFormData {
  // Product Type
  productType: string;

  // Gold Fields
  category: string;
  sku: string;
  designType: string;
  goldPurity: string;
  silverPurity: string;
  metalColour: string;
  goldWeight: number;
  lessDiamondWeight: number;
  lessStoneWeight: number;
  netGoldWeight: number;
  size: string;
  gender: string[]; // Multi-select for gender
  itemsPair: string; // Changed to string for text field
  pincode: string;
  huidHallmarkNo: string;
  hsnCode: string;

  // Diamonds Fields (for single diamond - legacy)
  diamondsType: string;
  noOfDiamonds: number;
  totalNoOfDiamonds: number;
  diamondWeight: number;
  totalDiamondsWeight: number;
  diamondSize: string;
  settingType: string;
  clarity: string;
  diamondsColour: string;
  diamondsShape: string;
  diamondSetting: string;
  certifiedLabs: string;
  certificateNo: string;
  discount: number;

  // Multiple Diamonds
  diamonds: Diamond[];

  // General Fields
  occasion: string;
  dimension: string;
  height: number;
  width: number;
  length: number;
  brand: string;
  collection: string;
  thickness: number;
  description: string;
  shortDescription: string;
  specifications: { key: string; value: string }[];
  images: string[];
  seoTitle: string;
  seoDescription: string;
  seoTags: string;

  // Gemstone Fields
  gemstoneName: string;
  reportNo: string;
  gemstoneCertificateLab: string;
  gemstoneColour: string;
  gemstoneShape: string;
  gemstoneWeight: number;
  gemstonePrice: number;
  diamondsPrice?: number; // Direct price for Diamonds product type when no metals are added
  ratti: number;
  specificGravity: number;
  hardness: number;
  refractiveIndex: number;
  magnification: number;
  remarks: string;
  gemstoneDescription: string;

  // Related Products
  relatedProducts: string[];

  // Images
  mainImage: string;
  certificateImages: string[];
  gemstonePhoto: string;
  gemstoneCertificate: string;

  // Basic Product Info
  name: string;
  urlSlug: string;
  weight: number;
  stock: number;

  // Pricing & charges
  vendorCommissionRate: number; // %
  platformCommissionRate: number; // %
  makingChargePerGram: number; // per gram
  diamondValue: number; // total diamond value in ₹
  shippingCharges: number;
  hallMarkingCharges: number;
  insuranceCharges: number;
  packingCharges: number;
  rtoCharges: number;
  diamondCertCharges: number;
  otherCharges?: number;
  gstRate: number;
  customMetalRate?: number; // Custom metal rate to override configured rates
  settingsData?: any; // Store settings data for commission lookup
}

interface ProductFormPageProps {
  productId?: string;
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [designTypes, setDesignTypes] = useState<{ label: string; value: string }[]>([]);
  const [karats, setKarats] = useState<{ label: string; value: string }[]>([]);
  const [purities, setPurities] = useState<{ label: string; value: string }[]>([]);
  const [metalColors, setMetalColors] = useState<{ label: string; value: string }[]>([]);
  const [diamondTypes, setDiamondTypes] = useState<{ label: string; value: string }[]>([]);
  const [clarities, setClarities] = useState<{ label: string; value: string }[]>([]);
  const [diamondColors, setDiamondColors] = useState<{ label: string; value: string }[]>([]);
  const [diamondShapes, setDiamondShapes] = useState<{ label: string; value: string }[]>([]);
  const [settingTypes, setSettingTypes] = useState<{ label: string; value: string }[]>([]);
  const [certifiedLabs, setCertifiedLabs] = useState<{ label: string; value: string }[]>([]);
  const [gemstoneNames, setGemstoneNames] = useState<{ label: string; value: string }[]>([]);
  const [uploadingDiamondId, setUploadingDiamondId] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<{
    gold: number;
    silver?: number;
    platinum?: number;
    source?: string;
    timestamp?: string;
    error?: string;
  } | null>(null);
  const [isCustomMetalRateOverride, setIsCustomMetalRateOverride] = useState(false);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);
  const [uploadingMainThumbnail, setUploadingMainThumbnail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null); // Store original price when editing

  const isDiamondComplete = (d: Diamond) =>
    !!(
      d.diamondsType &&
      d.diamondWeight > 0 &&
      d.diamondSize &&
      d.clarity &&
      d.diamondsColour &&
      d.diamondsShape &&
      d.certifiedLabs &&
      d.certificateNo
    );

  const createDiamondEntry = (): Diamond => ({
    id: Date.now().toString(),
    diamondsType: '',
    noOfDiamonds: 0,
    diamondWeight: 0,
    diamondSize: '',
    settingType: '',
    clarity: '',
    diamondsColour: '',
    diamondsShape: '',
    diamondSetting: '',
    certifiedLabs: '',
    certificateNo: '',
    certificateImages: [],
    occasion: '',
    dimension: '',
    height: 0,
    width: 0,
    length: 0,
    brand: '',
    collection: '',
    thickness: 0,
    description: '',
    specifications: [{ key: '', value: '' }],
    pricePerCarat: 0,
    diamondDiscount: 0,
    diamondPrice: 0,
  });

  const generateSku = () => {
    updateField('sku', generateSkuValue(formData.productType));
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => {
      const prevSlugFromName = slugify(prev.name || '');
      const shouldUpdateSlug = !prev.urlSlug || prev.urlSlug === prevSlugFromName;
      const nextSlug = shouldUpdateSlug ? slugify(value) : prev.urlSlug;
      return { ...prev, name: value, urlSlug: nextSlug };
    });
  };

  const uploadMainThumbnail = async (file: File | null) => {
    if (!file) return;
    setUploadingMainThumbnail(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setFormData(prev => ({ ...prev, mainImage: data.url }));
          setErrors(prev => ({ ...prev, mainImage: '' }));
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload main thumbnail:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload main thumbnail image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingMainThumbnail(false);
    }
  };

  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/admin/products/search?query=&all=true${productId ? `&excludeId=${productId}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        const products = data.products || [];
        setAllProducts(products);
        setDisplayedProducts(products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSearch = (value: string) => {
    setProductSearchQuery(value);
    
    if (!value.trim()) {
      setDisplayedProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setDisplayedProducts(filtered);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedRelatedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const clearAllRelatedProducts = () => {
    setSelectedRelatedProducts([]);
  };

  const removeMainThumbnail = () => {
    setFormData(prev => ({ ...prev, mainImage: '' }));
  };

  const uploadProductImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingProductImages(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) uploadedUrls.push(data.url);
        } else {
          throw new Error('Upload failed');
        }
      }
      if (uploadedUrls.length) {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
      }
    } catch (error) {
      console.error('Failed to upload product images:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload one or more images.',
        variant: 'destructive',
      });
    } finally {
      setUploadingProductImages(false);
    }
  };

  const removeProductImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: (prev.images || []).filter(img => img !== url) }));
  };

  const uploadGemstonePhoto = async (file: File | null) => {
    if (!file) return;
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setFormData(prev => ({ ...prev, gemstonePhoto: data.url }));
          toast({
            title: 'Success',
            description: 'Gemstone photo uploaded successfully.',
          });
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload gemstone photo:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload gemstone photo.',
        variant: 'destructive',
      });
    }
  };

  const uploadGemstoneCertificate = async (file: File | null) => {
    if (!file) return;
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          setFormData(prev => ({ ...prev, gemstoneCertificate: data.url }));
          toast({
            title: 'Success',
            description: 'Gemstone certificate uploaded successfully.',
          });
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload gemstone certificate:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload gemstone certificate.',
        variant: 'destructive',
      });
    }
  };

  const removeGemstoneCertificate = () => {
    setFormData(prev => ({ ...prev, gemstoneCertificate: '' }));
  };

  const addSpecificationRow = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...(prev.specifications || []), { key: '', value: '' }],
    }));
  };

  const updateSpecificationRow = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => {
      const specs = [...(prev.specifications || [])];
      specs[index] = { ...specs[index], [field]: value };
      return { ...prev, specifications: specs };
    });
  };

  const removeSpecificationRow = (index: number) => {
    setFormData(prev => {
      const specs = [...(prev.specifications || [])];
      specs.splice(index, 1);
      return { ...prev, specifications: specs.length ? specs : [{ key: '', value: '' }] };
    });
  };

  const [formData, setFormData] = useState<ProductFormData>({
    productType: '',
    category: '',
    sku: '',
    hsnCode: '',
    designType: '',
    goldPurity: '',
    silverPurity: '',
    metalColour: '',
    goldWeight: 0,
    lessDiamondWeight: 0,
    lessStoneWeight: 0,
    netGoldWeight: 0,
    size: '',
    gender: [],
    itemsPair: '',
    pincode: '',
    huidHallmarkNo: '',
    diamondsType: '',
    noOfDiamonds: 0,
    totalNoOfDiamonds: 0,
    diamondWeight: 0,
    totalDiamondsWeight: 0,
    diamondSize: '',
    settingType: '',
    clarity: '',
    diamondsColour: '',
    diamondsShape: '',
    diamondSetting: '',
    certifiedLabs: '',
    certificateNo: '',
    discount: 0,
    diamonds: [],
    occasion: '',
    dimension: '',
    height: 0,
    width: 0,
    length: 0,
    brand: '',
    collection: '',
    thickness: 0,
    description: '',
    shortDescription: '',
    specifications: [{ key: '', value: '' }],
    images: [],
    seoTitle: '',
    seoDescription: '',
    seoTags: '',
    gemstoneName: '',
    reportNo: '',
    gemstoneCertificateLab: '',
    gemstoneColour: '',
    gemstoneShape: '',
    gemstoneWeight: 0,
    gemstonePrice: 0,
    ratti: 0,
    specificGravity: 0,
    hardness: 0,
    refractiveIndex: 0,
    magnification: 0,
    remarks: '',
    gemstoneDescription: '',
    mainImage: '',
    certificateImages: [],
    gemstonePhoto: '',
    gemstoneCertificate: '',
    name: '',
    urlSlug: '',
    weight: 0,
    stock: 1,
    vendorCommissionRate: 0,
    platformCommissionRate: 0,
    makingChargePerGram: 500,
    diamondValue: 0,
    shippingCharges: 0,
    hallMarkingCharges: 0,
    insuranceCharges: 0,
    packingCharges: 0,
    rtoCharges: 0,
    diamondCertCharges: 0,
    otherCharges: 0,
    gstRate: 3,
    customMetalRate: undefined,
    relatedProducts: [],
  });

  useEffect(() => {
    // Get user role from localStorage
    const userStr = localStorage.getItem('adminUser');
    let detectedRole = 'admin';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        detectedRole = user.role || 'admin';
        setUserRole(detectedRole);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    fetchCategories();
    fetchDesignTypes();
    fetchKarats();
    fetchPurities();
    fetchMetalColors();
    fetchDiamondTypes();
    fetchClarities();
    fetchDiamondColors();
    fetchDiamondShapes();
    fetchSettingTypes();
    fetchCertifiedLabs();
    fetchGemstoneNames();
    fetchMetalRates();
    fetchAllProducts(); // Fetch all products for related products selection
    
    // Fetch settings to have them available when product type is selected
    // Don't apply commission initially - will be applied when product type is selected
    fetchAdminDefaultCommission(detectedRole, undefined);
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    console.log('[DEBUG] platformCommissionRate changed to:', formData.platformCommissionRate);
  }, [formData.platformCommissionRate]);

  useEffect(() => {
    // Calculate Net Gold Weight
    const netWeight = formData.goldWeight - formData.lessDiamondWeight - formData.lessStoneWeight;
    setFormData(prev => ({ ...prev, netGoldWeight: Math.max(0, netWeight) }));
  }, [formData.goldWeight, formData.lessDiamondWeight, formData.lessStoneWeight]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        const allCategories = Array.isArray(data.categories) ? data.categories : [];
        setCategories(allCategories);

        // Build tree structure and flatten for dropdown
        const categoryMap = new Map<string, any>();
        const rootCategories: any[] = [];

        // First pass: create map
        allCategories.forEach((cat: any) => {
          categoryMap.set(cat._id, {
            ...cat,
            children: [],
          });
        });

        // Second pass: build tree
        categoryMap.forEach(category => {
          if (!category.parentId) {
            rootCategories.push(category);
          } else {
            const parent = categoryMap.get(category.parentId);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(category);
            } else {
              rootCategories.push(category); // Orphaned category
            }
          }
        });

        // Flatten tree for dropdown (include both parent and children)
        const flattenCategories = (cats: any[], prefix = ''): { label: string; value: string }[] => {
          const result: { label: string; value: string }[] = [];
          cats.forEach(cat => {
            const label = prefix ? `${prefix} > ${cat.name}` : cat.name;
            result.push({ label, value: cat._id || cat.name });
            if (cat.children && cat.children.length > 0) {
              result.push(...flattenCategories(cat.children, cat.name));
            }
          });
          return result;
        };

        setCategoryOptions(flattenCategories(rootCategories));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchDesignTypes = async () => {
    try {
      const response = await fetch('/api/admin/design-types');
      if (response.ok) {
        const data = await response.json();
        const options = (data.designTypes || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setDesignTypes(options);
      }
    } catch (error) {
      console.error('Failed to fetch design types:', error);
    }
  };

  const fetchKarats = async () => {
    try {
      const response = await fetch('/api/admin/karats');
      if (response.ok) {
        const data = await response.json();
        const options = (data.karats || []).map((item: any) => ({
          label: item.name,
          value: item.name,
        }));
        setKarats(options);
      }
    } catch (error) {
      console.error('Failed to fetch karats:', error);
    }
  };

  const fetchPurities = async () => {
    try {
      const response = await fetch('/api/admin/purities');
      if (response.ok) {
        const data = await response.json();
        const options = (data.purities || []).map((item: any) => ({
          label: item.name,
          value: item.name,
        }));
        setPurities(options);
      }
    } catch (error) {
      console.error('Failed to fetch purities:', error);
    }
  };

  const fetchMetalColors = async () => {
    try {
      const response = await fetch('/api/admin/metal-colors');
      if (response.ok) {
        const data = await response.json();
        const options = (data.metalColors || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setMetalColors(options);
      }
    } catch (error) {
      console.error('Failed to fetch metal colors:', error);
    }
  };

  const fetchDiamondTypes = async () => {
    try {
      const response = await fetch('/api/admin/diamond-types');
      if (response.ok) {
        const data = await response.json();
        const options = (data.diamondTypes || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setDiamondTypes(options.length ? options : [...DEFAULT_DIAMONDS_TYPE_OPTIONS]);
      } else {
        setDiamondTypes([...DEFAULT_DIAMONDS_TYPE_OPTIONS]);
      }
    } catch (error) {
      console.error('Failed to fetch diamond types:', error);
      setDiamondTypes([...DEFAULT_DIAMONDS_TYPE_OPTIONS]);
    }
  };

  const fetchClarities = async () => {
    try {
      const response = await fetch('/api/admin/clarities');
      if (response.ok) {
        const data = await response.json();
        const options = (data.clarities || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setClarities(options);
      }
    } catch (error) {
      console.error('Failed to fetch clarities:', error);
    }
  };

  const fetchDiamondColors = async () => {
    try {
      const response = await fetch('/api/admin/diamond-colors');
      if (response.ok) {
        const data = await response.json();
        const options = (data.diamondColors || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setDiamondColors(options);
      }
    } catch (error) {
      console.error('Failed to fetch diamond colors:', error);
    }
  };

  const fetchDiamondShapes = async () => {
    try {
      const response = await fetch('/api/admin/diamond-shapes');
      if (response.ok) {
        const data = await response.json();
        const options = (data.diamondShapes || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setDiamondShapes(options);
      }
    } catch (error) {
      console.error('Failed to fetch diamond shapes:', error);
    }
  };

  const fetchSettingTypes = async () => {
    try {
      const response = await fetch('/api/admin/setting-types');
      if (response.ok) {
        const data = await response.json();
        const options = (data.settingTypes || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setSettingTypes(options);
      }
    } catch (error) {
      console.error('Failed to fetch setting types:', error);
    }
  };

  const fetchCertifiedLabs = async () => {
    try {
      const response = await fetch('/api/admin/certified-labs');
      if (response.ok) {
        const data = await response.json();
        const options = (data.certifiedLabs || []).map((item: any) => ({
          label: item.name,
          value: item._id || item.name,
        }));
        setCertifiedLabs(options);
      }
    } catch (error) {
      console.error('Failed to fetch certified labs:', error);
    }
  };

  const fetchGemstoneNames = async () => {
    try {
      const response = await fetch('/api/admin/gemstone-names?status=active');
      if (response.ok) {
        const data = await response.json();
        const options = (data.gemstoneNames || []).map((item: any) => ({
          label: item.name,
          value: item.name,
        }));
        setGemstoneNames(options);
      }
    } catch (error) {
      console.error('Failed to fetch gemstone names:', error);
    }
  };

  const fetchMetalRates = async () => {
    try {
      const response = await fetch('/api/public/metal-prices', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLivePrices(data);
      }
    } catch (error) {
      console.error('Failed to fetch metal rates:', error);
    }
  };

  const fetchAdminDefaultCommission = async (
    currentUserRole?: string,
    productType?: string,
    formSnapshot?: { category?: string; designType?: string; goldPurity?: string; silverPurity?: string },
    optionMaps?: { categoryOptions: { value: string; label: string }[]; designTypes: { value: string; label: string }[] }
  ) => {
    try {
      // Get user role if not provided
      let roleToUse = currentUserRole;
      if (!roleToUse) {
        const userStr = localStorage.getItem('adminUser');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            roleToUse = user.role || 'admin';
          } catch (error) {
            console.error('Failed to parse user data:', error);
            roleToUse = 'admin';
          }
        } else {
          roleToUse = 'admin';
        }
      }

      let vendorCommissionRate = 0; // Fallback default (vendor gets rate from their commission rows)
      let platformCommissionRate = 0; // Fallback default
      let vendorCommissions: any = null;
      let adminCommissions: any = null;

      let adminCommissionRows: Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; platformCommission?: number }> = [];
      let vendorCommissionRows: Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendorCommission: number }> = [];
      try {
        const adminResponse = await fetch('/api/admin/settings');
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          adminCommissions = adminData.productTypeCommissions;
          if (Array.isArray(adminData.commissionRows)) {
            adminCommissionRows = adminData.commissionRows;
            console.log('[DEBUG] Fetched admin commission rows (for platform):', adminCommissionRows.length);
          }
          console.log('[DEBUG] Fetched admin commission settings:', adminCommissions);
        }
      } catch (error) {
        console.error('[DEBUG] Failed to fetch admin commission settings:', error);
      }

      if (roleToUse === 'vendor') {
        try {
          const vendorResponse = await fetch('/api/vendor/commission-settings');
          if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json();
            vendorCommissions = vendorData.commissions;
            vendorCommissionRows = Array.isArray(vendorData.commissionRows) ? vendorData.commissionRows : [];
            console.log('[DEBUG] Fetched vendor commission rows:', vendorCommissionRows.length);
          }
        } catch (error) {
          console.error('[DEBUG] Failed to fetch vendor commission settings:', error);
        }
      }

      const rawCategory = formSnapshot?.category ?? '';
      const rawDesignType = formSnapshot?.designType ?? '';
      const purity = formSnapshot?.goldPurity || formSnapshot?.silverPurity || '';
      // Metal for matching: only when product is Gold/Silver/Platinum (row may have metal set)
      const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
      const categoryName = optionMaps?.categoryOptions?.find((o) => o.value === rawCategory)?.label?.split(' > ').pop()?.trim() || rawCategory;
      const designTypeName = optionMaps?.designTypes?.find((o) => o.value === rawDesignType)?.label?.trim() || rawDesignType;

      // Full combination match: ALL fields (category, designType, metal, purity) must match the row. No partial match.
      const findCommissionFromRows = (
        rows: any[],
        pt: string,
        cat: string,
        des: string,
        met: string,
        pur: string
      ): { platform?: number; vendor?: number } | null => {
        const norm = (s: string) => (s || '').trim().toLowerCase();
        const nPt = norm(pt);
        const nCat = norm(cat);
        const nDes = norm(des);
        const nMet = norm(met);
        const nPur = norm(pur);
        for (const row of rows) {
          if (norm(row.productType) !== nPt) continue;
          const rowCat = norm(row.category);
          const rowDes = norm(row.designType);
          const rowMetal = norm(row.metal);
          const rowPur = norm(row.purityKarat);
          // Every field must match: category, designType, metal, purity (exact combination)
          if (rowCat !== nCat) continue;
          if (rowDes !== nDes) continue;
          if (rowMetal !== nMet) continue;
          if (rowPur !== nPur) continue;
          return {
            platform: typeof row.platformCommission === 'number' ? row.platformCommission : undefined,
            vendor: typeof row.vendorCommission === 'number' ? row.vendorCommission : undefined,
          };
        }
        return null;
      };

      setFormData(prev => ({
        ...prev,
        settingsData: {
          productTypeCommissions: adminCommissions,
          vendorCommissions: vendorCommissions,
          adminCommissionRows,
          vendorCommissionRows,
        },
      }));

      if (productType) {
        let platformCommissionMatched = false;
        let vendorCommissionMatched = false;

        // Platform commission only from combination match (puri combination check) – no product-type-only fallback
        if (adminCommissionRows.length > 0) {
          const fromAdmin = findCommissionFromRows(adminCommissionRows, productType, categoryName, designTypeName, metal, purity);
          platformCommissionMatched = fromAdmin !== null;
          if (fromAdmin !== null && typeof fromAdmin.platform === 'number') {
            platformCommissionRate = fromAdmin.platform;
            console.log('[DEBUG] Platform commission from admin combination:', platformCommissionRate);
          }
        }
        // When no commission rows or no match, platformCommissionRate stays 0

        if (roleToUse === 'vendor' && vendorCommissionRows.length > 0) {
          const fromVendor = findCommissionFromRows(vendorCommissionRows, productType, categoryName, designTypeName, metal, purity);
          vendorCommissionMatched = fromVendor !== null;
          if (fromVendor !== null && typeof fromVendor.vendor === 'number') {
            vendorCommissionRate = fromVendor.vendor;
            console.log('[DEBUG] Vendor commission from vendor combination:', vendorCommissionRate);
          } else if (vendorCommissions) {
            const rate = vendorCommissions[productType as keyof typeof vendorCommissions];
            vendorCommissionRate = typeof rate === 'number' && rate >= 0 ? rate : 0;
            console.log('[DEBUG] Vendor Commission fallback by product type:', vendorCommissionRate);
          }
        } else if (roleToUse === 'vendor' && vendorCommissions) {
          const rate = vendorCommissions[productType as keyof typeof vendorCommissions];
          vendorCommissionRate = typeof rate === 'number' && rate >= 0 ? rate : 0;
          vendorCommissionMatched = true; // no combination rows, show field with product-type fallback
          console.log('[DEBUG] Vendor Commission for', productType, ':', vendorCommissionRate);
        } else if (roleToUse === 'admin') {
          vendorCommissionRate = 0;
          console.log('[DEBUG] Admin adding product: vendor commission 0');
        }

        const updateData = {
          vendorCommissionRate: vendorCommissionRate,
          platformCommissionRate: platformCommissionRate,
        };
        
        console.log('[DEBUG] About to update with:', updateData);

        setFormData(prev => {
          const newData = {
            ...prev,
            ...updateData,
            settingsData: {
              ...prev.settingsData,
              adminCommissionRows,
              vendorCommissionRows,
              platformCommissionMatched: adminCommissionRows.length === 0 ? true : platformCommissionMatched,
              vendorCommissionMatched: roleToUse !== 'vendor' ? true : (vendorCommissionRows.length === 0 ? true : vendorCommissionMatched),
            },
          };
          console.log('[DEBUG] Updated commission rates - Platform:', newData.platformCommissionRate, 'Vendor:', newData.vendorCommissionRate);
          return newData;
        });
      } else {
        console.log('[DEBUG] No product type provided, settings loaded for future use');
        return; // Don't apply commission if no product type specified
      }
    } catch (error) {
      // Silently fail - settings might not be available
      console.log('Could not fetch commission settings:', error);
    }
  };

  const uploadCertificateImages = async (diamondId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingDiamondId(diamondId);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) uploadedUrls.push(data.url);
        } else {
          console.error('Upload failed for file:', file.name);
        }
      }

      if (uploadedUrls.length) {
        setFormData(prev => ({
          ...prev,
          diamonds: prev.diamonds.map(d =>
            d.id === diamondId ? { ...d, certificateImages: [...(d.certificateImages || []), ...uploadedUrls] } : d
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to upload certificate images:', error);
    } finally {
      setUploadingDiamondId(null);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`);
      if (response.ok) {
        const product = await response.json();
        // Fetch current configured metal rates so edit page shows same rate as Pricing Settings
        let configuredRates: { gold?: number; silver?: number; platinum?: number } = {};
        try {
          const metalRes = await fetch('/api/public/metal-prices', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          if (metalRes.ok) configuredRates = await metalRes.json();
        } catch (_) {}
        const pt = (product.product_type || product.productType || '').toString();
        const configuredRate = pt === 'Silver' ? (configuredRates.silver ?? 0) : pt === 'Platinum' ? (configuredRates.platinum ?? 0) : (configuredRates.gold ?? 0);
        const productRate = pt === 'Silver' ? (product.silverRatePerGram ?? product.customMetalRate) : (product.goldRatePerGram ?? product.customMetalRate);
        // Use configured rate in form when product rate matches settings (so "gold price same" in edit)
        const customMetalRate = (['Gold', 'Silver', 'Platinum'].includes(pt) && configuredRate > 0 && productRate === configuredRate)
          ? undefined
          : (product.customMetalRate ?? undefined);
        if (Object.keys(configuredRates).length > 0) setLivePrices(configuredRates as any);
        // Map product data to form data
        setFormData({
          productType: product.product_type || '',
          category: product.category || '',
          sku: product.sku || '',
          designType: product.designType || '',
          goldPurity: product.goldPurity || '',
          silverPurity: product.silverPurity || '',
          metalColour: product.metalColour || '',
          goldWeight: product.goldWeight || 0,
          lessDiamondWeight: product.lessDiamondWeight || 0,
          lessStoneWeight: product.lessStoneWeight || 0,
          netGoldWeight: product.netGoldWeight || 0,
          size: product.size || '',
          gender: Array.isArray(product.gender) ? product.gender : (product.gender ? [product.gender] : []),
          itemsPair: product.itemsPair?.toString() || '',
          pincode: product.pincode || '',
          huidHallmarkNo: product.huidHallmarkNo || '',
          hsnCode: product.hsnCode || product.hsn || '',
          diamondsType: product.diamondsType || '',
          noOfDiamonds: product.noOfDiamonds || 0,
          totalNoOfDiamonds: product.totalNoOfDiamonds || 0,
          diamondWeight: product.diamondWeight || 0,
          totalDiamondsWeight: product.totalDiamondsWeight || 0,
          diamondSize: product.diamondSize || '',
          settingType: product.settingType || '',
          clarity: product.clarity || '',
          diamondsColour: product.diamondsColour || '',
          diamondsShape: product.diamondsShape || '',
          diamondSetting: product.diamondSetting || '',
          certifiedLabs: product.certifiedLabs || '',
          certificateNo: product.certificateNo || '',
          discount: product.discount || product.makingChargesDiscount || 0,
          occasion: product.occasion || '',
          dimension: product.dimension || '',
          height: product.height || 0,
          width: product.width || 0,
          length: product.length || 0,
          brand: product.brand || '',
          collection: product.collection || '',
          thickness: product.thickness || 0,
          description: product.longDescription || product.description || '',
          shortDescription: product.shortDescription || '',
          specifications: product.specifications || [{ key: '', value: '' }],
          images: product.images || [],
          seoTitle: product.seoTitle || '',
          seoDescription: product.seoDescription || '',
          seoTags: product.seoTags || '',
          gemstoneName: product.gemstoneName || '',
          reportNo: product.reportNo || '',
          gemstoneCertificateLab: product.gemstoneCertificateLab || '',
          gemstoneColour: product.gemstoneColour || '',
          gemstoneShape: product.gemstoneShape || '',
          gemstoneWeight: product.gemstoneWeight || 0,
          gemstonePrice: product.gemstonePrice || 0,
          diamondsPrice: product.diamondsPrice || 0,
          ratti: product.ratti || 0,
          specificGravity: product.specificGravity || 0,
          hardness: product.hardness || 0,
          refractiveIndex: product.refractiveIndex || 0,
          magnification: product.magnification || 0,
          remarks: product.remarks || '',
          gemstoneDescription: product.gemstoneDescription || '',
          mainImage: product.mainImage || '',
          certificateImages: product.certificateImages || [],
          gemstonePhoto: product.gemstonePhoto || '',
          gemstoneCertificate: product.gemstoneCertificate || '',
          name: product.name || '',
          urlSlug: product.urlSlug || '',
          weight: product.weight || 0,
          stock: product.stock ?? 1,
          vendorCommissionRate: product.vendorCommissionRate ?? 0,
          platformCommissionRate: product.platformCommissionRate ?? 0,
          makingChargePerGram: product.makingChargePerGram ?? 500,
          diamondValue: product.diamondValue ?? 0,
          shippingCharges: product.shippingCharges ?? 0,
          hallMarkingCharges: product.hallMarkingCharges ?? 0,
          insuranceCharges: product.insuranceCharges ?? 0,
          packingCharges: product.packingCharges ?? 0,
          rtoCharges: product.rtoCharges ?? 0,
          diamondCertCharges: product.diamondCertCharges ?? 0,
          otherCharges: product.otherCharges ?? 0,
          gstRate: product.gstRate ?? 3,
          customMetalRate,
          diamonds: product.diamonds || [],
          relatedProducts: product.relatedProducts || [],
        });
        setIsCustomMetalRateOverride(false);
        
        // Store original price to preserve it when editing
        // Prefer price, then subTotal, then totalAmount
        const savedPrice = product.price || product.subTotal || product.totalAmount || null;
        setOriginalPrice(savedPrice);
        
        // Set selected related products for the UI
        if (product.relatedProducts && Array.isArray(product.relatedProducts)) {
          setSelectedRelatedProducts(product.relatedProducts);
        }

        // After loading product, don't override existing commission - keep what's saved
        // But fetch settings for when user might change product type later
        fetchAdminDefaultCommission(undefined, undefined);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const computedSlug = formData.urlSlug?.trim() || slugify(formData.name || '');
      const computedSku = formData.sku?.trim() || generateSkuValue(formData.productType);
      const selectedPurityValue = formData.silverPurity || formData.goldPurity;
      const isSimpleProductType = formData.productType === 'Gemstone' || formData.productType === 'Imitation';
      const showGoldFields = ['Gold', 'Silver', 'Platinum'].includes(formData.productType);
      const showDiamondFields = formData.productType === 'Diamonds' || showGoldFields;
      const nextErrors: Record<string, string> = {};
      
      // Common validations for all product types
      if (!formData.productType) nextErrors.productType = 'This field is required';
      if (!formData.category) nextErrors.category = 'This field is required';
      if (!formData.name?.trim()) nextErrors.name = 'This field is required';
      if (!computedSlug) nextErrors.urlSlug = 'This field is required';
      if (!computedSku) nextErrors.sku = 'This field is required';
      if (!formData.hsnCode?.trim()) nextErrors.hsnCode = 'This field is required';
      if (!formData.shortDescription?.trim() && !formData.description?.trim()) nextErrors.description = 'Description is required';
      if (!formData.mainImage?.trim()) nextErrors.mainImage = 'This field is required';
      if (!formData.seoTitle?.trim()) nextErrors.seoTitle = 'This field is required';
      if (!formData.seoDescription?.trim()) nextErrors.seoDescription = 'This field is required';
      if (!formData.seoTags?.trim()) nextErrors.seoTags = 'This field is required';
      
      // Validations only for Gold/Silver/Platinum (fields that are shown and required)
      // For Diamonds product type, designType, purity, and weight are optional (metals are optional)
      if (showGoldFields) {
        // Gold/Silver/Platinum - these fields are required
        if (!formData.designType) nextErrors.designType = 'This field is required';
        if (!selectedPurityValue) {
          nextErrors.silverPurity = 'This field is required';
        }
        if (!formData.weight || formData.weight <= 0) {
          nextErrors.weight = 'This field is required';
        }
      } else if (formData.productType === 'Diamonds') {
        // For Diamonds product type, only validate designType (it's shown in the form)
        // Purity and weight are not required since metals are optional
        if (!formData.designType) nextErrors.designType = 'This field is required';
      }
      
      // Validations only for Gemstone/Imitation (fields that are shown)
      if (isSimpleProductType && userRole !== 'vendor') {
        if (!formData.gemstonePrice || formData.gemstonePrice <= 0) {
          nextErrors.gemstonePrice = 'Price is required';
        }
        // Gemstone weight only for Gemstone type (not Imitation)
        if (formData.productType === 'Gemstone' && (!formData.gemstoneWeight || formData.gemstoneWeight <= 0)) {
          nextErrors.gemstoneWeight = 'Gemstone weight is required';
        }
      }

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        setLoading(false);
        return;
      }

      setErrors({});
      setFormData(prev => ({
        ...prev,
        urlSlug: computedSlug,
        sku: computedSku,
      }));

      // API expects these normalized jewellery fields even when we capture per-gram inputs
      const weightInput = formData.weight || formData.goldWeight || 0;
      const goldWeight = ['Gold', 'Platinum'].includes(formData.productType) ? weightInput : 0;
      const silverWeight = formData.productType === 'Silver' ? weightInput : 0;
      const goldRatePerGram = purityMetalRate || metalLiveRate || (formData as any).goldRatePerGram || 0;
      const silverRatePerGram = purityMetalRate || metalLiveRate || (formData as any).silverRatePerGram || 0;
      const makingCharges = Math.max(0, (formData.makingChargePerGram || 0) * (goldWeight || silverWeight));

      // Store current configured rate in customMetalRate if no custom rate provided
      // This prevents price discrepancies when editing product later with different configured rates
      const storedCustomMetalRate = isCustomMetalRateOverride
        ? formData.customMetalRate ?? liveMetalRate
        : liveMetalRate;

      // Process diamonds array: store configured rate in customMetalRate for each diamond if not provided
      const processedDiamonds = formData.diamonds.map(diamond => {
        if (diamond.metalType) {
          const diamondLiveRate = diamond.metalType === 'Silver'
            ? livePrices?.silver ?? 0
            : diamond.metalType === 'Platinum'
            ? livePrices?.platinum ?? 0
            : livePrices?.gold ?? 0;
          
          // Store current configured rate if no custom rate provided
          return {
            ...diamond,
            customMetalRate: diamond.customMetalRate ?? diamondLiveRate
          };
        }
        return diamond;
      });

      const payload = {
        ...formData,
        product_type: formData.productType,
        sku: computedSku,
        urlSlug: computedSlug,
        customMetalRate: storedCustomMetalRate,
        diamonds: processedDiamonds,
        shortDescription: formData.shortDescription || formData.description.substring(0, 200),
        longDescription: formData.description,
        specifications: formData.specifications,
        mainImage: formData.mainImage,
        images: formData.images,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoTags: formData.seoTags,
        hsnCode: formData.hsnCode,
        relatedProducts: selectedRelatedProducts, // Include selected related products
        isB2C: true,
        status: 'active', // Default status is active
        hasGold: ['Gold', 'Platinum'].includes(formData.productType),
        hasSilver: formData.productType === 'Silver',
        hasDiamond: formData.productType === 'Diamonds' || formData.lessDiamondWeight > 0,
        taxRate: formData.gstRate || 3, // GST percentage stored (will be calculated on website for invoice)
        discount: formData.discount || 0, // Discount percentage stored (will be calculated on website for invoice)
        stock: formData.stock || 1,
        regularPrice: 0,
        sellingPrice: 0,
        costPrice: 0,
      // When editing, preserve original price if it exists, otherwise use calculated subTotal
      // This prevents price from changing automatically when configured rates change
        price: (productId && originalPrice !== null) ? originalPrice : subTotal, // Preserve original price when editing
        subTotal: (productId && originalPrice !== null) ? originalPrice : subTotal, // Preserve original price when editing
        totalAmount: (productId && originalPrice !== null) ? originalPrice : subTotal, // Preserve original price when editing
        goldWeight,
        goldRatePerGram,
        silverWeight,
        silverRatePerGram,
        makingCharges,
      };

      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = productId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // When user set a custom metal rate, sync it to Pricing Settings so same price applies everywhere (vice versa)
        const isMetalProduct = ['Gold', 'Silver', 'Platinum'].includes(formData.productType);
        const customRateToSync = isCustomMetalRateOverride && isMetalProduct && ((formData.customMetalRate ?? 0) > 0);
        if (customRateToSync) {
          const rateToSync = formData.customMetalRate ?? liveMetalRate;
          try {
            const syncRes = await fetch('/api/admin/metal-prices', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ metalType: formData.productType, newRate: rateToSync }),
            });
            if (syncRes.ok) {
              const data = await syncRes.json();
              toast({
                title: 'Success',
                description: productId ? 'Product updated successfully' : 'Product created successfully',
                variant: 'success',
              });
              toast({
                title: 'Price config updated',
                description: data?.message || `₹${rateToSync}/gram set for all ${formData.productType} products.`,
                variant: 'default',
              });
            } else {
              toast({
                title: 'Success',
                description: productId ? 'Product updated successfully' : 'Product created successfully',
                variant: 'success',
              });
            }
          } catch (_) {
            toast({
              title: 'Success',
              description: productId ? 'Product updated successfully' : 'Product created successfully',
              variant: 'success',
            });
          }
        } else {
          toast({
            title: 'Success',
            description: productId ? 'Product updated successfully' : 'Product created successfully',
            variant: 'success',
          });
        }
        router.push('/admin/products');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ProductFormData, value: any) => {
    // Reset form values when product type changes
    if (field === 'productType') {
      setFormData(prev => {
        const resetData: Partial<ProductFormData> = {
          productType: value,
          // Reset product-specific fields
          diamonds: value === 'Diamonds' ? [createDiamondEntry()] : [],
          gemstonePrice: 0,
          diamondsPrice: 0,
          goldWeight: 0,
          lessDiamondWeight: 0,
          lessStoneWeight: 0,
          netGoldWeight: 0,
          goldPurity: '',
          silverPurity: '',
          // Don't reset commission rates for vendors - keep the admin's and vendor's set values
          platformCommissionRate: userRole === 'vendor' ? prev.platformCommissionRate : 0,
          vendorCommissionRate: userRole === 'vendor' ? prev.vendorCommissionRate : 0,
          otherCharges: 0,
          discount: 0,
        };
        return { ...prev, ...resetData };
      });
      fetchAdminDefaultCommission(userRole, value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      const snapshot = {
        category: field === 'category' ? (value as string) : formData.category,
        designType: field === 'designType' ? (value as string) : formData.designType,
        goldPurity: field === 'goldPurity' ? (value as string) : formData.goldPurity,
        silverPurity: field === 'silverPurity' ? (value as string) : formData.silverPurity,
      };
      if ((field === 'category' || field === 'designType' || field === 'goldPurity' || field === 'silverPurity') && formData.productType) {
        fetchAdminDefaultCommission(userRole, formData.productType, snapshot, { categoryOptions, designTypes });
      }
    }
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  useEffect(() => {
    if (formData.productType !== 'Diamonds') return;

    const hasDiamondEntry = formData.diamonds.some(d => !d.metalType);
    if (!hasDiamondEntry) {
      setFormData(prev => ({
        ...prev,
        diamonds: [...prev.diamonds, createDiamondEntry()],
      }));
    }
  }, [formData.productType, formData.diamonds]);

  // Use custom metal rate if provided, otherwise use live rate
  const liveMetalRate =
    formData.productType === 'Silver'
      ? livePrices?.silver ?? 0
      : formData.productType === 'Platinum'
      ? livePrices?.platinum ?? 0
      : livePrices?.gold ?? 0;
  const metalLiveRate = isCustomMetalRateOverride
    ? formData.customMetalRate ?? liveMetalRate
    : liveMetalRate;
  // Prefer the explicit Purity dropdown value; fallback to karat if not set.
  const selectedPurityValue = formData.silverPurity || formData.goldPurity;

  // Show the label from purity options first, then karat options as fallback.
  const selectedPurityLabel = getOptionLabel([...purities, ...karats], selectedPurityValue);

  const purityPercent = parsePurityPercent(selectedPurityValue || '24kt');
  const purityMetalRate = metalLiveRate * purityPercent;
  const goldWeightGram = formData.weight || 0;
  const totalDiamondWeightCt = formData.diamonds.reduce((sum, d) => sum + (d.diamondWeight || 0), 0);
  const netGoldWeight = Math.max(0, goldWeightGram - totalDiamondWeightCt - (formData.lessStoneWeight || 0));
  const goldValue = netGoldWeight * purityMetalRate;
  const makingChargesValue = netGoldWeight * formData.makingChargePerGram;
  // For Diamonds product type, include direct price in diamond value
  const diamondValueAuto = formData.productType === 'Diamonds'
    ? formData.diamonds.reduce((sum, d) => sum + (d.diamondPrice || 0), 0) + (formData.diamondsPrice || 0)
    : formData.diamonds.reduce((sum, d) => sum + (d.diamondPrice || 0), 0);
  
  // For Diamonds product type, calculate from metal values in diamonds array (same calculation as main section)
  const diamondsProductMetalValue = formData.productType === 'Diamonds' 
    ? formData.diamonds.reduce((sum, d) => {
        if (d.metalType) {
          // Calculate metal value using same logic as main section
          const itemLiveRate = d.metalType === 'Silver'
            ? livePrices?.silver ?? 0
            : d.metalType === 'Platinum'
            ? livePrices?.platinum ?? 0
            : livePrices?.gold ?? 0;
          const itemMetalLiveRate = d.customMetalRate ?? itemLiveRate;
          const itemPurityPercent = parsePurityPercent(d.metalPurity || '24kt');
          const itemPurityMetalRate = itemMetalLiveRate * itemPurityPercent;
          const itemWeight = d.metalWeight || 0;
          const itemMakingCharges = d.makingCharges || 0;
          // Same calculation as main section: (weight * purityMetalRate) + (weight * makingCharges)
          return sum + ((itemWeight * itemPurityMetalRate) + (itemWeight * itemMakingCharges));
        }
        return sum;
      }, 0)
    : 0;
  
  // For Gemstone and Imitation products, use gemstone price instead of gold/diamond calculations
  const isSimpleProductType = formData.productType === 'Gemstone' || formData.productType === 'Imitation';
  const gemstoneValue = isSimpleProductType ? (formData.gemstonePrice || 0) : 0;

  // Commission fields show only when 4 fields selected AND combination matched
  const isMetalType = ['Gold', 'Silver', 'Platinum'].includes(formData.productType || '');
  const hasPurity = !!(formData.goldPurity || formData.silverPurity);
  const hasFourFieldsForCommission = !!(
    formData.productType &&
    formData.category &&
    formData.designType &&
    (isMetalType ? hasPurity : true)
  );
  const showPlatformCommissionField =
    hasFourFieldsForCommission &&
    (formData.settingsData?.adminCommissionRows?.length ?? 0) > 0 &&
    formData.settingsData?.platformCommissionMatched === true;
  const showVendorCommissionField =
    userRole === 'vendor' &&
    hasFourFieldsForCommission &&
    (formData.settingsData?.vendorCommissionRows?.length ?? 0) > 0 &&
    formData.settingsData?.vendorCommissionMatched === true;
  
  // For Diamonds product type, check if metals are added
  const hasMetalsInDiamonds = formData.productType === 'Diamonds' && formData.diamonds.some(d => d.metalType);
  
  // Calculate platform commission base (same base for vendor commission)
  const commissionBase = formData.productType === 'Diamonds' && hasMetalsInDiamonds
    ? diamondsProductMetalValue + diamondValueAuto
    : isSimpleProductType 
      ? gemstoneValue 
      : formData.productType === 'Diamonds' && !hasMetalsInDiamonds
        ? diamondValueAuto
        : goldValue + makingChargesValue + diamondValueAuto;
  
  // Calculate platform commission (admin's commission)
  const platformCommissionValue = (formData.platformCommissionRate > 0)
    ? commissionBase * (formData.platformCommissionRate / 100)
    : 0;
  
  // Calculate vendor commission (vendor's commission)
  const vendorCommissionValue = (formData.vendorCommissionRate > 0)
    ? commissionBase * (formData.vendorCommissionRate / 100)
    : 0;
  const extraCharges = formData.otherCharges ?? 0;
  // Original price - GST and discount are NOT included in calculation, only stored for invoice
  // For Diamonds: calculated price (metals + diamonds including direct price) + commission (no other charges)
  const subTotal = formData.productType === 'Diamonds' && hasMetalsInDiamonds
    ? diamondsProductMetalValue + diamondValueAuto + platformCommissionValue
    : formData.productType === 'Diamonds' && !hasMetalsInDiamonds
      ? diamondValueAuto // Now includes direct price
      : isSimpleProductType
        ? gemstoneValue + platformCommissionValue
        : goldValue + makingChargesValue + diamondValueAuto + platformCommissionValue + extraCharges; // Removed vendorCommissionValue
  // GST and discount are stored but NOT calculated here - will be calculated on website invoice
  const totalAmount = subTotal;

  const showGoldFields = ['Gold', 'Silver', 'Platinum'].includes(formData.productType);
  const showDiamondFields = formData.productType === 'Diamonds' || showGoldFields;
  const showGemstoneFields = formData.productType === 'Gemstone' || formData.productType === 'Imitation';

  if (loading && productId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-[#1F3B29]' />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-4 max-w-7xl'>
      <div className='mb-6 flex items-center gap-4'>
        <Button variant='outline' size='icon' onClick={() => router.back()} className=''>
          <ArrowLeft className='w-5 h-5' />
        </Button>
        <h1 className='text-3xl font-bold text-gray-900'>{productId ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Product Type Selection */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Product Type
          </h2>
          <Dropdown
            labelMain='Product Type *'
            value={formData.productType}
            onChange={option => updateField('productType', option.value)}
            options={[...PRODUCT_TYPE_OPTIONS]}
            placeholder='Select Product Type (e.g., Gold, Silver, Diamonds)'
            error={errors.productType}
          />
        </Card>

        {/* Category Selection */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Category
          </h2>
          <Dropdown
            labelMain='Category *'
            value={formData.category}
            onChange={option => updateField('category', option.value)}
            options={categoryOptions}
            placeholder='Select Category or Subcategory (e.g., Earring, Bracelet, Necklace)'
            withSearch={categoryOptions.length > 10}
            error={errors.category}
          />
        </Card>

        {/* Product Details */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Product Details
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {showGemstoneFields ? (
              <>
                {/* Gemstone/Imitation Fields */}
                {formData.productType === 'Gemstone' && (
                  <>
                    <Dropdown
                      labelMain='Gemstone Name'
                      value={formData.gemstoneName}
                      onChange={option => updateField('gemstoneName', option.value)}
                      options={gemstoneNames.length > 0 ? gemstoneNames : [...GEMSTONE_NAME_OPTIONS]}
                      placeholder='Example: Ruby (Manik), Emerald (Panna)'
                      withSearch={gemstoneNames.length > 10 || GEMSTONE_NAME_OPTIONS.length > 10}
                    />

                    <FormField
                      label='Certified Laboratory'
                      value={formData.gemstoneCertificateLab}
                      onChange={e => updateField('gemstoneCertificateLab', e.target.value)}
                      type='text'
                      placeholder='Example: GIA, IGI, SGL'
                    />

                    <Dropdown
                      labelMain='Colour'
                      value={formData.gemstoneColour}
                      onChange={option => updateField('gemstoneColour', option.value)}
                      options={diamondColors}
                      placeholder='Select Colour'
                      withSearch={diamondColors.length > 10}
                    />

                    <Dropdown
                      labelMain='Shape/Cut'
                      value={formData.gemstoneShape}
                      onChange={option => updateField('gemstoneShape', option.value)}
                      options={diamondShapes}
                      placeholder='Select Shape/Cut'
                      withSearch={diamondShapes.length > 10}
                    />

                    <FormField
                      label='Gemstone Weight (Cts)'
                      value={formData.gemstoneWeight}
                      onChange={e => updateField('gemstoneWeight', parseFloat(e.target.value) || 0)}
                      type='number'
                      placeholder='Example: 2.5'
                    />

                    <FormField
                      label='Ratti'
                      value={formData.ratti}
                      onChange={e => updateField('ratti', parseFloat(e.target.value) || 0)}
                      type='number'
                      placeholder='Example: 5.2'
                    />

                    <FormField
                      label='Dimension'
                      value={formData.dimension}
                      onChange={e => updateField('dimension', e.target.value)}
                      type='text'
                      placeholder='Example: 2x3x1 cm'
                    />

                    <FormField
                      label='Specific Gravity'
                      value={formData.specificGravity}
                      onChange={e => updateField('specificGravity', parseFloat(e.target.value) || 0)}
                      type='number'
                      placeholder='Example: 3.95'
                    />

                    <FormField
                      label='Magnification'
                      value={formData.magnification}
                      onChange={e => updateField('magnification', parseFloat(e.target.value) || 0)}
                      type='number'
                      placeholder='Example: 10x'
                    />

                    <FormField
                      label='Hardness'
                      value={formData.hardness}
                      onChange={e => updateField('hardness', parseFloat(e.target.value) || 0)}
                      type='number'
                      placeholder='Example: 9.0'
                    />

                    <FormField
                      label='Refractive Index'
                      value={formData.refractiveIndex}
                      onChange={e => updateField('refractiveIndex', parseFloat(e.target.value) || 0)}
                      type='number'
                      placeholder='Example: 1.76'
                    />

                    <FormField
                      label='Report No'
                      value={formData.reportNo}
                      onChange={e => updateField('reportNo', e.target.value)}
                      type='text'
                      placeholder='Example: GIA123456'
                    />
                  </>
                )}

                <FormField
                  label='Price (₹)'
                  value={formData.gemstonePrice}
                  onChange={e => updateField('gemstonePrice', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 50000'
                />

                <FormField
                  label='Stock'
                  value={formData.stock}
                  onChange={e => updateField('stock', parseInt(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 10'
                />

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Gender (Multi-select)
                  </label>
                  <div className='flex flex-wrap gap-3 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700'>
                    {GENDER_OPTIONS.map(option => (
                      <label key={option.value} className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={(formData.gender || []).includes(option.value)}
                          onChange={e => {
                            const currentSelection = formData.gender || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, option.value]
                              : currentSelection.filter(g => g !== option.value);
                            updateField('gender', newSelection);
                          }}
                          className='w-4 h-4 text-[#1F3B29] border-gray-300 rounded focus:ring-[#1F3B29]'
                        />
                        <span className='text-sm'>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Gold/Silver/Platinum/Diamonds Fields */}
                <Dropdown
                  labelMain='Design Type *'
                  value={formData.designType}
                  onChange={option => updateField('designType', option.value)}
                  options={designTypes}
                  placeholder='Select Design Type'
                  withSearch={designTypes.length > 10}
                  error={errors.designType}
                />

                <Dropdown
                  labelMain='Karat'
                  value={formData.goldPurity}
                  onChange={option => updateField('goldPurity', option.value)}
                  options={karats}
                  placeholder='Select Karat'
                  withSearch={karats.length > 10}
                />

                <Dropdown
                  labelMain={formData.productType ? `${formData.productType} Purity *` : 'Purity *'}
                  value={formData.silverPurity}
                  onChange={option => updateField('silverPurity', option.value)}
                  options={purities}
                  placeholder={formData.productType ? `Select ${formData.productType} Purity` : 'Select Purity'}
                  withSearch={purities.length > 10}
                  error={errors.silverPurity}
                />

                <Dropdown
                  labelMain='Metal Colour'
                  value={formData.metalColour}
                  onChange={option => updateField('metalColour', option.value)}
                  options={metalColors}
                  placeholder='Select Metal Colour'
                  withSearch={metalColors.length > 10}
                />

                <FormField
                  label={formData.productType ? `${formData.productType} Weight (Gram)` : 'Weight (Gram)'}
                  value={formData.weight}
                  onChange={e => updateField('weight', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 10'
                  required
                  error={errors.weight}
                />

                <FormField
                  label='Stock'
                  value={formData.stock}
                  onChange={e => updateField('stock', parseInt(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 10'
                />

                <FormField
                  label='Size'
                  value={formData.size}
                  onChange={e => updateField('size', e.target.value)}
                  type='text'
                  placeholder='Example: 7, M, or 2.5'
                />

                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Gender (Multi-select)
                  </label>
                  <div className='flex flex-wrap gap-3 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700'>
                    {GENDER_OPTIONS.map(option => (
                      <label key={option.value} className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={(formData.gender || []).includes(option.value)}
                          onChange={e => {
                            const currentSelection = formData.gender || [];
                            const newSelection = e.target.checked
                              ? [...currentSelection, option.value]
                              : currentSelection.filter(g => g !== option.value);
                            updateField('gender', newSelection);
                          }}
                          className='w-4 h-4 text-[#1F3B29] border-gray-300 rounded focus:ring-[#1F3B29]'
                        />
                        <span className='text-sm'>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <FormField
                  label='Items Pairs'
                  value={formData.itemsPair}
                  onChange={e => updateField('itemsPair', e.target.value)}
                  type='text'
                  placeholder='Example: 1, 2, or Pair'
                />

                <FormField
                  label='HUID Hallmark No'
                  value={formData.huidHallmarkNo}
                  onChange={e => updateField('huidHallmarkNo', e.target.value)}
                  type='text'
                  placeholder='Enter Hallmark Number'
                />

                <FormField
                  label='Stoneless Weight (Gram)'
                  value={formData.lessStoneWeight}
                  onChange={e => updateField('lessStoneWeight', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 8.5'
                />
              </>
            )}
          </div>
        </Card>

        {/* Basic Product Info */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Product Content & Basics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              label='Product Name'
              required
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              type='text'
              placeholder='Example: 22K Gold Diamond Ring'
              error={errors.name}
            />
            <div className='flex flex-col gap-2'>
              <FormField
                label='SKU'
                value={formData.sku}
                onChange={e => updateField('sku', e.target.value)}
                type='text'
                placeholder='Auto-generate or enter manually'
                required
                error={errors.sku}
              />
              <div>
                <Button type='button' variant='outline' size='sm' onClick={generateSku}>
                  Auto Generate SKU
                </Button>
              </div>
            </div>
            <FormField
              label='HSN Code'
              value={formData.hsnCode}
              onChange={e => updateField('hsnCode', e.target.value)}
              type='text'
              placeholder='Example: 7113 for Jewellery'
              required
              error={errors.hsnCode}
            />
            <div className='flex flex-col gap-2'>
              <FormField
                label='URL Slug'
                value={formData.urlSlug}
                onChange={e => updateField('urlSlug', slugify(e.target.value))}
                type='text'
                placeholder='auto-from-name'
                required
                error={errors.urlSlug}
              />
              <div className='text-xs text-gray-500'>Slug updates automatically when name changes.</div>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              label='Short Description'
              required
              textarea
              rows={3}
              value={formData.shortDescription}
              onChange={e => updateField('shortDescription', e.target.value)}
              placeholder='A brief summary for listing cards (ideal 160-200 chars)'
              containerClassName='flex flex-col gap-2'
              inputClassName='border-gray-200 focus:ring-[#1F3B29]'
              error={errors.description}
            />
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Specifications (table)</label>
              <div className='space-y-2'>
                {(formData.specifications || []).map((spec, idx) => (
                  <div key={idx} className='grid grid-cols-5 gap-2 items-center'>
                    <Input
                      className='col-span-2'
                      placeholder='Label (e.g., Metal)'
                      value={spec.key}
                      onChange={e => updateSpecificationRow(idx, 'key', e.target.value)}
                    />
                    <Input
                      className='col-span-2'
                      placeholder='Value (e.g., 22K Gold)'
                      value={spec.value}
                      onChange={e => updateSpecificationRow(idx, 'value', e.target.value)}
                    />
                    <Button type='button' variant='ghost' size='icon' onClick={() => removeSpecificationRow(idx)}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                ))}
                <Button type='button' variant='outline' size='sm' onClick={addSpecificationRow} className='mt-1'>
                  Add Specification
                </Button>
              </div>
            </div>
          </div>

          <div className='mt-4'>
            {/* <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label> */}
            <RichTextEditor
              label='Description'
              value={formData.description}
              onChange={value => updateField('description', value)}
              placeholder='Detailed product description for PDP'
              error={errors.description}
            />
          </div>
        </Card>

        {/* Diamonds Fields Section */}
        {(formData.productType === 'Diamonds' ||
          formData.productType === 'Gold' ||
          formData.productType === 'Silver' ||
          formData.productType === 'Platinum') && (
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold flex items-center gap-2'>
                <Package className='w-5 h-5' />
                Diamonds Field Details
              </h2>
              {formData.productType !== 'Diamonds' && (
                <Button
                  type='button'
                  onClick={() => {
                    const hasIncomplete = formData.diamonds.some(d => !isDiamondComplete(d));
                    if (hasIncomplete) {
                      toast({
                        title: 'Please complete current diamond first',
                        description: 'Fill required fields before adding another diamond.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    setFormData(prev => ({
                      ...prev,
                      diamonds: [...prev.diamonds, createDiamondEntry()],
                    }));
                  }}
                  className='text-white'>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Diamond
                </Button>
              )}
            </div>

            {formData.diamonds.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>No diamonds added.</p>
            ) : (
              <div className='space-y-6'>
                {formData.diamonds.map((diamond, index) => (
                  <Card key={diamond.id} className='p-4 border-2 border-gray-200'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='font-semibold text-lg'>
                        {diamond.metalType
                          ? `${diamond.metalType} ${index + 1}`
                          : formData.productType === 'Diamonds'
                          ? 'Diamond'
                          : `Diamond ${index + 1}`}
                      </h3>
                      {formData.productType !== 'Diamonds' && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              diamonds: prev.diamonds.filter(d => d.id !== diamond.id),
                            }));
                          }}
                          className='text-red-600'>
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {diamond.metalType ? (() => {
                        // Get configured metal rate based on metal type (same logic as main section)
                        const itemLiveMetalRate = diamond.metalType === 'Silver'
                          ? livePrices?.silver ?? 0
                          : diamond.metalType === 'Platinum'
                          ? livePrices?.platinum ?? 0
                          : livePrices?.gold ?? 0;
                        const itemMetalLiveRate = diamond.customMetalRate ?? itemLiveMetalRate;
                        const itemPurityPercent = parsePurityPercent(diamond.metalPurity || '24kt');
                        const itemPurityMetalRate = itemMetalLiveRate * itemPurityPercent;
                        const itemWeight = diamond.metalWeight || 0;
                        const itemMakingCharges = diamond.makingCharges || 0;
                        const calculatedMetalValue = (itemWeight * itemPurityMetalRate) + (itemWeight * itemMakingCharges);
                        
                        return (
                          <>
                            {/* Metal Fields for Diamonds product type */}
                            <FormField
                              label={`${diamond.metalType} Weight (Gram)`}
                              value={diamond.metalWeight || 0}
                              onChange={e => {
                                const weight = parseFloat(e.target.value) || 0;
                                const updatedDiamonds = formData.diamonds.map(d => {
                                  if (d.id === diamond.id) {
                                    const liveRate = d.metalType === 'Silver'
                                      ? livePrices?.silver ?? 0
                                      : d.metalType === 'Platinum'
                                      ? livePrices?.platinum ?? 0
                                      : livePrices?.gold ?? 0;
                                    const metalLiveRate = d.customMetalRate ?? liveRate;
                                    const purityPercent = parsePurityPercent(d.metalPurity || '24kt');
                                    const purityMetalRate = metalLiveRate * purityPercent;
                                    const makingCharges = d.makingCharges || 0;
                                    const metalValue = (weight * purityMetalRate) + (weight * makingCharges);
                                    return { ...d, metalWeight: weight, metalValue };
                                  }
                                  return d;
                                });
                                setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                              }}
                              type='number'
                              placeholder='Example: 10'
                            />

                            <Dropdown
                              labelMain={`${diamond.metalType} Purity`}
                              value={diamond.metalPurity || ''}
                              onChange={option => {
                                const updatedDiamonds = formData.diamonds.map(d => {
                                  if (d.id === diamond.id) {
                                    const liveRate = d.metalType === 'Silver'
                                      ? livePrices?.silver ?? 0
                                      : d.metalType === 'Platinum'
                                      ? livePrices?.platinum ?? 0
                                      : livePrices?.gold ?? 0;
                                    const metalLiveRate = d.customMetalRate ?? liveRate;
                                    const purityPercent = parsePurityPercent(option.value);
                                    const purityMetalRate = metalLiveRate * purityPercent;
                                    const weight = d.metalWeight || 0;
                                    const makingCharges = d.makingCharges || 0;
                                    const metalValue = (weight * purityMetalRate) + (weight * makingCharges);
                                    return { ...d, metalPurity: option.value, metalValue };
                                  }
                                  return d;
                                });
                                setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                              }}
                              options={diamond.metalType === 'Silver' ? purities : karats}
                              placeholder={`Select ${diamond.metalType} Purity`}
                              withSearch={true}
                            />

                            <FormField
                              label={`Metal Rate (24K) per gram (₹)`}
                              value={diamond.customMetalRate ?? itemLiveMetalRate}
                              onChange={e => {
                                const value = parseFloat(e.target.value) || 0;
                                const updatedDiamonds = formData.diamonds.map(d => {
                                  if (d.id === diamond.id) {
                                    // If value equals configured rate, clear custom rate
                                    const liveRate = d.metalType === 'Silver'
                                      ? livePrices?.silver ?? 0
                                      : d.metalType === 'Platinum'
                                      ? livePrices?.platinum ?? 0
                                      : livePrices?.gold ?? 0;
                                    if (value === liveRate) {
                                      const purityPercent = parsePurityPercent(d.metalPurity || '24kt');
                                      const purityMetalRate = liveRate * purityPercent;
                                      const weight = d.metalWeight || 0;
                                      const makingCharges = d.makingCharges || 0;
                                      const metalValue = (weight * purityMetalRate) + (weight * makingCharges);
                                      return { ...d, customMetalRate: undefined, metalValue };
                                    } else {
                                      const purityPercent = parsePurityPercent(d.metalPurity || '24kt');
                                      const purityMetalRate = value * purityPercent;
                                      const weight = d.metalWeight || 0;
                                      const makingCharges = d.makingCharges || 0;
                                      const metalValue = (weight * purityMetalRate) + (weight * makingCharges);
                                      return { ...d, customMetalRate: value, metalValue };
                                    }
                                  }
                                  return d;
                                });
                                setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                              }}
                              type='number'
                              placeholder={itemLiveMetalRate.toString()}
                              disabled={userRole === 'vendor'}
                              readOnly={userRole === 'vendor'}
                            />
                            <p className='text-xs text-gray-500 -mt-2 mb-2'>
                              {diamond.customMetalRate ? 'Custom rate' : `Configured: ${formatINR(itemLiveMetalRate)}`}
                            </p>

                            <FormField
                              label='Making Charges per Gram (₹)'
                              value={diamond.makingCharges || 0}
                              onChange={e => {
                                const makingCharges = parseFloat(e.target.value) || 0;
                                const updatedDiamonds = formData.diamonds.map(d => {
                                  if (d.id === diamond.id) {
                                    const liveRate = d.metalType === 'Silver'
                                      ? livePrices?.silver ?? 0
                                      : d.metalType === 'Platinum'
                                      ? livePrices?.platinum ?? 0
                                      : livePrices?.gold ?? 0;
                                    const metalLiveRate = d.customMetalRate ?? liveRate;
                                    const purityPercent = parsePurityPercent(d.metalPurity || '24kt');
                                    const purityMetalRate = metalLiveRate * purityPercent;
                                    const weight = d.metalWeight || 0;
                                    const metalValue = (weight * purityMetalRate) + (weight * makingCharges);
                                    return { ...d, makingCharges, metalValue };
                                  }
                                  return d;
                                });
                                setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                              }}
                              type='number'
                              placeholder='Example: 500'
                            />

                            <div className='md:col-span-2 p-3 bg-gray-50 rounded border'>
                              <p className='text-sm text-gray-600 mb-1'>Selected Purity</p>
                              <p className='text-lg font-semibold'>{getOptionLabel(diamond.metalType === 'Silver' ? purities : karats, diamond.metalPurity || '24kt')}</p>
                              <p className='text-xs text-gray-500'>{(itemPurityPercent * 100).toFixed(1)}%</p>
                            </div>

                            <div className='md:col-span-2 p-3 bg-gray-50 rounded border'>
                              <p className='text-sm text-gray-600 mb-1'>Purity Rate</p>
                              <p className='text-2xl font-semibold text-[#1F3B29]'>{formatINR(itemPurityMetalRate)}</p>
                            </div>

                            <FormField
                              label={`${diamond.metalType} Value (₹)`}
                              value={calculatedMetalValue}
                              onChange={() => {}}
                              type='number'
                              placeholder='Auto-calculated'
                              disabled
                            />
                          </>
                        );
                      })() : (
                        <>
                          {/* Diamond Fields */}
                          <Dropdown
                            labelMain='Diamonds Type'
                            value={diamond.diamondsType}
                            onChange={option => {
                              const updatedDiamonds = formData.diamonds.map(d =>
                                d.id === diamond.id ? { ...d, diamondsType: option.value } : d
                              );
                              setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                            }}
                            options={diamondTypes.length ? diamondTypes : [...DEFAULT_DIAMONDS_TYPE_OPTIONS]}
                            placeholder='Select Diamonds Type'
                            withSearch={diamondTypes.length > 10}
                          />

                      <FormField
                        label='No of Diamonds'
                        value={diamond.noOfDiamonds}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, noOfDiamonds: parseInt(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 10'
                      />

                      <FormField
                        label='Diamond Weight (ct)'
                        value={diamond.diamondWeight}
                        onChange={e => {
                          const weight = parseFloat(e.target.value) || 0;
                          const updatedDiamonds = formData.diamonds.map(d => {
                            if (d.id === diamond.id) {
                              const pricePerCarat = d.pricePerCarat || 0;
                              const calculatedPrice = Math.max(
                                0,
                                (pricePerCarat * weight) * (1 - ((d.diamondDiscount || 0) / 100))
                              );
                              return { ...d, diamondWeight: weight, diamondPrice: calculatedPrice };
                            }
                            return d;
                          });
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 0.50'
                      />

                      <FormField
                        label='Price Per Carat (₹)'
                        value={diamond.pricePerCarat || 0}
                        onChange={e => {
                          const pricePerCarat = parseFloat(e.target.value) || 0;
                          const updatedDiamonds = formData.diamonds.map(d => {
                            if (d.id === diamond.id) {
                              const weight = d.diamondWeight || 0;
                              const discountPercent = d.diamondDiscount || 0;
                              const basePrice = pricePerCarat * weight;
                              const calculatedPrice = Math.max(0, basePrice * (1 - discountPercent / 100));
                              return { ...d, pricePerCarat, diamondPrice: calculatedPrice };
                            }
                            return d;
                          });
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 40000'
                      />

                      <FormField
                        label='Diamond Discount (%)'
                        value={diamond.diamondDiscount || 0}
                        onChange={e => {
                          const discountPercent = parseFloat(e.target.value) || 0;
                          const updatedDiamonds = formData.diamonds.map(d => {
                            if (d.id === diamond.id) {
                              const pricePerCarat = d.pricePerCarat || 0;
                              const weight = d.diamondWeight || 0;
                              const basePrice = pricePerCarat * weight;
                              const calculatedPrice = Math.max(0, basePrice * (1 - discountPercent / 100));
                              return { ...d, diamondDiscount: discountPercent, diamondPrice: calculatedPrice };
                            }
                            return d;
                          });
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 10'
                      />

                      <FormField
                        label='Diamond Price (₹)'
                        value={diamond.diamondPrice || 0}
                        onChange={() => {}}
                        type='number'
                        placeholder='Auto-calculated'
                        disabled
                      />

                      <FormField
                        label='Diamond Size'
                        value={diamond.diamondSize}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, diamondSize: e.target.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: 2mm, 3mm'
                      />

                      <Dropdown
                        labelMain='Setting Type'
                        value={diamond.settingType}
                        onChange={option => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, settingType: option.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        options={settingTypes}
                        placeholder='Select Setting Type'
                        withSearch={settingTypes.length > 10}
                      />

                      <Dropdown
                        labelMain='Clarity'
                        value={diamond.clarity}
                        onChange={option => {
                          const updatedDiamonds = formData.diamonds.map(d => (d.id === diamond.id ? { ...d, clarity: option.value } : d));
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        options={clarities}
                        placeholder='Select Clarity'
                        withSearch={clarities.length > 10}
                      />

                      <Dropdown
                        labelMain='Diamonds Colour'
                        value={diamond.diamondsColour}
                        onChange={option => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, diamondsColour: option.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        options={diamondColors}
                        placeholder='Select Diamonds Colour'
                        withSearch={diamondColors.length > 10}
                      />

                      <Dropdown
                        labelMain='Diamonds Shape'
                        value={diamond.diamondsShape}
                        onChange={option => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, diamondsShape: option.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        options={diamondShapes}
                        placeholder='Select Diamonds Shape'
                        withSearch={diamondShapes.length > 10}
                      />

                      <FormField
                        label='Diamond Setting'
                        value={diamond.diamondSetting}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, diamondSetting: e.target.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: Solitaire, Three Stone'
                      />

                      <Dropdown
                        labelMain='Certified Labs'
                        value={diamond.certifiedLabs}
                        onChange={option => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, certifiedLabs: option.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        options={certifiedLabs}
                        placeholder='Select Certified Labs'
                        withSearch={certifiedLabs.length > 10}
                      />

                      <FormField
                        label='Certificate No.'
                        value={diamond.certificateNo}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, certificateNo: e.target.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: CERT123456'
                      />

                      <FormField
                        label='Occasion'
                        value={diamond.occasion || ''}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, occasion: e.target.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: Wedding, Party'
                      />

                      <FormField
                        label='Dimension'
                        value={diamond.dimension || ''}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, dimension: e.target.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: 5x4x3 mm'
                      />

                      <FormField
                        label='Height'
                        value={diamond.height || 0}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, height: parseFloat(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 2.5'
                      />

                      <FormField
                        label='Width'
                        value={diamond.width || 0}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, width: parseFloat(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 3.0'
                      />

                      <FormField
                        label='Length'
                        value={diamond.length || 0}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, length: parseFloat(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 1.0'
                      />

                      <FormField
                        label='Brand'
                        value={diamond.brand || ''}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d => (d.id === diamond.id ? { ...d, brand: e.target.value } : d));
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: Brand Name'
                      />

                      <FormField
                        label='Collection'
                        value={diamond.collection || ''}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, collection: e.target.value } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='text'
                        placeholder='Example: Classic, Modern'
                      />

                      <FormField
                        label='Thickness'
                        value={diamond.thickness || 0}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, thickness: parseFloat(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 1.5'
                      />

                      <div className='md:col-span-3 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <label className='block text-sm font-medium'>Specification (table)</label>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              const updatedDiamonds = formData.diamonds.map(d =>
                                d.id === diamond.id
                                  ? {
                                      ...d,
                                      specifications: [...(d.specifications || []), { key: '', value: '' }],
                                    }
                                  : d
                              );
                              setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                            }}>
                            <Plus className='w-4 h-4 mr-1' />
                            Add Row
                          </Button>
                        </div>

                        <div className='space-y-2'>
                          {(diamond.specifications && diamond.specifications.length > 0
                            ? diamond.specifications
                            : [{ key: '', value: '' }]
                          ).map((row, idx) => (
                            <div key={`${diamond.id}-spec-${idx}`} className='grid grid-cols-1 md:grid-cols-5 gap-2 items-center'>
                              <div className='md:col-span-2'>
                                <Input
                                  placeholder='Label'
                                  value={row.key}
                                  onChange={e => {
                                    const updatedRows = [...(diamond.specifications || [])];
                                    updatedRows[idx] = { ...updatedRows[idx], key: e.target.value };
                                    const updatedDiamonds = formData.diamonds.map(d =>
                                      d.id === diamond.id ? { ...d, specifications: updatedRows } : d
                                    );
                                    setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                                  }}
                                />
                              </div>
                              <div className='md:col-span-2'>
                                <Input
                                  placeholder='Value'
                                  value={row.value}
                                  onChange={e => {
                                    const updatedRows = [...(diamond.specifications || [])];
                                    updatedRows[idx] = { ...updatedRows[idx], value: e.target.value };
                                    const updatedDiamonds = formData.diamonds.map(d =>
                                      d.id === diamond.id ? { ...d, specifications: updatedRows } : d
                                    );
                                    setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                                  }}
                                />
                              </div>
                              <div className='md:col-span-1 flex justify-end'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => {
                                    const updatedRows = (diamond.specifications || []).filter((_, i) => i !== idx);
                                    const updatedDiamonds = formData.diamonds.map(d =>
                                      d.id === diamond.id ? { ...d, specifications: updatedRows } : d
                                    );
                                    setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                                  }}
                                  className='text-red-600 hover:text-red-700'
                                  aria-label='Remove row'>
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {!diamond.metalType && (
                        <>
                          <div className='md:col-span-3'>
                            <label className='block text-sm font-medium mb-2'></label>
                            <RichTextEditor
                              label='Diamond Description'
                              value={diamond.description || ''}
                              onChange={value => {
                                const updatedDiamonds = formData.diamonds.map(d => (d.id === diamond.id ? { ...d, description: value } : d));
                                setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                              }}
                              placeholder='Enter description for this diamond'
                            />
                          </div>

                          <div className='md:col-span-3'>
                            <label className='block text-sm font-medium mb-2'>Certificate Images</label>
                            <Input
                              type='file'
                              multiple
                              accept='image/*'
                              onChange={e => uploadCertificateImages(diamond.id, e.target.files)}
                              className='cursor-pointer'
                            />
                            <p className='text-xs text-gray-500 mt-1'>Upload certificate images (e.g., IGI, SGI certificates)</p>
                            {uploadingDiamondId === diamond.id && <p className='text-xs text-blue-600 mt-1'>Uploading...</p>}

                            {diamond.certificateImages && diamond.certificateImages.length > 0 && (
                              <div className='flex flex-wrap gap-3 mt-3'>
                                {diamond.certificateImages.map((url, idx) => (
                                  <div key={`${diamond.id}-cert-${idx}`} className='relative w-24 h-24 rounded border overflow-hidden'>
                                    <img src={url} alt='Certificate' className='w-full h-full object-cover' />
                                    <button
                                      type='button'
                                      onClick={() => {
                                        const updatedImages = (diamond.certificateImages || []).filter((_, i) => i !== idx);
                                        const updatedDiamonds = formData.diamonds.map(d =>
                                          d.id === diamond.id ? { ...d, certificateImages: updatedImages } : d
                                        );
                                        setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                                      }}
                                      className='absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs'
                                      aria-label='Remove image'>
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Total Summary - Automatic Calculation */}
            {formData.diamonds.length > 0 && (
              <div className='mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200'>
                <h3 className='text-lg font-semibold mb-4'>Total Summary</h3>
                {formData.productType === 'Diamonds' ? (
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total Metals</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>{formData.diamonds.filter(d => d.metalType).length}</p>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total Gold Weight (Gram)</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>
                        {formData.diamonds.filter(d => d.metalType === 'Gold').reduce((sum, d) => sum + (d.metalWeight || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total Silver Weight (Gram)</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>
                        {formData.diamonds.filter(d => d.metalType === 'Silver').reduce((sum, d) => sum + (d.metalWeight || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total Platinum Weight (Gram)</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>
                        {formData.diamonds.filter(d => d.metalType === 'Platinum').reduce((sum, d) => sum + (d.metalWeight || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total Metal Value (₹)</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>
                        {formatINR(diamondsProductMetalValue)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total No. of Diamonds</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>{formData.diamonds.length}</p>
                    </div>
                    <div className='bg-white p-3 rounded-lg'>
                      <p className='text-sm text-gray-600 mb-1'>Total Diamonds Weight (ct)</p>
                      <p className='text-2xl font-bold text-[#1F3B29]'>
                        {formData.diamonds.reduce((sum, d) => sum + (d.diamondWeight || 0), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </Card>
        )}

        {/* General Fields - Will be added later */}
        {false && (
          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>General Fields</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                label='Product Name *'
                required
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                type='text'
                placeholder='Example: 22K Gold Diamond Earring'
              />

              <FormField
                label='Occasion'
                value={formData.occasion}
                onChange={e => updateField('occasion', e.target.value)}
                type='text'
                placeholder='Example: Wedding, Party, Daily Wear'
              />

              <FormField
                label='Dimension'
                value={formData.dimension}
                onChange={e => updateField('dimension', e.target.value)}
                type='text'
                placeholder='Example: 2x3x1 cm'
              />

              <FormField
                label='Height (cm)'
                value={formData.height}
                onChange={e => updateField('height', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 2.5'
              />

              <FormField
                label='Width (cm)'
                value={formData.width}
                onChange={e => updateField('width', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 3.0'
              />

              <FormField
                label='Length (cm)'
                value={formData.length}
                onChange={e => updateField('length', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 1.0'
              />

              <FormField
                label='Brand'
                value={formData.brand}
                onChange={e => updateField('brand', e.target.value)}
                type='text'
                placeholder='Example: Tanishq, Kalyan Jewellers'
              />

              <FormField
                label='Collection'
                value={formData.collection}
                onChange={e => updateField('collection', e.target.value)}
                type='text'
                placeholder='Example: Classic, Modern, Traditional'
              />

              <FormField
                label='Thickness (mm)'
                value={formData.thickness}
                onChange={e => updateField('thickness', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 1.5'
              />

              <FormField
                label='URL Slug *'
                required
                value={formData.urlSlug}
                onChange={e => updateField('urlSlug', e.target.value)}
                type='text'
                placeholder='Example: 22k-gold-diamond-earring'
              />
            </div>

            <div className='mt-4'>
              <label className='block text-sm font-medium mb-2'>Description/Specification *</label>
              <RichTextEditor
                label='Description/Specification'
                value={formData.description}
                onChange={value => updateField('description', value)}
                placeholder='Enter detailed product description and specifications...'
              />
            </div>
          </Card>
        )}

        {/* Main Thumbnail Image */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Main Thumbnail Image</h2>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Main Thumbnail Image <span className='text-red-500'>*</span>
              </label>
              {!formData.mainImage ? (
                <>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) uploadMainThumbnail(file);
                    }}
                    className='cursor-pointer'
                    disabled={uploadingMainThumbnail}
                  />
                  <p className='text-xs text-gray-500 mt-1'>This image will be displayed as the main product image on the website. JPEG/PNG preferred.</p>
                </>
              ) : (
                <div className='relative inline-block border rounded overflow-hidden'>
                  <img src={formData.mainImage} alt='Main thumbnail' className='w-48 h-48 object-cover' />
                  <button
                    type='button'
                    onClick={removeMainThumbnail}
                    className='absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white'>
                    <Trash2 className='w-4 h-4 text-red-600' />
                  </button>
                </div>
              )}
              {uploadingMainThumbnail && <p className='text-xs text-gray-500 mt-1'>Uploading...</p>}
              {errors.mainImage && <p className='text-xs text-red-500 mt-1'>{errors.mainImage}</p>}
            </div>
          </div>
        </Card>

        {/* Product Images */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Product Gallery Images</h2>
          <div className='space-y-3'>
            <div>
              <label className='block text-sm font-medium mb-2'>Upload Images (multiple)</label>
              <Input type='file' accept='image/*' multiple onChange={e => uploadProductImages(e.target.files)} className='cursor-pointer' />
              <p className='text-xs text-gray-500 mt-1'>JPEG/PNG preferred. Multiple selections allowed.</p>
            </div>
            {uploadingProductImages && <p className='text-xs text-gray-500'>Uploading...</p>}
            {formData.images && formData.images.length > 0 && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {formData.images.map(img => (
                  <div key={img} className='relative border rounded overflow-hidden'>
                    <img src={img} alt='Product' className='w-full h-32 object-cover' />
                    <button
                      type='button'
                      onClick={() => removeProductImage(img)}
                      className='absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow'>
                      <Trash2 className='w-4 h-4 text-red-600' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Gemstone Certificate Image - Only for Gemstone product type */}
        {formData.productType === 'Gemstone' && (
          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Gemstone Certificate</h2>
            <div className='space-y-3'>
              <div>
                <label className='block text-sm font-medium mb-2'>Gemstone Certificate Image</label>
                {!formData.gemstoneCertificate ? (
                  <>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) uploadGemstoneCertificate(file);
                      }}
                      className='cursor-pointer'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Upload gemstone certificate image. JPEG/PNG preferred.</p>
                  </>
                ) : (
                  <div className='relative inline-block border rounded overflow-hidden'>
                    <img src={formData.gemstoneCertificate} alt='Gemstone certificate' className='w-48 h-48 object-cover' />
                    <button
                      type='button'
                      onClick={removeGemstoneCertificate}
                      className='absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white'>
                      <Trash2 className='w-4 h-4 text-red-600' />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* SEO */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>SEO</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              label='SEO Title'
              required
              value={formData.seoTitle}
              onChange={e => updateField('seoTitle', e.target.value)}
              type='text'
              placeholder='Best 22K Gold Diamond Ring | Brand'
              error={errors.seoTitle}
            />
            <FormField
              label='SEO Tags (comma separated)'
              required
              value={formData.seoTags}
              onChange={e => updateField('seoTags', e.target.value)}
              type='text'
              placeholder='gold ring, diamond jewelry, 22k'
              error={errors.seoTags}
            />
          </div>
          <div className='mt-4'>
            <FormField
              label='SEO Description'
              required
              textarea
              rows={3}
              value={formData.seoDescription}
              onChange={e => updateField('seoDescription', e.target.value)}
              placeholder='Meta description for search and social previews'
              containerClassName='flex flex-col gap-2'
              inputClassName='border-gray-200 focus:ring-[#1F3B29]'
              error={errors.seoDescription}
            />
          </div>
        </Card>

        {/* Related Products */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-2'>Related Products</h2>
          <p className='text-sm text-gray-600 mb-4'>
            Select products that are related to this product. These will be shown on the product details page.
          </p>
          
          {/* Search Input */}
          <div className='relative mb-4'>
            <Input
              type='text'
              placeholder='Search products by name...'
              value={productSearchQuery}
              onChange={e => handleProductSearch(e.target.value)}
              className='w-full'
            />
            {loadingProducts && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                <Loader2 className='w-4 h-4 animate-spin text-gray-400' />
              </div>
            )}
          </div>

          {/* Product List */}
          <div className='border rounded-lg overflow-hidden'>
            <div className='max-h-[400px] overflow-y-auto'>
              {displayedProducts.length === 0 && !loadingProducts && (
                <div className='p-8 text-center text-gray-500'>
                  {productSearchQuery.trim() ? 'No products found' : 'No products available'}
                </div>
              )}
              {displayedProducts.map(product => (
                <div
                  key={product._id}
                  className='flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors'>
                  <input
                    type='checkbox'
                    checked={selectedRelatedProducts.includes(product._id)}
                    onChange={() => toggleProductSelection(product._id)}
                    className='w-4 h-4 rounded border-gray-300 text-[#1F3B29] focus:ring-[#1F3B29] cursor-pointer'
                  />
                  <div className='w-12 h-12 shrink-0 rounded overflow-hidden bg-gray-100'>
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <Package className='w-6 h-6 text-gray-400' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{product.name}</p>
                    {product.sku && (
                      <p className='text-xs text-gray-500'>{product.sku}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Count */}
          {selectedRelatedProducts.length > 0 && (
            <div className='mt-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg'>
              <span className='text-sm font-medium text-green-800'>
                {selectedRelatedProducts.length} product{selectedRelatedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                type='button'
                onClick={clearAllRelatedProducts}
                className='text-sm font-medium text-red-600 hover:text-red-700 transition-colors'>
                Clear All
              </button>
            </div>
          )}
        </Card>

        {/* Metal Calculation (Live) */}
        {showGoldFields && (
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold flex items-center gap-2'>
                <Package className='w-5 h-5' />
                {formData.productType === 'Silver'
                  ? 'Silver Details (Live Calculation)'
                  : formData.productType === 'Platinum'
                  ? 'Platinum Details (Live Calculation)'
                  : 'Gold Details (Live Calculation)'}
              </h2>
              <div className='text-xs text-gray-500'>
                {livePrices?.source ? `Source: ${livePrices.source}` : 'Using configured rates'}
                {livePrices?.timestamp ? ` · ${new Date(livePrices.timestamp).toLocaleTimeString()}` : ''}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='p-3 bg-gray-50 rounded border'>
                <p className='text-sm text-gray-600 mb-2'>Metal Rate (24K) per gram</p>
                <FormField
                  label=''
                  value={metalLiveRate}
                  onChange={e => {
                    const value = parseFloat(e.target.value) || 0;
                    // If value equals current configured rate, clear custom rate
                    if (value === liveMetalRate) {
                      updateField('customMetalRate', undefined);
                      setIsCustomMetalRateOverride(false);
                    } else {
                      updateField('customMetalRate', value);
                      setIsCustomMetalRateOverride(true);
                    }
                  }}
                  type='number'
                  placeholder={liveMetalRate.toString()}
                  disabled={userRole === 'vendor'}
                  readOnly={userRole === 'vendor'}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  {isCustomMetalRateOverride
                    ? `Stored rate${liveMetalRate !== formData.customMetalRate ? ` · Configured: ${formatINR(liveMetalRate)}` : ''}`
                    : `Configured: ${formatINR(liveMetalRate)}`}
                </p>
              </div>
              <div className='p-3 bg-gray-50 rounded border'>
                <p className='text-sm text-gray-600'>Selected Purity</p>
                <p className='text-lg font-semibold'>{selectedPurityLabel}</p>
                <p className='text-xs text-gray-500'>{(purityPercent * 100).toFixed(1)}%</p>
              </div>
              <div className='p-3 bg-gray-50 rounded border'>
                <p className='text-sm text-gray-600'>Purity Rate</p>
                <p className='text-2xl font-semibold text-[#1F3B29]'>{formatINR(purityMetalRate)}</p>
              </div>
              <div className='p-3 bg-gray-50 rounded border'>
                <p className='text-sm text-gray-600'>{formData.productType} Weight (Gram)</p>
                <p className='text-2xl font-semibold text-[#1F3B29]'>{goldWeightGram || 0}</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Less Diamond Weight (ct)</p>
                <p className='text-lg font-semibold text-[#1F3B29]'>{totalDiamondWeightCt.toFixed(2)}</p>
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Net {formData.productType} Weight (Gram)</p>
                <p className='text-lg font-semibold text-[#1F3B29]'>{netGoldWeight.toFixed(2)}</p>
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Metal Value</p>
                <p className='text-lg font-semibold text-[#1F3B29]'>{formatINR(goldValue)}</p>
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Making Charges per gram</p>
                <FormField
                  label=''
                  value={formData.makingChargePerGram}
                  onChange={e => updateField('makingChargePerGram', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='500'
                />
                <p className='text-xs text-gray-500 mt-1'>Value: {formatINR(makingChargesValue)}</p>
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Diamonds Value (auto)</p>
                <p className='text-lg font-semibold text-[#1F3B29]'>{formatINR(diamondValueAuto)}</p>
              </div>
            </div>

          </Card>
        )}

        {/* Price, Discount & GST - For All Product Types */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Price & Tax Details
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Show Price field for Gemstone/Imitation */}
            {isSimpleProductType && (
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Price (₹)</p>
                <FormField
                  label=''
                  value={formData.gemstonePrice}
                  onChange={e => updateField('gemstonePrice', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 50000'
                  disabled={userRole === 'vendor'}
                  readOnly={userRole === 'vendor'}
                />
                {userRole === 'vendor' && (
                  <p className='text-xs text-blue-600 mt-1'>Set by Admin</p>
                )}
              </div>
            )}
            
            {/* Show Price field for Diamonds product type */}
            {formData.productType === 'Diamonds' && (
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Price (₹)</p>
                <FormField
                  label=''
                  value={formData.diamondsPrice}
                  onChange={e => updateField('diamondsPrice', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 50000'
                  disabled={userRole === 'vendor'}
                  readOnly={userRole === 'vendor'}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Price will be added to Total Diamonds Value
                </p>
                {userRole === 'vendor' && (
                  <p className='text-xs text-blue-600 mt-1'>Set by Admin</p>
                )}
              </div>
            )}
            
            {/* Discount field for all product types */}
            <div className='p-3 bg-white rounded border'>
              <p className='text-sm text-gray-600'>Discount (%)</p>
              <FormField
                label=''
                value={formData.discount}
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  // Validate discount is between 0 and 100
                  if (value > 100) {
                    toast({
                      title: 'Invalid Discount',
                      description: 'Discount percentage cannot exceed 100%',
                      variant: 'destructive',
                    });
                    updateField('discount', 100);
                  } else if (value < 0) {
                    updateField('discount', 0);
                  } else {
                    updateField('discount', value);
                  }
                }}
                type='number'
                placeholder='Example: 5'
                min='0'
                max='100'
                step='0.01'
              />
              <p className='text-xs text-gray-500 mt-1'>Enter percentage (0-100%). Stored for invoice calculation</p>
            </div>
            
            {/* GST field for all product types */}
            <div className='p-3 bg-white rounded border'>
              <p className='text-sm text-gray-600'>GST Rate</p>
              <Dropdown
                labelMain='GST'
                value={String(formData.gstRate)}
                onChange={option => updateField('gstRate', parseFloat(option.value) || 0)}
                options={GST_OPTIONS}
                placeholder='Select GST'
              />
              <p className='text-xs text-gray-500 mt-1'>Stored for invoice calculation (website)</p>
            </div>
            
            {/* Platform Commission: show only when 4 fields selected AND combination matched */}
            {showPlatformCommissionField && (
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Platform Commission (%)</p>
                <FormField
                  label=''
                  value={formData.platformCommissionRate}
                  onChange={e => updateField('platformCommissionRate', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='0'
                  disabled={userRole === 'vendor'}
                  readOnly={userRole === 'vendor'}
                />
                {formData.platformCommissionRate > 0 && (
                  <p className='text-xs text-gray-500 mt-1'>Value: {formatINR(platformCommissionValue)}</p>
                )}
                {userRole === 'vendor' && (
                  <p className='text-xs text-blue-600 mt-1 cursor-pointer hover:underline' onClick={() => window.open('/admin/pricing-settings', '_blank')}>
                    Set by Admin
                  </p>
                )}
              </div>
            )}

            {/* Vendor Commission (vendor only): show only when 4 fields selected AND combination matched */}
            {showVendorCommissionField && (
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Vendor Commission (%)</p>
                <FormField
                  label=''
                  value={formData.vendorCommissionRate}
                  onChange={e => updateField('vendorCommissionRate', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='0'
                />
                {formData.vendorCommissionRate > 0 && (
                  <p className='text-xs text-gray-500 mt-1'>Value: {formatINR(vendorCommissionValue)}</p>
                )}
                <p className='text-xs text-blue-600 mt-1 cursor-pointer hover:underline' onClick={() => window.open('/admin/vendor-commission', '_blank')}>
                  Set in Commission Settings
                </p>
              </div>
            )}
          </div>

          {/* Price Summary for all product types */}
          <div className='mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200'>
            <h3 className='text-lg font-semibold mb-4'>Price Summary</h3>
            {isSimpleProductType ? (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Price</span>
                  <span>{formatINR(gemstoneValue)}</span>
                </div>
                {formData.platformCommissionRate > 0 && (
                  <div className='flex justify-between text-sm text-gray-700'>
                    <span>Platform Commission</span>
                    <span>{formatINR(platformCommissionValue)}</span>
                  </div>
                )}
                {userRole === 'vendor' && formData.vendorCommissionRate > 0 && (
                  <div className='flex justify-between text-sm text-gray-700'>
                    <span>Vendor Commission</span>
                    <span>{formatINR(vendorCommissionValue)}</span>
                  </div>
                )}
                <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t'>
                  <span>Total Amount</span>
                  <span>{formatINR(subTotal)}</span>
                </div>
                <div className='text-xs text-gray-500 mt-2 pt-2 border-t'>
                  <p>Note: Discount ({formData.discount || 0}%) and GST ({formData.gstRate || 0}%) are stored and will be calculated on the invoice when the website is ready.</p>
                </div>
              </div>
            ) : formData.productType === 'Diamonds' && !hasMetalsInDiamonds ? (
              <div className='space-y-2'>
                <div className='flex justify-between font-semibold text-gray-900'>
                  <span>Total Diamonds Value</span>
                  <span>{formatINR(diamondValueAuto)}</span>
                </div>
                <div className='text-xs text-gray-500 mt-2 pt-2 border-t'>
                  <p>Note: Discount ({formData.discount || 0}%) and GST ({formData.gstRate || 0}%) are stored and will be calculated on the invoice when the website is ready.</p>
                </div>
              </div>
            ) : formData.productType === 'Diamonds' && hasMetalsInDiamonds ? (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Total Metals Value</span>
                  <span>{formatINR(diamondsProductMetalValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Total Diamonds Value</span>
                  <span>{formatINR(diamondValueAuto)}</span>
                </div>
                {formData.platformCommissionRate > 0 && (
                  <div className='flex justify-between text-sm text-gray-700'>
                    <span>Platform Commission</span>
                    <span>{formatINR(platformCommissionValue)}</span>
                  </div>
                )}
                {userRole === 'vendor' && formData.vendorCommissionRate > 0 && (
                  <div className='flex justify-between text-sm text-gray-700'>
                    <span>Vendor Commission</span>
                    <span>{formatINR(vendorCommissionValue)}</span>
                  </div>
                )}
                <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t'>
                  <span>Total Amount</span>
                  <span>{formatINR(subTotal)}</span>
                </div>
                <div className='text-xs text-gray-500 mt-2 pt-2 border-t'>
                  <p>Note: Discount ({formData.discount || 0}%) and GST ({formData.gstRate || 0}%) are stored and will be calculated on the invoice when the website is ready.</p>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Metal Value</span>
                  <span>{formatINR(goldValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Making Charges</span>
                  <span>{formatINR(makingChargesValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Diamonds Value</span>
                  <span>{formatINR(diamondValueAuto)}</span>
                </div>
                {formData.platformCommissionRate > 0 && (
                  <div className='flex justify-between text-sm text-gray-700'>
                    <span>Platform Commission</span>
                    <span>{formatINR(platformCommissionValue)}</span>
                  </div>
                )}
                {userRole === 'vendor' && formData.vendorCommissionRate > 0 && (
                  <div className='flex justify-between text-sm text-gray-700'>
                    <span>Vendor Commission</span>
                    <span>{formatINR(vendorCommissionValue)}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Other Charges</span>
                  <span>{formatINR(extraCharges)}</span>
                </div>
                <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t'>
                  <span>Total Amount</span>
                  <span>{formatINR(subTotal)}</span>
                </div>
                <div className='text-xs text-gray-500 mt-2 pt-2 border-t'>
                  <p>Note: Discount ({formData.discount || 0}%) and GST ({formData.gstRate || 0}%) are stored and will be calculated on the invoice when the website is ready.</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading} className=' text-white'>
            {loading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {productId ? 'Updating...' : 'Creating...'}
              </>
            ) : productId ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
