'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Package, Upload, Plus, Trash2 } from 'lucide-react';
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

// Design Type Options
const DESIGN_TYPE_OPTIONS = [
  { label: 'Plain', value: 'Plain' },
  { label: 'Casting', value: 'Casting' },
  { label: 'Handmade', value: 'Handmade' },
  { label: 'Rajkot', value: 'Rajkot' },
  { label: 'Agra Payal', value: 'Agra Payal' },
  { label: 'Fancy Payal', value: 'Fancy Payal' },
] as const;

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
  diamondPrice?: number;
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
  ratti: number;
  specificGravity: number;
  hardness: number;
  refractiveIndex: number;
  magnification: number;
  remarks: string;
  gemstoneDescription: string;

  // Images
  mainImage: string;
  certificateImages: string[];
  gemstonePhoto: string;
  gemstoneCertificate: string;

  // Basic Product Info
  name: string;
  urlSlug: string;
  weight: number;

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
  customMetalRate?: number; // Custom metal rate to override live price
}

interface ProductFormPageProps {
  productId?: string;
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
  const [uploadingDiamondId, setUploadingDiamondId] = useState<string | null>(null);
  const [livePrices, setLivePrices] = useState<{
    gold: number;
    silver?: number;
    platinum?: number;
    source?: string;
    timestamp?: string;
    error?: string;
  } | null>(null);
  const [uploadingProductImages, setUploadingProductImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    vendorCommissionRate: 5,
    platformCommissionRate: 2,
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
  });

  useEffect(() => {
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
    fetchLivePrices();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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

  const fetchLivePrices = async () => {
    try {
      const response = await fetch('/api/live-prices');
      if (response.ok) {
        const data = await response.json();
        setLivePrices(data);
      }
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
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
          vendorCommissionRate: product.vendorCommissionRate ?? 5,
          platformCommissionRate: product.platformCommissionRate ?? 2,
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
          customMetalRate: product.customMetalRate ?? undefined,
          diamonds: product.diamonds || [],
        });
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
      const nextErrors: Record<string, string> = {};
      if (!formData.productType) nextErrors.productType = 'This field is required';
      if (!formData.category) nextErrors.category = 'This field is required';
      if (!formData.designType) nextErrors.designType = 'This field is required';
      if (!formData.name?.trim()) nextErrors.name = 'This field is required';
      if (!computedSlug) nextErrors.urlSlug = 'This field is required';
      if (!computedSku) nextErrors.sku = 'This field is required';
      if (!formData.hsnCode?.trim()) nextErrors.hsnCode = 'This field is required';
      if (!selectedPurityValue) nextErrors.silverPurity = 'This field is required';
      if (!formData.weight || formData.weight <= 0) nextErrors.weight = 'This field is required';
      if (!formData.shortDescription?.trim() && !formData.description?.trim()) nextErrors.description = 'Description is required';
      if (!formData.seoTitle?.trim()) nextErrors.seoTitle = 'This field is required';
      if (!formData.seoDescription?.trim()) nextErrors.seoDescription = 'This field is required';
      if (!formData.seoTags?.trim()) nextErrors.seoTags = 'This field is required';

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

      const payload = {
        ...formData,
        product_type: formData.productType,
        sku: computedSku,
        urlSlug: computedSlug,
        shortDescription: formData.shortDescription || formData.description.substring(0, 200),
        longDescription: formData.description,
        specifications: formData.specifications,
        images: formData.images,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoTags: formData.seoTags,
        hsnCode: formData.hsnCode,
        isB2C: true,
        hasGold: ['Gold', 'Platinum'].includes(formData.productType),
        hasSilver: formData.productType === 'Silver',
        hasDiamond: formData.productType === 'Diamonds' || formData.lessDiamondWeight > 0,
        taxRate: formData.gstRate || 3,
        stock: 1,
        regularPrice: 0,
        sellingPrice: 0,
        costPrice: 0,
        price: totalAmount,
        subTotal: subTotal,
        totalAmount: totalAmount,
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
        toast({
          title: 'Success',
          description: productId ? 'Product updated successfully' : 'Product created successfully',
          variant: 'success',
        });
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
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Use custom metal rate if provided, otherwise use live rate
  const liveMetalRate =
    formData.productType === 'Silver'
      ? livePrices?.silver ?? 0
      : formData.productType === 'Platinum'
      ? livePrices?.platinum ?? 0
      : livePrices?.gold ?? 0;
  const metalLiveRate = formData.customMetalRate ?? liveMetalRate;
  // Prefer the explicit Purity dropdown value; fallback to karat if not set.
  const selectedPurityValue = formData.silverPurity || formData.goldPurity;

  // Show the label from purity options first, then karat options as fallback.
  const selectedPurityLabel = getOptionLabel([...purities, ...karats], selectedPurityValue);

  const purityPercent = parsePurityPercent(selectedPurityValue || '24kt');
  const purityMetalRate = Math.round(metalLiveRate * purityPercent);
  const goldWeightGram = formData.weight || 0;
  const totalDiamondWeightCt = formData.diamonds.reduce((sum, d) => sum + (d.diamondWeight || 0), 0);
  const netGoldWeight = Math.max(0, goldWeightGram - totalDiamondWeightCt - (formData.lessStoneWeight || 0));
  const goldValue = netGoldWeight * purityMetalRate;
  const vendorCommissionValue = netGoldWeight * (formData.vendorCommissionRate / 100) * metalLiveRate;
  const makingChargesValue = netGoldWeight * formData.makingChargePerGram;
  const diamondValueAuto = formData.diamonds.reduce((sum, d) => sum + (d.diamondPrice || 0), 0);
  const platformCommissionBase = goldValue + vendorCommissionValue + makingChargesValue + diamondValueAuto;
  const platformCommissionValue = platformCommissionBase * (formData.platformCommissionRate / 100);
  const extraCharges = formData.otherCharges ?? 0;
  const subTotal = goldValue + vendorCommissionValue + makingChargesValue + diamondValueAuto + platformCommissionValue + extraCharges;
  const gst = subTotal * ((formData.gstRate || 0) / 100);
  const totalAmount = subTotal + gst;

  const showGoldFields = ['Gold', 'Silver', 'Platinum'].includes(formData.productType);
  const showDiamondFields = formData.productType === 'Diamonds' || showGoldFields;
  const showGemstoneFields = formData.productType === 'Gemstone';

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

        {/* Design Type, Karat, Purity, Metal Color Fields */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <Package className='w-5 h-5' />
            Product Details
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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

                  const newDiamond: Diamond = {
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
                    diamondPrice: 0,
                  };
                  setFormData(prev => ({
                    ...prev,
                    diamonds: [...prev.diamonds, newDiamond],
                  }));
                }}
                className='text-white'>
                <Plus className='w-4 h-4 mr-2' />
                Add Diamond
              </Button>
            </div>

            {formData.diamonds.length === 0 ? (
              <p className='text-gray-500 text-center py-8'>No diamonds added. Click "Add Diamond" to add one.</p>
            ) : (
              <div className='space-y-6'>
                {formData.diamonds.map((diamond, index) => (
                  <Card key={diamond.id} className='p-4 border-2 border-gray-200'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='font-semibold text-lg'>Diamond {index + 1}</h3>
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
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, diamondWeight: parseFloat(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 0.50'
                      />

                      <FormField
                        label='Diamond Price (₹)'
                        value={diamond.diamondPrice || 0}
                        onChange={e => {
                          const updatedDiamonds = formData.diamonds.map(d =>
                            d.id === diamond.id ? { ...d, diamondPrice: parseFloat(e.target.value) || 0 } : d
                          );
                          setFormData(prev => ({ ...prev, diamonds: updatedDiamonds }));
                        }}
                        type='number'
                        placeholder='Example: 20000'
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
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Total Diamonds Summary - Automatic Calculation */}
            {formData.diamonds.length > 0 && (
              <div className='mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200'>
                <h3 className='text-lg font-semibold mb-4'>Total Summary</h3>
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

        {/* Gemstone Fields - Will be added later */}
        {false && showGemstoneFields && (
          <Card className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Gemstone Field</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Dropdown
                labelMain='Gemstone Name'
                value={formData.gemstoneName}
                onChange={option => updateField('gemstoneName', option.value)}
                options={[...GEMSTONE_NAME_OPTIONS]}
                placeholder='Example: Ruby (Manik), Emerald (Panna)'
              />

              <FormField
                label='Report No.'
                value={formData.reportNo}
                onChange={e => updateField('reportNo', e.target.value)}
                type='text'
                placeholder='Example: RPT123456'
              />

              <FormField
                label='Certified Laboratory'
                value={formData.gemstoneCertificateLab}
                onChange={e => updateField('gemstoneCertificateLab', e.target.value)}
                type='text'
                placeholder='Example: GIA, IGI, SGL'
              />

              <FormField
                label='Colour'
                value={formData.gemstoneColour}
                onChange={e => updateField('gemstoneColour', e.target.value)}
                type='text'
                placeholder='Example: Red, Blue, Green'
              />

              <FormField
                label='Shape/Cut'
                value={formData.gemstoneShape}
                onChange={e => updateField('gemstoneShape', e.target.value)}
                type='text'
                placeholder='Example: Round, Oval, Cushion'
              />

              <FormField
                label='Dimension'
                value={formData.dimension}
                onChange={e => updateField('dimension', e.target.value)}
                type='text'
                placeholder='Example: 5x4x3 mm'
              />

              <FormField
                label='Gemstone Weight (Cts)'
                value={formData.gemstoneWeight}
                onChange={e => updateField('gemstoneWeight', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 2.5'
              />

              <FormField
                label='Price (₹)'
                value={formData.gemstonePrice}
                onChange={e => updateField('gemstonePrice', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 50000'
              />

              <FormField
                label='Ratti'
                value={formData.ratti}
                onChange={e => updateField('ratti', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 3.5'
              />

              <FormField
                label='Specific Gravity'
                value={formData.specificGravity}
                onChange={e => updateField('specificGravity', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 4.0'
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
                label='Magnification'
                value={formData.magnification}
                onChange={e => updateField('magnification', parseFloat(e.target.value) || 0)}
                type='number'
                placeholder='Example: 10x'
              />

              <div className='md:col-span-2'>
                <FormField
                  label='Remarks'
                  value={formData.remarks}
                  onChange={e => updateField('remarks', e.target.value)}
                  type='text'
                  placeholder='Example: Natural untreated gemstone'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-2'>Description</label>
                <RichTextEditor
                  label='Gemstone Description'
                  value={formData.gemstoneDescription}
                  onChange={value => updateField('gemstoneDescription', value)}
                  placeholder='Enter gemstone description...'
                />
              </div>
            </div>

            <div className='mt-4 space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Gemstone Photo</label>
                <Input
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    // Handle file upload
                  }}
                  className='cursor-pointer'
                />
                <p className='text-xs text-gray-500 mt-1'>Upload gemstone photo</p>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Gemstone Certificate (Photo)</label>
                <Input
                  type='file'
                  accept='image/*'
                  onChange={e => {
                    // Handle file upload
                  }}
                  className='cursor-pointer'
                />
                <p className='text-xs text-gray-500 mt-1'>Upload gemstone certificate image</p>
              </div>
            </div>
          </Card>
        )}

        {/* Product Images */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Product Images</h2>
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
                {livePrices?.source ? `Source: ${livePrices.source}` : 'Using live rates'}
                {livePrices?.timestamp ? ` · ${new Date(livePrices.timestamp).toLocaleTimeString()}` : ''}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='p-3 bg-gray-50 rounded border'>
                <p className='text-sm text-gray-600 mb-2'>Metal Rate (24K) per gram</p>
                <FormField
                  label=''
                  value={formData.customMetalRate ?? liveMetalRate}
                  onChange={e => {
                    const value = parseFloat(e.target.value) || 0;
                    // If value equals live rate, clear custom rate
                    if (value === liveMetalRate) {
                      updateField('customMetalRate', undefined);
                    } else {
                      updateField('customMetalRate', value);
                    }
                  }}
                  type='number'
                  placeholder={liveMetalRate.toString()}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  {formData.customMetalRate ? 'Custom rate' : `Live: ${formatINR(liveMetalRate)}`}
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
                <p className='text-sm text-gray-600'>Vendor Wastage / Commission (%)</p>
                <FormField
                  label=''
                  value={formData.vendorCommissionRate}
                  onChange={e => updateField('vendorCommissionRate', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='5'
                />
                <p className='text-xs text-gray-500 mt-1'>Value: {formatINR(vendorCommissionValue)}</p>
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
                <p className='text-sm text-gray-600'>Discount (%)</p>
                <FormField
                  label=''
                  value={formData.discount}
                  onChange={e => updateField('discount', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='Example: 5'
                />
                <p className='text-xs text-gray-500 mt-1'>Applied to total amount</p>
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Diamonds Value (auto)</p>
                <p className='text-lg font-semibold text-[#1F3B29]'>{formatINR(diamondValueAuto)}</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Platform Commission (%)</p>
                <FormField
                  label=''
                  value={formData.platformCommissionRate}
                  onChange={e => updateField('platformCommissionRate', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='2'
                />
                <p className='text-xs text-gray-500 mt-1'>Value: {formatINR(platformCommissionValue)}</p>
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>Other Charges (₹)</p>
                <FormField
                  label=''
                  value={formData.otherCharges}
                  onChange={e => updateField('otherCharges', parseFloat(e.target.value) || 0)}
                  type='number'
                  placeholder='0'
                />
              </div>
              <div className='p-3 bg-white rounded border'>
                <p className='text-sm text-gray-600'>GST Rate</p>
                <Dropdown
                  labelMain='GST'
                  value={String(formData.gstRate)}
                  onChange={option => updateField('gstRate', parseFloat(option.value) || 0)}
                  options={GST_OPTIONS}
                  placeholder='Select GST'
                />
              </div>
              <div className='p-3 bg-gray-50 rounded border space-y-2'>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Metal Value</span>
                  <span>{formatINR(goldValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Vendor Commission</span>
                  <span>{formatINR(vendorCommissionValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Making Charges</span>
                  <span>{formatINR(makingChargesValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Diamonds Value</span>
                  <span>{formatINR(diamondValueAuto)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Platform Commission</span>
                  <span>{formatINR(platformCommissionValue)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Other Charges</span>
                  <span>{formatINR(extraCharges)}</span>
                </div>
                <div className='flex justify-between font-semibold text-gray-900'>
                  <span>Sub Total</span>
                  <span>{formatINR(subTotal)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>GST ({formData.gstRate || 0}%)</span>
                  <span>{formatINR(gst)}</span>
                </div>
                <div className='flex justify-between text-lg font-bold text-[#1F3B29]'>
                  <span>Total Amount</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

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
