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

const STONE_TYPE_OPTIONS = [
  { label: 'Select Stone', value: '' },
  { label: 'No Stone', value: 'None' },
  { label: 'Diamond', value: 'Diamond' },
  { label: 'Ruby', value: 'Ruby' },
  { label: 'Emerald', value: 'Emerald' },
  { label: 'Sapphire', value: 'Sapphire' },
  { label: 'Pearl', value: 'Pearl' },
  { label: 'Amethyst', value: 'Amethyst' },
  { label: 'Topaz', value: 'Topaz' },
] as const;

const GENDER_OPTIONS = [
  { label: 'Select Gender', value: '' },
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Unisex', value: 'Unisex' },
] as const;

const SIZE_UNIT_OPTIONS = [
  { label: 'Unit', value: '' },
  { label: 'Ring Size', value: 'ring_size' },
  { label: 'Inches', value: 'inches' },
  { label: 'Centimeters', value: 'cm' },
] as const;

const MAKING_CHARGE_TYPE_OPTIONS = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed (₹)', value: 'fixed' },
] as const;

const CERTIFICATION_OPTIONS = [
  { label: 'Select Certification', value: '' },
  { label: 'GIA', value: 'GIA' },
  { label: 'IGI', value: 'IGI' },
  { label: 'BIS', value: 'BIS' },
  { label: 'SGL', value: 'SGL' },
  { label: 'GSI', value: 'GSI' },
  { label: 'None', value: 'None' },
  { label: 'Other (enter manually)', value: '__custom__' },
] as const;

const DIAMOND_CLARITY_OPTIONS = [
  { label: 'Select Clarity', value: '' },
  { label: 'IF (Internally Flawless)', value: 'IF' },
  { label: 'VVS1', value: 'VVS1' },
  { label: 'VVS2', value: 'VVS2' },
  { label: 'VS1', value: 'VS1' },
  { label: 'VS2', value: 'VS2' },
  { label: 'SI1', value: 'SI1' },
  { label: 'SI2', value: 'SI2' },
  { label: 'I1', value: 'I1' },
  { label: 'I2', value: 'I2' },
] as const;

const DIAMOND_CUT_OPTIONS = [
  { label: 'Select Cut Grade', value: '' },
  { label: 'Excellent', value: 'Excellent' },
  { label: 'Very Good', value: 'Very Good' },
  { label: 'Good', value: 'Good' },
  { label: 'Fair', value: 'Fair' },
  { label: 'Poor', value: 'Poor' },
] as const;

const DIAMOND_SHAPE_OPTIONS = [
  { label: 'Select Shape', value: '' },
  { label: 'Round', value: 'Round' },
  { label: 'Princess', value: 'Princess' },
  { label: 'Emerald', value: 'Emerald' },
  { label: 'Oval', value: 'Oval' },
] as const;

type ProductType = (typeof PRODUCT_TYPE_OPTIONS)[number]['value'] | '';
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
  // Business Type: B2C (Business to Consumer) or B2B (Business to Business)
  isB2C: boolean; // true = B2C, false = B2B (default: true for B2C)
  // Material selection - can be any combination
  hasGold: boolean; // Product contains Gold
  hasSilver: boolean; // Product contains Silver
  hasDiamond: boolean; // Product contains Diamond

  // Gold specific fields
  goldWeight: number; // Gold weight in grams
  goldPurity: '14K' | '18K' | '22K' | '24K' | ''; // Gold purity
  goldRatePerGram: number; // Gold rate per gram

  // Silver specific fields
  silverWeight: number; // Silver weight in grams
  silverPurity: '925 Silver' | '999 Silver' | ''; // Silver purity
  silverRatePerGram: number; // Silver rate per gram

  // Diamond specific fields
  diamondCarat: number; // Total diamond carat weight
  diamondRatePerCarat: number; // Diamond rate per carat
  numberOfStones: number; // Number of diamonds used

  // Legacy fields for backward compatibility (deprecated - use new fields above)
  metalType: 'Gold' | 'Silver' | 'Platinum' | 'Rose Gold' | 'White Gold' | '';
  metalPurity: '14K' | '18K' | '22K' | '24K' | '925 Silver' | '999 Silver' | '950 Platinum' | '';
  metalWeight: number; // in grams (deprecated - use goldWeight or silverWeight)
  stoneType: 'Diamond' | 'Ruby' | 'Emerald' | 'Sapphire' | 'Pearl' | 'Amethyst' | 'Topaz' | 'None' | '';
  stoneWeight: number; // in carats (deprecated - use diamondCarat)
  stoneClarity: 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2' | '';
  stoneColor: 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | '';
  stoneCut: 'Round' | 'Princess' | 'Emerald' | 'Asscher' | 'Oval' | 'Radiant' | 'Cushion' | 'Marquise' | 'Pear' | 'Heart' | '';
  // Diamond specific fields
  diamondCut: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' | '';
  numberOfStones: number; // Number of diamonds used
  diamondShape: 'Round' | 'Princess' | 'Emerald' | 'Oval' | '';
  makingCharges: number; // percentage or fixed amount
  makingChargesType: 'percentage' | 'fixed';
  certification: string; // GIA, IGI, etc.
  // Jewelry Type & Category
  jewelryType:
    | 'Ring'
    | 'Necklace'
    | 'Earrings'
    | 'Bracelet'
    | 'Pendant'
    | 'Bangle'
    | 'Chain'
    | 'Mangalsutra'
    | 'Nose Pin'
    | 'Toe Ring'
    | 'Anklet'
    | 'Brooch'
    | 'Cufflinks'
    | 'Tie Pin'
    | 'Hairpin'
    | 'Other'
    | '';
  jewelrySubType: string; // e.g., "Solitaire Ring", "Diamond Necklace", etc.

  // Chain Details (for necklaces/chains)
  chainType:
    | 'Rope'
    | 'Box'
    | 'Snake'
    | 'Cable'
    | 'Figaro'
    | 'Curb'
    | 'Singapore'
    | 'Wheat'
    | 'Ball'
    | 'Anchor'
    | 'Byzantine'
    | 'Herringbone'
    | 'Rolo'
    | 'Tennis'
    | 'Other'
    | '';
  chainLength: number; // in inches/cm
  chainLengthUnit: 'inches' | 'cm' | '';

  // Ring Details
  ringSetting:
    | 'Prong'
    | 'Bezel'
    | 'Channel'
    | 'Pave'
    | 'Tension'
    | 'Invisible'
    | 'Halo'
    | 'Three Stone'
    | 'Vintage'
    | 'Cluster'
    | 'Solitaire'
    | 'Other'
    | '';
  ringSize: string; // US/UK/India ring size
  ringSizeSystem: 'US' | 'UK' | 'India' | 'EU' | '';
  ringWidth: number; // band width in mm
  ringStyle: 'Classic' | 'Modern' | 'Vintage' | 'Contemporary' | 'Traditional' | 'Art Deco' | 'Other' | '';

  // Earring Details
  earringType: 'Stud' | 'Hoops' | 'Drops' | 'Chandelier' | 'Huggies' | 'Threader' | 'Ear Cuffs' | 'Climbers' | 'Jackets' | 'Other' | '';
  earringBackType: 'Push Back' | 'Screw Back' | 'Leverback' | 'Hinged' | 'Clip On' | 'Other' | '';

  // Bracelet Details
  braceletType: 'Chain' | 'Bangle' | 'Cuff' | 'Tennis' | 'Charm' | 'Link' | 'Other' | '';
  braceletLength: number;
  braceletLengthUnit: 'inches' | 'cm' | '';
  braceletWidth: number; // in mm

  // Design & Style
  designStyle:
    | 'Traditional'
    | 'Modern'
    | 'Contemporary'
    | 'Vintage'
    | 'Art Deco'
    | 'Minimalist'
    | 'Ornate'
    | 'Antique'
    | 'Fusion'
    | 'Other'
    | '';
  finishType: 'Polished' | 'Matte' | 'Brushed' | 'Hammered' | 'Textured' | 'Oxidized' | 'Mixed' | 'Other' | '';
  pattern: string; // e.g., "Floral", "Geometric", "Abstract"

  // Stone Setting Details
  stoneSetting: 'Prong' | 'Bezel' | 'Channel' | 'Pave' | 'Invisible' | 'Tension' | 'Flush' | 'Gypsy' | 'Other' | '';
  stoneArrangement: 'Single' | 'Cluster' | 'Halo' | 'Three Stone' | 'Five Stone' | 'Eternity' | 'Scattered' | 'Other' | '';

  // Size & Dimensions
  size: string; // ring size, chain length, etc.
  sizeUnit: 'inches' | 'cm' | 'ring_size' | 'mm' | '';
  totalWeight: number; // Total jewelry weight in grams
  stoneWeight: number; // Total stone weight (if different from diamondCarat)

  // Demographics
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids' | '';

  // Quality & Certification
  hallmarked: boolean;
  bis_hallmark: boolean;
  hallmarkNumber: string;
  certification: string; // GIA, IGI, etc.
  certificationNumber: string;

  // Customization & Services
  customizable: boolean;
  engraving_available: boolean;
  engravingOptions: string; // e.g., "Name, Date, Initials"
  gift_wrapping: boolean;
  resizing_available: boolean;
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
  featured: boolean;
  trending: boolean;
  allowReviews: boolean;
  vendor: string;
  specifications?: Array<{ key: string; value: string }>; // Product specifications as key-value pairs
  createdAt?: string; // Added for potential API response
  updatedAt?: string; // Added for potential API response
}

const getMetalVariantOptions = (productType: ProductType) => {
  const baseOption = [{ label: 'Auto-selected from Product Type', value: '' }];
  switch (productType) {
    case 'Gold':
      return [
        ...baseOption,
        { label: 'Yellow Gold', value: 'Gold' },
        { label: 'Rose Gold', value: 'Rose Gold' },
        { label: 'White Gold', value: 'White Gold' },
      ];
    case 'Silver':
      return [...baseOption, { label: 'Silver', value: 'Silver' }];
    case 'Platinum':
      return [...baseOption, { label: 'Platinum', value: 'Platinum' }];
    default:
      return [
        ...baseOption,
        { label: 'Yellow Gold', value: 'Gold' },
        { label: 'Rose Gold', value: 'Rose Gold' },
        { label: 'White Gold', value: 'White Gold' },
        { label: 'Silver', value: 'Silver' },
        { label: 'Platinum', value: 'Platinum' },
      ];
  }
};

const getMetalPurityOptions = (metalType: Product['metalType']) => {
  const baseOption = [{ label: 'Select Purity', value: '' }];
  if (!metalType) return baseOption;
  const normalized = metalType.toLowerCase().includes('gold') ? 'Gold' : metalType;

  if (normalized === 'Gold') {
    return [
      ...baseOption,
      { label: '24K (99.9% Pure)', value: '24K' },
      { label: '22K (91.6% Pure)', value: '22K' },
      { label: '18K (75% Pure)', value: '18K' },
      { label: '14K (58.3% Pure)', value: '14K' },
    ];
  }

  if (normalized === 'Silver') {
    return [
      ...baseOption,
      { label: '999 Silver (99.9% Pure)', value: '999 Silver' },
      { label: '925 Silver (92.5% Pure)', value: '925 Silver' },
    ];
  }

  if (normalized === 'Platinum') {
    return [...baseOption, { label: '950 Platinum (95% Pure)', value: '950 Platinum' }];
  }

  return baseOption;
};

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
  isB2C: true, // Default to B2C (Business to Consumer)
  // Material selection - flexible combinations
  hasGold: false,
  hasSilver: false,
  hasDiamond: false,
  // Gold specific fields
  goldWeight: 0,
  goldPurity: '',
  goldRatePerGram: 0,
  // Silver specific fields
  silverWeight: 0,
  silverPurity: '',
  silverRatePerGram: 0,
  // Diamond specific fields
  diamondCarat: 0,
  diamondRatePerCarat: 0,
  numberOfStones: 0,
  // Legacy fields for backward compatibility
  metalType: '',
  metalPurity: '',
  metalWeight: 0,
  stoneType: '',
  stoneWeight: 0,
  stoneClarity: '',
  stoneColor: '',
  stoneCut: '',
  diamondCut: '',
  diamondShape: '',
  makingCharges: 15, // 15% default making charges
  makingChargesType: 'percentage',
  // Jewelry Type & Category
  jewelryType: '',
  jewelrySubType: '',
  // Chain Details
  chainType: '',
  chainLength: 0,
  chainLengthUnit: '',
  // Ring Details
  ringSetting: '',
  ringSize: '',
  ringSizeSystem: '',
  ringWidth: 0,
  ringStyle: '',
  // Earring Details
  earringType: '',
  earringBackType: '',
  // Bracelet Details
  braceletType: '',
  braceletLength: 0,
  braceletLengthUnit: '',
  braceletWidth: 0,
  // Design & Style
  designStyle: '',
  finishType: '',
  pattern: '',
  // Stone Setting Details
  stoneSetting: '',
  stoneArrangement: '',
  // Size & Dimensions
  size: '',
  sizeUnit: '',
  totalWeight: 0,
  stoneWeight: 0,
  // Demographics
  gender: '',
  // Quality & Certification
  hallmarked: false,
  bis_hallmark: false,
  hallmarkNumber: '',
  certification: '',
  certificationNumber: '',
  // Customization & Services
  customizable: false,
  engraving_available: false,
  engravingOptions: '',
  gift_wrapping: true,
  resizing_available: false,
  baseMaterialCost: 0,
  livePriceEnabled: true, // Default ON for jewelry products
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
  featured: false,
  trending: false,
  allowReviews: true,
  vendor: 'Main Store',
  specifications: [],
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
  const [activeTab, setActiveTab] = useState<'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other' | 'preview'>(
    'basic'
  );
  const [tabsWithErrors, setTabsWithErrors] = useState<Set<'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'>>(
    new Set()
  );
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [loadingTags, setLoadingTags] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [useCustomCertification, setUseCustomCertification] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

  // Generate SKU from product name
  const generateSKU = (productName: string): string => {
    if (!productName?.trim()) return '';
    
    // Remove special characters and split into words
    const words = productName
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/);
    
    // Create prefix from first letters of each word (max 3 words) or first 3-6 chars if single word
    let prefix = '';
    if (words.length === 1) {
      prefix = words[0].substring(0, Math.min(6, words[0].length));
    } else {
      prefix = words.slice(0, 3).map(w => w[0]).join('');
      // If too short, add more letters from first word
      if (prefix.length < 3 && words[0].length > 1) {
        prefix = words[0].substring(0, 4);
      }
    }
    
    // Generate random 5-digit number
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    
    return `${prefix}-${randomNum}`;
  };

  // Auto-generate SKU when product name changes
  useEffect(() => {
    const newSku = generateSKU(formData.name);
    if (newSku !== formData.sku) {
      setFormData(prev => ({ ...prev, sku: newSku }));
    }
  }, [formData.name]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    fetchVendors();
    fetchCategories();
    fetchTags();
    fetchBrands();
  }, [productId]);

  // Auto-fetch live prices when Pricing tab is accessed (only if jewelry details are filled)
  useEffect(() => {
    if (activeTab === 'pricing' && formData.livePriceEnabled) {
      // Check if basic jewelry details are filled
      const hasJewelryDetails =
        (formData.hasGold && formData.goldWeight > 0 && formData.goldPurity) ||
        (formData.hasSilver && formData.silverWeight > 0 && formData.silverPurity) ||
        (formData.hasDiamond && formData.diamondCarat > 0);

      if (hasJewelryDetails) {
        console.log('[v0] Auto-fetching live prices - jewelry details available');
        fetchLivePrices();
      } else {
        console.log('[v0] Cannot fetch live prices - jewelry details incomplete');
      }
    }
  }, [
    activeTab,
    formData.livePriceEnabled,
    formData.hasGold,
    formData.goldWeight,
    formData.goldPurity,
    formData.hasSilver,
    formData.silverWeight,
    formData.silverPurity,
    formData.hasDiamond,
    formData.diamondCarat,
  ]);

  // Auto-calculate pricing when live prices are updated or jewelry fields change
  useEffect(() => {
    if (formData.livePriceEnabled && livePrices.gold > 0) {
      console.log('[v0] Auto-calculating pricing with live rates');
      calculateDetailedPricing();
    }
  }, [
    livePrices,
    formData.livePriceEnabled,
    formData.metalType,
    formData.metalPurity,
    formData.metalWeight,
    formData.makingCharges,
    formData.stoneCost,
    formData.otherCharges,
    formData.profitMargin,
  ]);

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

  /**
   * Comprehensive Price Calculation Function for Jewelry Products
   * Implements exact calculation logic as per requirements:
   * 1. Calculate fine metal weight (metal weight × purity percentage)
   * 2. If diamonds present, subtract diamond weight from metal weight first
   * 3. Calculate metal price (fine weight × live rate)
   * 4. Calculate making charges (metal weight × rate per gram, default 500)
   * 5. Calculate vendor wastage (metal weight × 5% × metal rate)
   * 6. Calculate diamond price (diamond weight × diamond rate)
   * 7. Add fixed charges: Hallmark (150), Shipping (200), Insurance (500), Packing (100)
   * 8. Calculate subtotal
   * 9. Calculate platform charges (2% of subtotal)
   * 10. Calculate amount (subtotal + platform charges)
   * 11. Calculate GST (3% of amount)
   * 12. Calculate total final price
   */
  const calculateTotalPrice = (): {
    // Metal calculations
    goldWeight: number;
    silverWeight: number;
    netGoldWeight: number;
    netSilverWeight: number;
    goldPurityPercentage: number;
    silverPurityPercentage: number;
    fineGoldWeight: number;
    fineSilverWeight: number;
    goldPrice: number;
    silverPrice: number;
    metalPrice: number;

    // Diamond calculations
    diamondWeight: number;
    diamondPrice: number;

    // Charges
    makingCharges: number;
    vendorWastage: number;
    hallmarkCharges: number;
    shippingCharges: number;
    insuranceCharges: number;
    packingCharges: number;

    // Totals
    subtotal: number;
    platformCharges: number;
    amount: number;
    gstAmount: number;
    totalFinalPrice: number;

    // Additional for display
    totalCostPrice: number;
    profitAmount: number;
    sellingPrice: number;
    mrp: number;

    // Legacy fields
    metalCost: number;
    stoneCost: number;
    otherCharges: number;
    finalPrice: number;
    makingChargeAmount: number;
    extraCharges: number;
  } => {
    // Constants for fixed charges
    const HALLMARK_CHARGES = 150;
    const SHIPPING_CHARGES = 200;
    const INSURANCE_CHARGES = 500;
    const PACKING_CHARGES = 100;
    const MAKING_CHARGES_RATE_PER_GRAM = 500; // Default making charges rate per gram
    const VENDOR_WASTAGE_PERCENTAGE = 5; // 5% vendor wastage
    const PLATFORM_CHARGES_PERCENTAGE = 2; // 2% platform charges
    const GST_PERCENTAGE = formData.taxRate || 3; // 3% GST (default)

    // Get metal weights and rates
    const goldWeight = formData.hasGold && formData.goldWeight > 0 ? formData.goldWeight : 0;
    const silverWeight = formData.hasSilver && formData.silverWeight > 0 ? formData.silverWeight : 0;
    const goldRate = formData.hasGold && formData.goldRatePerGram > 0 ? formData.goldRatePerGram : 0;
    const silverRate = formData.hasSilver && formData.silverRatePerGram > 0 ? formData.silverRatePerGram : 0;

    // Get diamond weight
    // Note: Field is named diamondCarat but examples use grams (0.45g, 0.80g)
    // Assuming the field value is already in grams for calculation purposes
    // If your form stores carats, convert: diamondWeight = diamondCarat * 0.2 (1 carat = 0.2 grams)
    const diamondWeight = formData.hasDiamond && formData.diamondCarat > 0 ? formData.diamondCarat : 0;
    const diamondRate = formData.hasDiamond && formData.diamondRatePerCarat > 0 ? formData.diamondRatePerCarat : 0;

    // Calculate purity percentages
    // Note: 22K is typically 91.6% but examples use 92%, using 92% to match requirements
    let goldPurityPercentage = 0;
    if (formData.hasGold && formData.goldPurity) {
      switch (formData.goldPurity) {
        case '24K':
          goldPurityPercentage = 99.9;
          break;
        case '22K':
          goldPurityPercentage = 92.0;
          break; // Using 92% to match example calculations
        case '18K':
          goldPurityPercentage = 75.0;
          break;
        case '14K':
          goldPurityPercentage = 58.3;
          break;
        default:
          goldPurityPercentage = 0;
      }
    }

    let silverPurityPercentage = 0;
    if (formData.hasSilver && formData.silverPurity) {
      switch (formData.silverPurity) {
        case '999 Silver':
          silverPurityPercentage = 99.9;
          break;
        case '925 Silver':
          silverPurityPercentage = 92.5;
          break;
        default:
          silverPurityPercentage = 0;
      }
    }

    // Calculate net metal weight (subtract diamond weight if diamonds present)
    const netGoldWeight = goldWeight > 0 && diamondWeight > 0 ? Math.max(0, goldWeight - diamondWeight) : goldWeight;
    const netSilverWeight = silverWeight > 0 && diamondWeight > 0 ? Math.max(0, silverWeight - diamondWeight) : silverWeight;

    // Calculate fine metal weight (net weight × purity percentage)
    const fineGoldWeight = netGoldWeight * (goldPurityPercentage / 100);
    const fineSilverWeight = netSilverWeight * (silverPurityPercentage / 100);

    // Calculate metal prices (fine weight × live rate)
    const goldPrice = fineGoldWeight * goldRate;
    const silverPrice = fineSilverWeight * silverRate;
    const metalPrice = goldPrice + silverPrice;

    // Calculate making charges
    // Per requirements: Making charges = metal weight × rate per gram (e.g., 10 × 500 = 5000)
    // Use the original metal weight (before subtracting diamond weight) for making charges
    const totalMetalWeight = goldWeight + silverWeight;
    let makingCharges = 0;

    if (formData.makingChargesType === 'fixed' && formData.makingCharges > 0) {
      // If fixed amount is provided, use it directly
      makingCharges = formData.makingCharges;
    } else if (formData.makingChargesType === 'percentage' && formData.makingCharges > 0) {
      // If percentage, calculate based on metal cost
      makingCharges = metalPrice * (formData.makingCharges / 100);
    } else {
      // Default: Use per-gram rate (metal weight × rate per gram)
      // This matches the requirement: "Making charges = 10 × 500 = 5000"
      makingCharges = totalMetalWeight * MAKING_CHARGES_RATE_PER_GRAM;
    }

    // Calculate vendor wastage/commission (metal weight × 5% × metal rate)
    // Use the base metal rate (not purity-adjusted) for wastage calculation
    const baseGoldRate = formData.hasGold && livePrices.gold > 0 ? livePrices.gold : goldRate;
    const baseSilverRate = formData.hasSilver && livePrices.silver > 0 ? livePrices.silver : silverRate;
    const vendorWastageGold = goldWeight * (VENDOR_WASTAGE_PERCENTAGE / 100) * baseGoldRate;
    const vendorWastageSilver = silverWeight * (VENDOR_WASTAGE_PERCENTAGE / 100) * baseSilverRate;
    const vendorWastage = vendorWastageGold + vendorWastageSilver;

    // Calculate diamond price (diamond weight × diamond rate)
    const diamondPrice = diamondWeight * diamondRate;

    // Fixed charges
    const hallmarkCharges = formData.hallmarked || formData.bis_hallmark ? HALLMARK_CHARGES : 0;
    const shippingCharges = formData.free_shipping ? 0 : SHIPPING_CHARGES;
    const insuranceCharges = INSURANCE_CHARGES;
    const packingCharges = PACKING_CHARGES;

    // Calculate subtotal (before platform charges)
    const subtotal =
      metalPrice +
      makingCharges +
      vendorWastage +
      diamondPrice +
      hallmarkCharges +
      shippingCharges +
      insuranceCharges +
      packingCharges +
      (formData.otherCharges || 0);

    // Calculate platform charges (2% of subtotal)
    const platformCharges = subtotal * (PLATFORM_CHARGES_PERCENTAGE / 100);

    // Calculate amount (subtotal + platform charges)
    const amount = subtotal + platformCharges;

    // Calculate GST (3% of amount)
    const gstAmount = amount * (GST_PERCENTAGE / 100);

    // Calculate total final price
    const totalFinalPrice = amount + gstAmount;

    // Additional calculations for display
    const totalCostPrice = totalFinalPrice;
    const profitAmount = totalCostPrice * ((formData.profitMargin || 0) / 100);
    const sellingPrice = totalCostPrice + profitAmount;
    const mrp = sellingPrice * 1.12; // 12% higher than selling price

    return {
      // Metal calculations
      goldWeight,
      silverWeight,
      netGoldWeight,
      netSilverWeight,
      goldPurityPercentage,
      silverPurityPercentage,
      fineGoldWeight,
      fineSilverWeight,
      goldPrice: Math.round(goldPrice),
      silverPrice: Math.round(silverPrice),
      metalPrice: Math.round(metalPrice),

      // Diamond calculations
      diamondWeight,
      diamondPrice: Math.round(diamondPrice),

      // Charges
      makingCharges: Math.round(makingCharges),
      vendorWastage: Math.round(vendorWastage),
      hallmarkCharges: Math.round(hallmarkCharges),
      shippingCharges: Math.round(shippingCharges),
      insuranceCharges: Math.round(insuranceCharges),
      packingCharges: Math.round(packingCharges),

      // Totals
      subtotal: Math.round(subtotal),
      platformCharges: Math.round(platformCharges),
      amount: Math.round(amount),
      gstAmount: Math.round(gstAmount),
      totalFinalPrice: Math.round(totalFinalPrice),

      // Additional for display
      totalCostPrice: Math.round(totalCostPrice),
      profitAmount: Math.round(profitAmount),
      sellingPrice: Math.round(sellingPrice),
      mrp: Math.round(mrp),

      // Legacy fields for backward compatibility
      metalCost: Math.round(metalPrice),
      stoneCost: Math.round(diamondPrice),
      otherCharges: Math.round(formData.otherCharges || 0),
      finalPrice: Math.round(totalFinalPrice),
      makingChargeAmount: Math.round(makingCharges),
      extraCharges: Math.round(formData.otherCharges || 0),
      totalPrice: Math.round(totalFinalPrice), // Alias for totalFinalPrice for backward compatibility
    };
  };

  // Alias for backward compatibility
  const calculateDetailedPricing = calculateTotalPrice;

  // Auto-populate gold rate from live prices when available and not manually set
  useEffect(() => {
    if (formData.livePriceEnabled && formData.hasGold && formData.goldPurity && livePrices.gold > 0) {
      // Auto-populate when purity is selected (even if rate is already set, update it based on purity)
      let basePricePerGram = livePrices.gold;
      // Apply purity factor
      if (formData.goldPurity === '24K') basePricePerGram *= 1.0;
      else if (formData.goldPurity === '22K') basePricePerGram *= 0.916;
      else if (formData.goldPurity === '18K') basePricePerGram *= 0.75;
      else if (formData.goldPurity === '14K') basePricePerGram *= 0.583;

      const calculatedRate = Math.round(basePricePerGram);
      // Only update if different to avoid infinite loops
      if (formData.goldRatePerGram !== calculatedRate) {
        setFormData(prev => ({
          ...prev,
          goldRatePerGram: calculatedRate,
        }));
      }
    }
  }, [formData.livePriceEnabled, formData.hasGold, formData.goldPurity, livePrices.gold]);

  // Auto-populate silver rate from live prices when available and not manually set
  useEffect(() => {
    if (formData.livePriceEnabled && formData.hasSilver && formData.silverPurity && livePrices.silver > 0) {
      // Auto-populate when purity is selected (even if rate is already set, update it based on purity)
      let basePricePerGram = livePrices.silver;
      // Apply purity factor
      if (formData.silverPurity === '999 Silver') basePricePerGram *= 1.0;
      else if (formData.silverPurity === '925 Silver') basePricePerGram *= 0.925;

      const calculatedRate = Math.round(basePricePerGram);
      // Only update if different to avoid infinite loops
      if (formData.silverRatePerGram !== calculatedRate) {
        setFormData(prev => ({
          ...prev,
          silverRatePerGram: calculatedRate,
        }));
      }
    }
  }, [formData.livePriceEnabled, formData.hasSilver, formData.silverPurity, livePrices.silver]);

  // Update prices when jewelry details change
  useEffect(() => {
    // Check if at least one material is selected and has valid data
    const hasValidGold = formData.hasGold && formData.goldWeight > 0 && formData.goldRatePerGram > 0;
    const hasValidSilver = formData.hasSilver && formData.silverWeight > 0 && formData.silverRatePerGram > 0;
    const hasValidDiamond = formData.hasDiamond && formData.diamondCarat > 0 && formData.diamondRatePerCarat > 0;

    // Only auto-calculate if we have at least one valid material
    if (hasValidGold || hasValidSilver || hasValidDiamond) {
      if (formData.livePriceEnabled) {
        fetchLivePrices();
      }

      const pricing = calculateTotalPrice();
      if (pricing.totalFinalPrice > 0) {
        setFormData(prev => ({
          ...prev,
          metalCost: pricing.metalCost,
          stoneCost: pricing.stoneCost,
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
  }, [
    formData.hasGold,
    formData.goldWeight,
    formData.goldRatePerGram,
    formData.goldPurity,
    formData.hasSilver,
    formData.silverWeight,
    formData.silverRatePerGram,
    formData.silverPurity,
    formData.hasDiamond,
    formData.diamondCarat,
    formData.diamondRatePerCarat,
    formData.numberOfStones,
    formData.makingCharges,
    formData.makingChargesType,
    formData.otherCharges,
    formData.profitMargin,
    formData.taxRate,
    formData.livePriceEnabled,
  ]);

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
          // Default isB2C to true if not set (for backward compatibility)
          isB2C: data.isB2C !== undefined ? data.isB2C : true,
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
          specifications: Array.isArray(data.specifications)
            ? data.specifications
            : typeof data.specifications === 'string' && data.specifications.trim()
            ? [] // If old string format exists, convert to empty array (user can re-add)
            : [],
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
  const fieldToTabMap: Record<string, 'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other' | 'preview'> = {
    product_type: 'basic',
    isB2C: 'basic',
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
    // Material selection fields
    hasGold: 'jewelry',
    hasSilver: 'jewelry',
    hasDiamond: 'jewelry',
    // Gold fields
    goldWeight: 'jewelry',
    goldPurity: 'jewelry',
    goldRatePerGram: 'jewelry',
    // Silver fields
    silverWeight: 'jewelry',
    silverPurity: 'jewelry',
    silverRatePerGram: 'jewelry',
    // Diamond fields
    diamondCarat: 'jewelry',
    diamondRatePerCarat: 'jewelry',
    // Legacy jewelry fields (for backward compatibility)
    metalType: 'jewelry',
    metalPurity: 'jewelry',
    metalWeight: 'jewelry',
    stoneType: 'jewelry',
    stoneWeight: 'jewelry',
    stoneClarity: 'jewelry',
    stoneColor: 'jewelry',
    stoneCut: 'jewelry',
    diamondCut: 'jewelry',
    numberOfStones: 'jewelry',
    diamondShape: 'jewelry',
    makingCharges: 'jewelry',
    makingChargesType: 'jewelry',
    certification: 'jewelry',
    gender: 'jewelry',
    size: 'jewelry',
    sizeUnit: 'jewelry',
    hallmarked: 'jewelry',
    bis_hallmark: 'jewelry',
    customizable: 'jewelry',
    engraving_available: 'jewelry',
    gift_wrapping: 'jewelry',
    regularPrice: 'pricing',
    sellingPrice: 'pricing',
    costPrice: 'pricing',
    taxRate: 'pricing',
    wholesalePriceType: 'pricing',
    livePriceEnabled: 'pricing',
    metalCost: 'pricing',
    stoneCost: 'pricing',
    makingChargeAmount: 'pricing',
    gstAmount: 'pricing',
    otherCharges: 'pricing',
    totalCostPrice: 'pricing',
    profitMargin: 'pricing',
    profitAmount: 'pricing',
    mrp: 'pricing',
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
    // Other fields
    brand: 'basic',
    tags: 'basic',
    processingTime: 'other',
    dimensions: 'other',
    weight: 'other',
    shippingClass: 'other',
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

  useEffect(() => {
    const isCustomValue = !!formData.certification && !CERTIFICATION_OPTIONS.some(option => option.value === formData.certification);
    if (isCustomValue && !useCustomCertification) {
      setUseCustomCertification(true);
    }
  }, [formData.certification, useCustomCertification]);

  // Get which tabs have errors
  const getTabsWithErrors = (
    errorFields: Record<string, string>
  ): Set<'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other'> => {
    const tabs = new Set<'basic' | 'jewelry' | 'pricing' | 'inventory' | 'images' | 'seo' | 'other' | 'preview'>();
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

    console.log('[v0] Validating form with data:', {
      product_type: formData.product_type,
      metalWeight: formData.metalWeight,
      metalPurity: formData.metalPurity,
      makingCharges: formData.makingCharges,
    });

    // Basic Information Tab - Required Fields
    if (!formData.product_type?.trim()) newErrors.product_type = 'Product type is required';
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.shortDescription?.trim()) newErrors.shortDescription = 'Short description is required';
    if (!getPlainTextFromHtml(formData.longDescription)) newErrors.longDescription = 'Long description is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    // Brand is optional - removed validation
    // Vendor is only required for B2B (when isB2C is false)
    if (!formData.isB2C && !formData.vendor?.trim()) {
      newErrors.vendor = 'Vendor is required for B2B products';
    }

    // Business Settings Validation
    if (formData.taxRate < 0 || formData.taxRate > 100) newErrors.taxRate = 'Tax rate must be between 0 and 100';

    // Pricing validation - only if live pricing is disabled
    if (!formData.livePriceEnabled) {
      if (!formData.regularPrice || formData.regularPrice <= 0)
        newErrors.regularPrice = 'Regular price is required and must be greater than 0';
      if (!formData.sellingPrice || formData.sellingPrice <= 0)
        newErrors.sellingPrice = 'Selling price is required and must be greater than 0';
      if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = 'Cost price is required and must be greater than 0';
    }

    // Jewelry Tab Validation - Required for jewelry products
    if (formData.product_type && ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'].includes(formData.product_type)) {
      // At least one material must be selected
      if (!formData.hasGold && !formData.hasSilver && !formData.hasDiamond) {
        newErrors.hasGold = 'Please select at least one material (Gold, Silver, or Diamond)';
        newErrors.hasSilver = 'Please select at least one material (Gold, Silver, or Diamond)';
        newErrors.hasDiamond = 'Please select at least one material (Gold, Silver, or Diamond)';
      }

      // Gold validation - if Gold is selected
      if (formData.hasGold) {
        if (!formData.goldWeight || formData.goldWeight <= 0) {
          newErrors.goldWeight = 'Gold weight (grams) is required and must be greater than 0';
        }
        if (!formData.goldPurity?.trim()) {
          newErrors.goldPurity = 'Gold purity is required';
        }
        if (!formData.goldRatePerGram || formData.goldRatePerGram <= 0) {
          newErrors.goldRatePerGram = 'Gold rate per gram is required and must be greater than 0';
        }
      }

      // Silver validation - if Silver is selected
      if (formData.hasSilver) {
        if (!formData.silverWeight || formData.silverWeight <= 0) {
          newErrors.silverWeight = 'Silver weight (grams) is required and must be greater than 0';
        }
        if (!formData.silverPurity?.trim()) {
          newErrors.silverPurity = 'Silver purity is required';
        }
        if (!formData.silverRatePerGram || formData.silverRatePerGram <= 0) {
          newErrors.silverRatePerGram = 'Silver rate per gram is required and must be greater than 0';
        }
      }

      // Diamond validation - if Diamond is selected
      if (formData.hasDiamond) {
        if (!formData.diamondCarat || formData.diamondCarat <= 0) {
          newErrors.diamondCarat = 'Diamond carat is required and must be greater than 0';
        }
        if (!formData.numberOfStones || formData.numberOfStones <= 0) {
          newErrors.numberOfStones = 'Number of stones is required and must be greater than 0';
        }
        if (!formData.diamondRatePerCarat || formData.diamondRatePerCarat <= 0) {
          newErrors.diamondRatePerCarat = 'Diamond rate per carat is required and must be greater than 0';
        }
      }

      // Making Charges - Required
      if (!formData.makingCharges || formData.makingCharges <= 0) {
        newErrors.makingCharges = 'Making charges are required and must be greater than 0';
        console.log('[v0] Making charges validation failed:', formData.makingCharges);
      }

      // Making charges type validation
      if (!formData.makingChargesType) {
        newErrors.makingChargesType = 'Making charges type (percentage/fixed) is required';
      }

      // Product Details - Optional for jewelry (for better categorization)
      // These fields help with filtering and search but are not mandatory
    }

    // Inventory Tab Validation
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.stock && formData.stock !== 0) newErrors.stock = 'Stock quantity is required';
    if (formData.lowStockThreshold < 0) newErrors.lowStockThreshold = 'Low stock threshold cannot be negative';

    // Images Tab Validation
    if (!formData.mainImage?.trim()) newErrors.mainImage = 'Main product image is required';

    // SEO Tab Validation - Only URL slug is required
    if (!formData.urlSlug?.trim()) newErrors.urlSlug = 'URL slug is required';

    // URL Slug validation (no spaces, special characters)
    if (formData.urlSlug && !/^[a-z0-9-]+$/.test(formData.urlSlug)) {
      newErrors.urlSlug = 'URL slug can only contain lowercase letters, numbers, and hyphens';
    }

    // Meta title length validation
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should be 60 characters or less';
    }

    // Meta description length validation
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be 160 characters or less';
    }

    // Business Logic Validation
    if (formData.allow_return && !formData.return_policy?.trim()) {
      newErrors.return_policy = 'Return policy is required when returns are enabled';
    }

    // Warranty validation - Optional field for better customer service

    console.log('[v0] Validation errors found:', newErrors);
    console.log('[v0] Tabs with errors:', getTabsWithErrors(newErrors));

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
    { id: 'preview', label: 'Price Calculation Preview', icon: DollarSign },
  ];

  const certificationSelectedValue = useCustomCertification ? '__custom__' : formData.certification;

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
                        labelMain='Product Type *'
                        options={[{ label: 'Select Product Type', value: '' }, ...PRODUCT_TYPE_OPTIONS]}
                        placeholder='Select Product Type'
                        value={formData.product_type}
                        onChange={option => {
                          const selectedType = option.value as ProductType;
                          handleChange('product_type', selectedType);
                          if (selectedType === 'Gold') {
                            handleChange('metalType', 'Gold');
                          } else if (selectedType === 'Silver') {
                            handleChange('metalType', 'Silver');
                          } else if (selectedType === 'Platinum') {
                            handleChange('metalType', 'Platinum');
                          }
                        }}
                        withSearch
                        error={isFieldInActiveTab('product_type') ? errors.product_type : undefined}
                      />

                      {/* B2B/B2C Toggle - Only show after product type is selected */}
                      {formData.product_type && (
                        <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h4 className='text-sm font-semibold text-slate-900 dark:text-white mb-1'>Business Type</h4>
                              <p className='text-xs text-slate-600 dark:text-slate-400'>
                                {formData.isB2C
                                  ? 'B2C (Business to Consumer) - Direct customer sales'
                                  : 'B2B (Business to Business) - Wholesale/vendor sales'}
                              </p>
                            </div>
                            <div className='flex items-center space-x-3'>
                              <span
                                className={`text-sm font-medium ${
                                  !formData.isB2C ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                B2B
                              </span>
                              <Switch
                                checked={formData.isB2C}
                                onCheckedChange={checked => {
                                  handleChange('isB2C', checked);
                                  // Clear vendor when switching to B2C
                                  if (checked) {
                                    handleChange('vendor', '');
                                  }
                                }}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  formData.isB2C ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                B2C
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Vendor Dropdown - Only show for B2B */}
                      {formData.product_type && !formData.isB2C && (
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
                      )}

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
                        placeholder='Auto-generated from product name'
                        error={getFilteredErrors().sku}
                        readOnly
                        inputClassName='bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
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
                        error={isFieldInActiveTab('brand') ? errors.brand : undefined}
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
                    <div className='space-y-6'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Jewelry Details</h3>
                        <div className='text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full'>
                          Step 1: Fill jewelry details for live pricing
                        </div>
                      </div>

                      <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                        <p className='text-sm text-blue-800 dark:text-blue-200'>
                          <strong>💡 Tip:</strong> Complete the Metal Information section below to enable automatic live pricing calculation
                          in the "Pricing & Tax" tab.
                        </p>
                      </div>

                      {/* Material Selection */}
                      <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                        <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>Material Selection</h4>
                        <p className='text-sm text-slate-600 dark:text-slate-400 mb-4'>
                          Select one or more materials for this product. You can combine Gold, Silver, and Diamond in any combination.
                        </p>

                        {/* Material Checkboxes */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                          <div className='flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'>
                            <Switch
                              id='hasGold'
                              checked={formData.hasGold}
                              onCheckedChange={checked => {
                                handleChange('hasGold', checked);
                                if (!checked) {
                                  handleChange('goldWeight', 0);
                                  handleChange('goldPurity', '');
                                  handleChange('goldRatePerGram', 0);
                                }
                              }}
                            />
                            <label
                              htmlFor='hasGold'
                              className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1'>
                              Gold
                            </label>
                          </div>

                          <div className='flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'>
                            <Switch
                              id='hasSilver'
                              checked={formData.hasSilver}
                              onCheckedChange={checked => {
                                handleChange('hasSilver', checked);
                                if (!checked) {
                                  handleChange('silverWeight', 0);
                                  handleChange('silverPurity', '');
                                  handleChange('silverRatePerGram', 0);
                                }
                              }}
                            />
                            <label
                              htmlFor='hasSilver'
                              className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1'>
                              Silver
                            </label>
                          </div>

                          <div className='flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'>
                            <Switch
                              id='hasDiamond'
                              checked={formData.hasDiamond}
                              onCheckedChange={checked => {
                                handleChange('hasDiamond', checked);
                                if (!checked) {
                                  handleChange('diamondCarat', 0);
                                  handleChange('diamondRatePerCarat', 0);
                                  handleChange('numberOfStones', 0);
                                }
                              }}
                            />
                            <label
                              htmlFor='hasDiamond'
                              className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1'>
                              Diamond
                            </label>
                          </div>
                        </div>

                        {/* Gold Details */}
                        {formData.hasGold && (
                          <div className='mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800'>
                            <h5 className='text-md font-semibold text-amber-900 dark:text-amber-100 mb-3'>Gold Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <FormField
                                label='Gold Weight (grams) '
                                required
                                error={isFieldInActiveTab('goldWeight') ? errors.goldWeight : undefined}
                                numericOnly
                                placeholder='Enter grams'
                                value={formData.goldWeight}
                                onChange={e => handleChange('goldWeight', e.target.value ? Number(e.target.value) : 0)}
                                helperText='Weight in grams'
                              />
                              <Dropdown
                                labelMain='Gold Purity '
                                options={[
                                  { label: 'Select Purity', value: '' },
                                  { label: '24K (99.9% Pure)', value: '24K' },
                                  { label: '22K (91.6% Pure)', value: '22K' },
                                  { label: '18K (75% Pure)', value: '18K' },
                                  { label: '14K (58.3% Pure)', value: '14K' },
                                ]}
                                placeholder='Select Purity'
                                value={formData.goldPurity}
                                onChange={option => handleChange('goldPurity', option.value as Product['goldPurity'])}
                                error={isFieldInActiveTab('goldPurity') ? errors.goldPurity : undefined}
                              />
                            </div>
                            <div className='space-y-0 mt-3'>
                              <div className='flex items-center justify-between'>
                                <label className='block text-sm font-medium text-slate-700 whitespace-nowrap dark:text-slate-300'>
                                  Gold Rate per Gram (₹) <span className='text-red-500'>*</span>
                                </label>
                                {formData.livePriceEnabled && livePrices.gold > 0 && (
                                  <button
                                    type='button'
                                    onClick={() => {
                                      let basePricePerGram = livePrices.gold;
                                      if (formData.goldPurity === '24K') basePricePerGram *= 1.0;
                                      else if (formData.goldPurity === '22K') basePricePerGram *= 0.916;
                                      else if (formData.goldPurity === '18K') basePricePerGram *= 0.75;
                                      else if (formData.goldPurity === '14K') basePricePerGram *= 0.583;
                                      handleChange('goldRatePerGram', Math.round(basePricePerGram));
                                    }}
                                    className='text-xs text-blue-600 dark:text-blue-400 hover:underline'
                                    disabled={!formData.goldPurity}>
                                    Use Live Price (₹{livePrices.gold.toLocaleString()})
                                  </button>
                                )}
                              </div>
                              <FormField
                                type='number'
                                step='0.01'
                                placeholder={
                                  formData.livePriceEnabled && livePrices.gold > 0
                                    ? `Auto: ₹${livePrices.gold.toLocaleString()}`
                                    : 'Enter rate per gram'
                                }
                                value={formData.goldRatePerGram}
                                onChange={e => handleChange('goldRatePerGram', parseFloat(e.target.value) || 0)}
                                helperText={
                                  formData.livePriceEnabled && livePrices.gold > 0
                                    ? `Live 24K Gold: ₹${livePrices.gold.toLocaleString()}/gram`
                                    : 'Rate per gram in ₹'
                                }
                                error={isFieldInActiveTab('goldRatePerGram') ? errors.goldRatePerGram : undefined}
                              />
                            </div>
                          </div>
                        )}

                        {/* Silver Details */}
                        {formData.hasSilver && (
                          <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800'>
                            <h5 className='text-md font-semibold text-gray-900 dark:text-gray-100 mb-3'>Silver Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <FormField
                                label='Silver Weight (grams) *'
                                required
                                error={isFieldInActiveTab('silverWeight') ? errors.silverWeight : undefined}
                                numericOnly
                                placeholder='Enter grams'
                                value={formData.silverWeight}
                                onChange={e => handleChange('silverWeight', e.target.value ? Number(e.target.value) : 0)}
                                helperText='Weight in grams'
                              />
                              <Dropdown
                                labelMain='Silver Purity *'
                                options={[
                                  { label: 'Select Purity', value: '' },
                                  { label: '999 Silver (99.9% Pure)', value: '999 Silver' },
                                  { label: '925 Silver (92.5% Pure)', value: '925 Silver' },
                                ]}
                                placeholder='Select Purity'
                                value={formData.silverPurity}
                                onChange={option => handleChange('silverPurity', option.value as Product['silverPurity'])}
                                error={isFieldInActiveTab('silverPurity') ? errors.silverPurity : undefined}
                              />
                            </div>

                            <div className='space-y-0 mt-3'>
                              <div className='flex items-center justify-between'>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
                                  Silver Rate per Gram (₹) <span className='text-red-500'>*</span>
                                </label>
                                {formData.livePriceEnabled && livePrices.silver > 0 && (
                                  <button
                                    type='button'
                                    onClick={() => {
                                      let basePricePerGram = livePrices.silver;
                                      if (formData.silverPurity === '999 Silver') basePricePerGram *= 1.0;
                                      else if (formData.silverPurity === '925 Silver') basePricePerGram *= 0.925;
                                      handleChange('silverRatePerGram', Math.round(basePricePerGram));
                                    }}
                                    className='text-xs text-blue-600 dark:text-blue-400 hover:underline'
                                    disabled={!formData.silverPurity}>
                                    Use Live Price (₹{livePrices.silver.toLocaleString()})
                                  </button>
                                )}
                              </div>
                              <FormField
                                type='number'
                                step='0.01'
                                placeholder={
                                  formData.livePriceEnabled && livePrices.silver > 0
                                    ? `Auto: ₹${livePrices.silver.toLocaleString()}`
                                    : 'Enter rate per gram'
                                }
                                value={formData.silverRatePerGram}
                                onChange={e => handleChange('silverRatePerGram', parseFloat(e.target.value) || 0)}
                                helperText={
                                  formData.livePriceEnabled && livePrices.silver > 0
                                    ? `Live 999 Silver: ₹${livePrices.silver.toLocaleString()}/gram`
                                    : 'Rate per gram in ₹'
                                }
                                error={isFieldInActiveTab('silverRatePerGram') ? errors.silverRatePerGram : undefined}
                              />
                            </div>
                          </div>
                        )}

                        {/* Diamond Details */}
                        {formData.hasDiamond && (
                          <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                            <h5 className='text-md font-semibold text-blue-900 dark:text-blue-100 mb-3'>Diamond Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-4'>
                              <FormField
                                label='Diamond Carat '
                                required
                                error={isFieldInActiveTab('diamondCarat') ? errors.diamondCarat : undefined}
                                placeholder='Enter carats'
                                value={formData.diamondCarat}
                                numericOnly
                                onChange={e => handleChange('diamondCarat', e.target.value ? Number(e.target.value) : 0)}
                                helperText='Total carat weight'
                              />
                              <FormField
                                label='Number of Stones '
                                required
                                type='number'
                                min='1'
                                value={formData.numberOfStones}
                                onChange={e => handleChange('numberOfStones', parseInt(e.target.value) || 1)}
                                placeholder='Enter number of diamonds'
                                error={errors.numberOfStones}
                                helperText='Total count of diamonds'
                              />
                              <FormField
                                label='Diamond Rate per Carat (₹) '
                                required
                                type='number'
                                step='0.01'
                                placeholder='Enter rate per carat'
                                value={formData.diamondRatePerCarat}
                                onChange={e => handleChange('diamondRatePerCarat', parseFloat(e.target.value) || 0)}
                                helperText='Rate per carat in ₹'
                                error={isFieldInActiveTab('diamondRatePerCarat') ? errors.diamondRatePerCarat : undefined}
                              />
                              <Dropdown
                                labelMain='Diamond Clarity'
                                options={DIAMOND_CLARITY_OPTIONS}
                                placeholder='Select Clarity'
                                value={formData.stoneClarity}
                                onChange={option => handleChange('stoneClarity', option.value as Product['stoneClarity'])}
                                error={isFieldInActiveTab('stoneClarity') ? errors.stoneClarity : undefined}
                              />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <Dropdown
                                labelMain='Diamond Cut'
                                options={DIAMOND_CUT_OPTIONS}
                                placeholder='Select Cut Grade'
                                value={formData.diamondCut}
                                onChange={option => handleChange('diamondCut', option.value as Product['diamondCut'])}
                                error={isFieldInActiveTab('diamondCut') ? errors.diamondCut : undefined}
                              />
                              <Dropdown
                                labelMain='Diamond Shape'
                                options={DIAMOND_SHAPE_OPTIONS}
                                placeholder='Select Shape'
                                value={formData.diamondShape}
                                onChange={option => handleChange('diamondShape', option.value as Product['diamondShape'])}
                                error={isFieldInActiveTab('diamondShape') ? errors.diamondShape : undefined}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comprehensive Jewelry Specifications */}
                      <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                        <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>Jewelry Specifications</h4>

                        {/* Jewelry Type */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                          <Dropdown
                            labelMain='Jewelry Type'
                            options={[
                              { label: 'Select Type', value: '' },
                              { label: 'Ring', value: 'Ring' },
                              { label: 'Necklace', value: 'Necklace' },
                              { label: 'Earrings', value: 'Earrings' },
                              { label: 'Bracelet', value: 'Bracelet' },
                              { label: 'Pendant', value: 'Pendant' },
                              { label: 'Bangle', value: 'Bangle' },
                              { label: 'Chain', value: 'Chain' },
                              { label: 'Mangalsutra', value: 'Mangalsutra' },
                              { label: 'Nose Pin', value: 'Nose Pin' },
                              { label: 'Toe Ring', value: 'Toe Ring' },
                              { label: 'Anklet', value: 'Anklet' },
                              { label: 'Brooch', value: 'Brooch' },
                              { label: 'Cufflinks', value: 'Cufflinks' },
                              { label: 'Tie Pin', value: 'Tie Pin' },
                              { label: 'Hairpin', value: 'Hairpin' },
                              { label: 'Other', value: 'Other' },
                            ]}
                            placeholder='Select Jewelry Type'
                            value={formData.jewelryType}
                            onChange={option => handleChange('jewelryType', option.value as Product['jewelryType'])}
                          />
                          <FormField
                            label='Jewelry Sub-Type'
                            placeholder='e.g., Solitaire Ring, Diamond Necklace'
                            value={formData.jewelrySubType}
                            onChange={e => handleChange('jewelrySubType', e.target.value)}
                            helperText='Specific type or style name'
                          />
                        </div>

                        {/* Ring Specific Fields */}
                        {formData.jewelryType === 'Ring' && (
                          <div className='mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800'>
                            <h5 className='text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3'>Ring Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                              <Dropdown
                                labelMain='Ring Setting'
                                options={[
                                  { label: 'Select Setting', value: '' },
                                  { label: 'Prong', value: 'Prong' },
                                  { label: 'Bezel', value: 'Bezel' },
                                  { label: 'Channel', value: 'Channel' },
                                  { label: 'Pave', value: 'Pave' },
                                  { label: 'Tension', value: 'Tension' },
                                  { label: 'Invisible', value: 'Invisible' },
                                  { label: 'Halo', value: 'Halo' },
                                  { label: 'Three Stone', value: 'Three Stone' },
                                  { label: 'Vintage', value: 'Vintage' },
                                  { label: 'Cluster', value: 'Cluster' },
                                  { label: 'Solitaire', value: 'Solitaire' },
                                  { label: 'Other', value: 'Other' },
                                ]}
                                placeholder='Select Setting'
                                value={formData.ringSetting}
                                onChange={option => handleChange('ringSetting', option.value as Product['ringSetting'])}
                              />
                              <FormField
                                label='Ring Size'
                                placeholder='e.g., 6, 7, 8'
                                value={formData.ringSize}
                                onChange={e => handleChange('ringSize', e.target.value)}
                              />
                              <Dropdown
                                labelMain='Size System'
                                options={[
                                  { label: 'Select System', value: '' },
                                  { label: 'US', value: 'US' },
                                  { label: 'UK', value: 'UK' },
                                  { label: 'India', value: 'India' },
                                  { label: 'EU', value: 'EU' },
                                ]}
                                placeholder='Size System'
                                value={formData.ringSizeSystem}
                                onChange={option => handleChange('ringSizeSystem', option.value as Product['ringSizeSystem'])}
                              />
                              <FormField
                                label='Band Width (mm)'
                                type='number'
                                placeholder='Band width'
                                value={formData.ringWidth}
                                onChange={e => handleChange('ringWidth', parseFloat(e.target.value) || 0)}
                              />
                              <Dropdown
                                labelMain='Ring Style'
                                options={[
                                  { label: 'Select Style', value: '' },
                                  { label: 'Classic', value: 'Classic' },
                                  { label: 'Modern', value: 'Modern' },
                                  { label: 'Vintage', value: 'Vintage' },
                                  { label: 'Contemporary', value: 'Contemporary' },
                                  { label: 'Traditional', value: 'Traditional' },
                                  { label: 'Art Deco', value: 'Art Deco' },
                                  { label: 'Other', value: 'Other' },
                                ]}
                                placeholder='Ring Style'
                                value={formData.ringStyle}
                                onChange={option => handleChange('ringStyle', option.value as Product['ringStyle'])}
                              />
                            </div>
                          </div>
                        )}

                        {/* Chain/Necklace Specific Fields */}
                        {(formData.jewelryType === 'Necklace' || formData.jewelryType === 'Chain') && (
                          <div className='mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800'>
                            <h5 className='text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-3'>Chain/Necklace Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                              <Dropdown
                                labelMain='Chain Type'
                                options={[
                                  { label: 'Select Chain Type', value: '' },
                                  { label: 'Rope', value: 'Rope' },
                                  { label: 'Box', value: 'Box' },
                                  { label: 'Snake', value: 'Snake' },
                                  { label: 'Cable', value: 'Cable' },
                                  { label: 'Figaro', value: 'Figaro' },
                                  { label: 'Curb', value: 'Curb' },
                                  { label: 'Singapore', value: 'Singapore' },
                                  { label: 'Wheat', value: 'Wheat' },
                                  { label: 'Ball', value: 'Ball' },
                                  { label: 'Anchor', value: 'Anchor' },
                                  { label: 'Byzantine', value: 'Byzantine' },
                                  { label: 'Herringbone', value: 'Herringbone' },
                                  { label: 'Rolo', value: 'Rolo' },
                                  { label: 'Tennis', value: 'Tennis' },
                                  { label: 'Other', value: 'Other' },
                                ]}
                                placeholder='Select Chain Type'
                                value={formData.chainType}
                                onChange={option => handleChange('chainType', option.value as Product['chainType'])}
                              />
                              <FormField
                                label='Chain Length'
                                type='number'
                                placeholder='Length'
                                value={formData.chainLength}
                                onChange={e => handleChange('chainLength', parseFloat(e.target.value) || 0)}
                              />
                              <Dropdown
                                labelMain='Length Unit'
                                options={[
                                  { label: 'Select Unit', value: '' },
                                  { label: 'Inches', value: 'inches' },
                                  { label: 'Centimeters', value: 'cm' },
                                ]}
                                placeholder='Unit'
                                value={formData.chainLengthUnit}
                                onChange={option => handleChange('chainLengthUnit', option.value as Product['chainLengthUnit'])}
                              />
                            </div>
                          </div>
                        )}

                        {/* Earring Specific Fields */}
                        {formData.jewelryType === 'Earrings' && (
                          <div className='mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800'>
                            <h5 className='text-sm font-semibold text-pink-900 dark:text-pink-100 mb-3'>Earring Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <Dropdown
                                labelMain='Earring Type'
                                options={[
                                  { label: 'Select Type', value: '' },
                                  { label: 'Stud', value: 'Stud' },
                                  { label: 'Hoops', value: 'Hoops' },
                                  { label: 'Drops', value: 'Drops' },
                                  { label: 'Chandelier', value: 'Chandelier' },
                                  { label: 'Huggies', value: 'Huggies' },
                                  { label: 'Threader', value: 'Threader' },
                                  { label: 'Ear Cuffs', value: 'Ear Cuffs' },
                                  { label: 'Climbers', value: 'Climbers' },
                                  { label: 'Jackets', value: 'Jackets' },
                                  { label: 'Other', value: 'Other' },
                                ]}
                                placeholder='Earring Type'
                                value={formData.earringType}
                                onChange={option => handleChange('earringType', option.value as Product['earringType'])}
                              />
                              <Dropdown
                                labelMain='Back Type'
                                options={[
                                  { label: 'Select Back Type', value: '' },
                                  { label: 'Push Back', value: 'Push Back' },
                                  { label: 'Screw Back', value: 'Screw Back' },
                                  { label: 'Leverback', value: 'Leverback' },
                                  { label: 'Hinged', value: 'Hinged' },
                                  { label: 'Clip On', value: 'Clip On' },
                                  { label: 'Other', value: 'Other' },
                                ]}
                                placeholder='Back Type'
                                value={formData.earringBackType}
                                onChange={option => handleChange('earringBackType', option.value as Product['earringBackType'])}
                              />
                            </div>
                          </div>
                        )}

                        {/* Bracelet Specific Fields */}
                        {formData.jewelryType === 'Bracelet' && (
                          <div className='mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800'>
                            <h5 className='text-sm font-semibold text-teal-900 dark:text-teal-100 mb-3'>Bracelet Details</h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                              <Dropdown
                                labelMain='Bracelet Type'
                                options={[
                                  { label: 'Select Type', value: '' },
                                  { label: 'Chain', value: 'Chain' },
                                  { label: 'Bangle', value: 'Bangle' },
                                  { label: 'Cuff', value: 'Cuff' },
                                  { label: 'Tennis', value: 'Tennis' },
                                  { label: 'Charm', value: 'Charm' },
                                  { label: 'Link', value: 'Link' },
                                  { label: 'Other', value: 'Other' },
                                ]}
                                placeholder='Bracelet Type'
                                value={formData.braceletType}
                                onChange={option => handleChange('braceletType', option.value as Product['braceletType'])}
                              />
                              <FormField
                                label='Length'
                                type='number'
                                placeholder='Length'
                                value={formData.braceletLength}
                                onChange={e => handleChange('braceletLength', parseFloat(e.target.value) || 0)}
                              />
                              <Dropdown
                                labelMain='Length Unit'
                                options={[
                                  { label: 'Select Unit', value: '' },
                                  { label: 'Inches', value: 'inches' },
                                  { label: 'Centimeters', value: 'cm' },
                                ]}
                                placeholder='Unit'
                                value={formData.braceletLengthUnit}
                                onChange={option => handleChange('braceletLengthUnit', option.value as Product['braceletLengthUnit'])}
                              />
                              <FormField
                                label='Width (mm)'
                                type='number'
                                placeholder='Width'
                                value={formData.braceletWidth}
                                onChange={e => handleChange('braceletWidth', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        )}

                        {/* Design & Style */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
                          <Dropdown
                            labelMain='Design Style'
                            options={[
                              { label: 'Select Style', value: '' },
                              { label: 'Traditional', value: 'Traditional' },
                              { label: 'Modern', value: 'Modern' },
                              { label: 'Contemporary', value: 'Contemporary' },
                              { label: 'Vintage', value: 'Vintage' },
                              { label: 'Art Deco', value: 'Art Deco' },
                              { label: 'Minimalist', value: 'Minimalist' },
                              { label: 'Ornate', value: 'Ornate' },
                              { label: 'Antique', value: 'Antique' },
                              { label: 'Fusion', value: 'Fusion' },
                              { label: 'Other', value: 'Other' },
                            ]}
                            placeholder='Design Style'
                            value={formData.designStyle}
                            onChange={option => handleChange('designStyle', option.value as Product['designStyle'])}
                          />
                          <Dropdown
                            labelMain='Finish Type'
                            options={[
                              { label: 'Select Finish', value: '' },
                              { label: 'Polished', value: 'Polished' },
                              { label: 'Matte', value: 'Matte' },
                              { label: 'Brushed', value: 'Brushed' },
                              { label: 'Hammered', value: 'Hammered' },
                              { label: 'Textured', value: 'Textured' },
                              { label: 'Oxidized', value: 'Oxidized' },
                              { label: 'Mixed', value: 'Mixed' },
                              { label: 'Other', value: 'Other' },
                            ]}
                            placeholder='Finish Type'
                            value={formData.finishType}
                            onChange={option => handleChange('finishType', option.value as Product['finishType'])}
                          />
                          <FormField
                            label='Pattern'
                            placeholder='e.g., Floral, Geometric, Abstract'
                            value={formData.pattern}
                            onChange={e => handleChange('pattern', e.target.value)}
                          />
                        </div>

                        {/* Stone Setting */}
                        {formData.hasDiamond && (
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                            <Dropdown
                              labelMain='Stone Setting'
                              options={[
                                { label: 'Select Setting', value: '' },
                                { label: 'Prong', value: 'Prong' },
                                { label: 'Bezel', value: 'Bezel' },
                                { label: 'Channel', value: 'Channel' },
                                { label: 'Pave', value: 'Pave' },
                                { label: 'Invisible', value: 'Invisible' },
                                { label: 'Tension', value: 'Tension' },
                                { label: 'Flush', value: 'Flush' },
                                { label: 'Gypsy', value: 'Gypsy' },
                                { label: 'Other', value: 'Other' },
                              ]}
                              placeholder='Stone Setting'
                              value={formData.stoneSetting}
                              onChange={option => handleChange('stoneSetting', option.value as Product['stoneSetting'])}
                            />
                            <Dropdown
                              labelMain='Stone Arrangement'
                              options={[
                                { label: 'Select Arrangement', value: '' },
                                { label: 'Single', value: 'Single' },
                                { label: 'Cluster', value: 'Cluster' },
                                { label: 'Halo', value: 'Halo' },
                                { label: 'Three Stone', value: 'Three Stone' },
                                { label: 'Five Stone', value: 'Five Stone' },
                                { label: 'Eternity', value: 'Eternity' },
                                { label: 'Scattered', value: 'Scattered' },
                                { label: 'Other', value: 'Other' },
                              ]}
                              placeholder='Stone Arrangement'
                              value={formData.stoneArrangement}
                              onChange={option => handleChange('stoneArrangement', option.value as Product['stoneArrangement'])}
                            />
                          </div>
                        )}

                        {/* Additional Info */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            label='Total Weight (grams)'
                            type='number'
                            placeholder='Total jewelry weight'
                            value={formData.totalWeight}
                            onChange={e => handleChange('totalWeight', parseFloat(e.target.value) || 0)}
                            helperText='Total weight including all materials'
                          />
                          {formData.hallmarked && (
                            <FormField
                              label='Hallmark Number'
                              placeholder='Hallmark number'
                              value={formData.hallmarkNumber}
                              onChange={e => handleChange('hallmarkNumber', e.target.value)}
                            />
                          )}
                          {formData.certification && (
                            <FormField
                              label='Certification Number'
                              placeholder='Certification number'
                              value={formData.certificationNumber}
                              onChange={e => handleChange('certificationNumber', e.target.value)}
                            />
                          )}
                          {formData.engraving_available && (
                            <FormField
                              label='Engraving Options'
                              placeholder='e.g., Name, Date, Initials'
                              value={formData.engravingOptions}
                              onChange={e => handleChange('engravingOptions', e.target.value)}
                            />
                          )}
                        </div>

                        {/* Services */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                          <label className='flex items-center space-x-2'>
                            <Switch
                              checked={formData.resizing_available}
                              onCheckedChange={checked => handleChange('resizing_available', checked)}
                            />
                            <span className='text-sm text-slate-700 dark:text-slate-300'>Resizing Available</span>
                          </label>
                          <label className='flex items-center space-x-2'>
                            <Switch checked={formData.customizable} onCheckedChange={checked => handleChange('customizable', checked)} />
                            <span className='text-sm text-slate-700 dark:text-slate-300'>Customizable</span>
                          </label>
                          <label className='flex items-center space-x-2'>
                            <Switch
                              checked={formData.engraving_available}
                              onCheckedChange={checked => handleChange('engraving_available', checked)}
                            />
                            <span className='text-sm text-slate-700 dark:text-slate-300'>Engraving Available</span>
                          </label>
                          <label className='flex items-center space-x-2'>
                            <Switch checked={formData.gift_wrapping} onCheckedChange={checked => handleChange('gift_wrapping', checked)} />
                            <span className='text-sm text-slate-700 dark:text-slate-300'>Gift Wrapping</span>
                          </label>
                        </div>
                      </div>

                      {/* Making Charges & Certification */}
                      <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                        <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>Making Charges & Certification</h4>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <div className='space-y-3'>
                            <FormField
                              label='Making Charges'
                              error={isFieldInActiveTab('makingCharges') ? errors.makingCharges : undefined}
                              numericOnly
                              placeholder='15'
                              value={formData.makingCharges}
                              onChange={e => handleChange('makingCharges', e.target.value ? Number(e.target.value) : 0)}
                            />
                            <Dropdown
                              labelMain='Charge Type'
                              options={MAKING_CHARGE_TYPE_OPTIONS}
                              placeholder='Select Type'
                              value={formData.makingChargesType}
                              onChange={option => handleChange('makingChargesType', option.value as Product['makingChargesType'])}
                            />
                          </div>

                          <div className='space-y-3'>
                            <Dropdown
                              labelMain='Certification'
                              options={CERTIFICATION_OPTIONS}
                              placeholder='GIA, IGI, BIS...'
                              value={certificationSelectedValue}
                              onChange={option => {
                                if (option.value === '__custom__') {
                                  setUseCustomCertification(true);
                                  if (CERTIFICATION_OPTIONS.some(opt => opt.value === formData.certification)) {
                                    handleChange('certification', '');
                                  }
                                } else {
                                  setUseCustomCertification(false);
                                  handleChange('certification', option.value);
                                }
                              }}
                              withSearch
                              error={isFieldInActiveTab('certification') ? errors.certification : undefined}
                            />
                            {useCustomCertification && (
                              <FormField
                                label='Custom Certification'
                                placeholder='Type certification name'
                                value={formData.certification}
                                onChange={e => handleChange('certification', e.target.value)}
                              />
                            )}
                          </div>

                          <div className='space-y-2'>
                            <label className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={formData.hallmarked}
                                onChange={e => setFormData(prev => ({ ...prev, hallmarked: e.target.checked }))}
                                className='mr-2'
                              />
                              <span className='text-sm text-slate-700 dark:text-slate-300'>Hallmarked</span>
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={formData.bis_hallmark}
                                onChange={e => setFormData(prev => ({ ...prev, bis_hallmark: e.target.checked }))}
                                className='mr-2'
                              />
                              <span className='text-sm text-slate-700 dark:text-slate-300'>BIS Hallmark</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                        <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>Product Details</h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                          <Dropdown
                            labelMain='Gender'
                            options={GENDER_OPTIONS}
                            placeholder='Select Gender'
                            value={formData.gender}
                            onChange={option => handleChange('gender', option.value as Product['gender'])}
                          />

                          <div className='space-y-2'>
                            <FormField
                              label='Size'
                              value={formData.size}
                              onChange={e => handleChange('size', e.target.value)}
                              placeholder='Size'
                            />
                            <Dropdown
                              labelMain='Unit'
                              options={SIZE_UNIT_OPTIONS}
                              placeholder='Unit'
                              value={formData.sizeUnit}
                              onChange={option => handleChange('sizeUnit', option.value as Product['sizeUnit'])}
                            />
                          </div>
                        </div>

                        {/* Customization & Services */}
                        <div className='mt-4'>
                          <h5 className='text-md font-medium text-slate-900 dark:text-white mb-3'>Customization & Services</h5>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            <label className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={formData.customizable}
                                onChange={e => setFormData(prev => ({ ...prev, customizable: e.target.checked }))}
                                className='mr-2'
                              />
                              <span className='text-sm text-slate-700 dark:text-slate-300'>Customizable</span>
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={formData.engraving_available}
                                onChange={e => setFormData(prev => ({ ...prev, engraving_available: e.target.checked }))}
                                className='mr-2'
                              />
                              <span className='text-sm text-slate-700 dark:text-slate-300'>Engraving Available</span>
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={formData.gift_wrapping}
                                onChange={e => setFormData(prev => ({ ...prev, gift_wrapping: e.target.checked }))}
                                className='mr-2'
                              />
                              <span className='text-sm text-slate-700 dark:text-slate-300'>Gift Wrapping</span>
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='checkbox'
                                checked={formData.livePriceEnabled}
                                onChange={e => setFormData(prev => ({ ...prev, livePriceEnabled: e.target.checked }))}
                                className='mr-2'
                              />
                              <span className='text-sm text-slate-700 dark:text-slate-300'>Live Pricing</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing & Tax */}
                  {activeTab === 'pricing' && (
                    <div className='space-y-6'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Pricing & Tax</h3>
                        <div className='text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full'>
                          Step 2: Live pricing calculation
                        </div>
                      </div>

                      {/* Live Pricing Section */}
                      <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                        <div className='flex items-center justify-between mb-4'>
                          <div>
                            <h4 className='text-lg font-semibold text-slate-900 dark:text-white'>Live Pricing System</h4>
                            {formData.livePriceEnabled && (
                              <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                                ✅ Auto-fetching live prices when accessing this tab
                              </p>
                            )}
                          </div>
                          <label className='flex items-center'>
                            <input
                              type='checkbox'
                              checked={formData.livePriceEnabled}
                              onChange={e => setFormData(prev => ({ ...prev, livePriceEnabled: e.target.checked }))}
                              className='mr-2'
                            />
                            <span className='text-sm text-slate-700 dark:text-slate-300'>Enable Live Pricing</span>
                          </label>
                        </div>

                        {formData.livePriceEnabled && (
                          <>
                            {/* Check if at least one material is selected with valid data */}
                            {!(
                              (formData.hasGold && formData.goldWeight > 0 && formData.goldPurity) ||
                              (formData.hasSilver && formData.silverWeight > 0 && formData.silverPurity) ||
                              (formData.hasDiamond && formData.diamondCarat > 0)
                            ) ? (
                              <div className='p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4 border border-amber-200 dark:border-amber-800'>
                                <div className='flex items-start gap-3'>
                                  <div className='flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5'>
                                    <span className='text-white text-xs font-bold'>!</span>
                                  </div>
                                  <div>
                                    <h4 className='text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1'>
                                      Material Details Required
                                    </h4>
                                    <p className='text-sm text-amber-700 dark:text-amber-300 mb-2'>
                                      Please select at least one material (Gold, Silver, or Diamond) and fill the required details in the
                                      "Jewelry Details" tab first:
                                    </p>
                                    <ul className='text-xs text-amber-600 dark:text-amber-400 space-y-1 ml-4'>
                                      {formData.hasGold && (!formData.goldWeight || formData.goldWeight <= 0) && (
                                        <li>• Gold Weight (in grams)</li>
                                      )}
                                      {formData.hasGold && !formData.goldPurity && <li>• Gold Purity (14K/18K/22K/24K)</li>}
                                      {formData.hasSilver && (!formData.silverWeight || formData.silverWeight <= 0) && (
                                        <li>• Silver Weight (in grams)</li>
                                      )}
                                      {formData.hasSilver && !formData.silverPurity && <li>• Silver Purity (925/999)</li>}
                                      {formData.hasDiamond && (!formData.diamondCarat || formData.diamondCarat <= 0) && (
                                        <li>• Diamond Carat</li>
                                      )}
                                      {!formData.hasGold && !formData.hasSilver && !formData.hasDiamond && (
                                        <li>• Select at least one material (Gold, Silver, or Diamond)</li>
                                      )}
                                    </ul>
                                    <p className='text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium'>
                                      Once these details are filled, live pricing will be calculated automatically.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Live Metal Rates */}
                                <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4'>
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>Live Metal Prices (₹/gram)</span>
                                    <button
                                      type='button'
                                      onClick={fetchLivePrices}
                                      disabled={priceLoading}
                                      className='text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50'>
                                      {priceLoading ? 'Updating...' : 'Refresh Prices'}
                                    </button>
                                  </div>
                                  <div className='grid grid-cols-3 gap-2 text-xs'>
                                    <div>Gold: {priceLoading ? 'Loading...' : `₹${livePrices.gold}`}</div>
                                    <div>Silver: {priceLoading ? 'Loading...' : `₹${livePrices.silver}`}</div>
                                    <div>Platinum: {priceLoading ? 'Loading...' : `₹${livePrices.platinum}`}</div>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Price Breakdown - Only show if at least one material is selected and has valid data */}
                            {((formData.hasGold && formData.goldWeight > 0 && formData.goldPurity) ||
                              (formData.hasSilver && formData.silverWeight > 0 && formData.silverPurity) ||
                              (formData.hasDiamond && formData.diamondCarat > 0)) && (
                              <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg'>
                                <h5 className='text-md font-semibold text-green-900 dark:text-green-100 mb-3'>
                                  Price Calculation
                                  <span className='text-xs font-normal ml-2'>
                                    {[
                                      formData.hasGold && `${formData.goldWeight}g Gold`,
                                      formData.hasSilver && `${formData.silverWeight}g Silver`,
                                      formData.hasDiamond && `${formData.diamondCarat}ct Diamond`,
                                    ]
                                      .filter(Boolean)
                                      .join(' + ')}
                                  </span>
                                </h5>
                                {(() => {
                                  const pricing = calculateTotalPrice();
                                  return (
                                    <div className='space-y-4'>
                                      {/* Cost Breakdown */}
                                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
                                        <div className='space-y-2'>
                                          <h6 className='font-medium text-green-800 dark:text-green-200'>Material Costs</h6>
                                          {formData.hasGold && pricing.goldPrice > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Gold Price:</span>
                                              <span className='font-semibold'>₹{pricing.goldPrice.toLocaleString()}</span>
                                            </div>
                                          )}
                                          {formData.hasSilver && pricing.silverPrice > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Silver Price:</span>
                                              <span className='font-semibold'>₹{pricing.silverPrice.toLocaleString()}</span>
                                            </div>
                                          )}
                                          {formData.hasDiamond && pricing.diamondPrice > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Diamond Price:</span>
                                              <span className='font-semibold'>₹{pricing.diamondPrice.toLocaleString()}</span>
                                            </div>
                                          )}
                                          <div className='flex justify-between'>
                                            <span>Making Charges:</span>
                                            <span className='font-semibold'>₹{pricing.makingChargeAmount.toLocaleString()}</span>
                                          </div>
                                          {pricing.extraCharges > 0 && (
                                            <div className='flex justify-between'>
                                              <span>Extra Charges:</span>
                                              <span className='font-semibold'>₹{pricing.extraCharges.toLocaleString()}</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className='space-y-2'>
                                          <h6 className='font-medium text-green-800 dark:text-green-200'>Tax & Costs</h6>
                                          <div className='flex justify-between'>
                                            <span>Subtotal:</span>
                                            <span className='font-semibold'>₹{pricing.subtotal}</span>
                                          </div>
                                          <div className='flex justify-between'>
                                            <span>GST (3%):</span>
                                            <span className='font-semibold'>₹{pricing.gstAmount}</span>
                                          </div>
                                          <div className='flex justify-between border-t pt-1'>
                                            <span className='font-medium'>Total Cost Price:</span>
                                            <span className='font-bold'>₹{pricing.totalCostPrice}</span>
                                          </div>
                                        </div>

                                        <div className='space-y-2'>
                                          <h6 className='font-medium text-green-800 dark:text-green-200'>Selling Prices</h6>
                                          <div className='flex justify-between'>
                                            <span>Profit ({formData.profitMargin}%):</span>
                                            <span className='font-semibold'>₹{pricing.profitAmount}</span>
                                          </div>
                                          <div className='flex justify-between border-t pt-1'>
                                            <span className='font-medium'>Selling Price:</span>
                                            <span className='font-bold text-green-600'>₹{pricing.sellingPrice}</span>
                                          </div>
                                          <div className='flex justify-between'>
                                            <span className='font-medium'>MRP:</span>
                                            <span className='font-bold text-blue-600'>₹{pricing.mrp}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Summary */}
                                      <div className='bg-white dark:bg-slate-700 p-3 rounded border-l-4 border-green-500'>
                                        <div className='text-xs text-slate-600 dark:text-slate-400 mb-1'>
                                          Price Formula:{' '}
                                          {[
                                            formData.hasGold && 'Gold Price',
                                            formData.hasSilver && 'Silver Price',
                                            formData.hasDiamond && 'Diamond Price',
                                            'Making Charges',
                                            'Extra Charges',
                                            `GST (${formData.taxRate || 3}%)`,
                                            'Profit',
                                          ]
                                            .filter(Boolean)
                                            .join(' + ')}
                                        </div>
                                        <div className='flex justify-between items-center'>
                                          <span className='text-sm font-medium'>Total Price:</span>
                                          <span className='text-lg font-bold text-green-600'>₹{pricing.totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className='flex justify-between items-center mt-2'>
                                          <span className='text-sm font-medium'>Final Customer Price (with profit):</span>
                                          <span className='text-lg font-bold text-blue-600'>₹{pricing.sellingPrice}</span>
                                        </div>
                                        <div className='text-xs text-slate-500 mt-1'>
                                          * GST (3%) is included in the price | MRP for display purposes
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

                      {/* Additional Cost Fields - Only show if live pricing is enabled and jewelry details are filled */}
                      {formData.livePriceEnabled &&
                        ((formData.hasGold && formData.goldWeight > 0 && formData.goldPurity) ||
                          (formData.hasSilver && formData.silverWeight > 0 && formData.silverPurity) ||
                          (formData.hasDiamond && formData.diamondCarat > 0)) && (
                          <div className='bg-slate-50 dark:bg-slate-800 p-4 rounded-lg'>
                            <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>Additional Costs</h4>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                              <FormField
                                label='Extra Charges (₹)'
                                type='number'
                                step='0.01'
                                value={formData.otherCharges}
                                onChange={e => setFormData(prev => ({ ...prev, otherCharges: parseFloat(e.target.value) || 0 }))}
                                placeholder='0.00'
                                helperText='Polishing, rhodium, etc.'
                                error={errors.otherCharges}
                              />

                              <FormField
                                label='Profit Margin (%)'
                                type='number'
                                step='0.1'
                                value={formData.profitMargin}
                                onChange={e => setFormData(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))}
                                placeholder='20'
                                helperText='Profit margin percentage'
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
                          <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                            <p className='text-sm text-blue-800 dark:text-blue-200'>
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
                          <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                            <p className='text-sm text-blue-800 dark:text-blue-200'>
                              <strong>Note:</strong> Making charges and stone details are now configured in the "Jewelry Details" tab for
                              better organization.
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
                        value={formData.metaTitle}
                        onChange={e => handleChange('metaTitle', e.target.value.slice(0, 60))}
                        placeholder='SEO title'
                        maxLength={60}
                      />

                      <FormField
                        label={`Meta Description (${formData.metaDescription.length}/160)`}
                        textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={e => handleChange('metaDescription', e.target.value.slice(0, 160))}
                        placeholder='SEO description'
                        maxLength={160}
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
                      {/* Shipping */}
                      <div className='space-y-4'>
                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Shipping Details</h3>

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
                      </div>

                      {/* Specifications */}
                      <div className='space-y-4'>
                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Product Specifications</h3>
                        <div>
                          <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3'>
                            Specifications (Key-Value Pairs)
                          </label>

                          <div className='space-y-3'>
                            {(formData.specifications || []).map((spec, index) => (
                              <div
                                key={index}
                                className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'>
                                <div className='flex-1'>
                                  <FormField
                                    label=''
                                    placeholder='Key (e.g., Material, Size, Color)'
                                    value={spec.key}
                                    onChange={e => {
                                      const newSpecs = [...(formData.specifications || [])];
                                      newSpecs[index] = { ...spec, key: e.target.value };
                                      handleChange('specifications', newSpecs);
                                    }}
                                  />
                                </div>
                                <div className='flex-1'>
                                  <FormField
                                    label=''
                                    placeholder='Value (e.g., Cotton, M, Red)'
                                    value={spec.value}
                                    onChange={e => {
                                      const newSpecs = [...(formData.specifications || [])];
                                      newSpecs[index] = { ...spec, value: e.target.value };
                                      handleChange('specifications', newSpecs);
                                    }}
                                  />
                                </div>
                                <button
                                  type='button'
                                  onClick={() => {
                                    const newSpecs = (formData.specifications || []).filter((_, i) => i !== index);
                                    handleChange('specifications', newSpecs);
                                  }}
                                  className='p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                                  title='Remove specification'>
                                  <X className='w-5 h-5' />
                                </button>
                              </div>
                            ))}

                            <button
                              type='button'
                              onClick={() => {
                                const newSpecs = [...(formData.specifications || []), { key: '', value: '' }];
                                handleChange('specifications', newSpecs);
                              }}
                              className='w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-500 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-medium'>
                              <Plus className='w-5 h-5' />
                              Add Specification
                            </button>
                          </div>

                          <p className='text-xs text-muted-foreground mt-3'>
                            Add key-value pairs that will be displayed in a table format below the product image on the product detail page.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price Calculation Preview */}
                  {activeTab === 'preview' &&
                    (() => {
                      const pricing = calculateTotalPrice();
                      const baseGoldRate = formData.hasGold && livePrices.gold > 0 ? livePrices.gold : formData.goldRatePerGram;
                      const baseSilverRate = formData.hasSilver && livePrices.silver > 0 ? livePrices.silver : formData.silverRatePerGram;
                      const VENDOR_WASTAGE_PERCENTAGE = 5;
                      const PLATFORM_CHARGES_PERCENTAGE = 2;
                      const MAKING_CHARGES_RATE_PER_GRAM = 500;
                      const GST_PERCENTAGE = formData.taxRate || 3;

                      return (
                        <div className='space-y-6'>
                          <div className='flex items-center justify-between'>
                            <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Price Calculation Preview</h3>
                            <div className='text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full'>
                              Read-only calculation breakdown
                            </div>
                          </div>

                          {/* Gold Price Breakdown */}
                          {formData.hasGold && formData.goldWeight > 0 && (
                            <div className='bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700'>
                              <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                                <span className='text-2xl'>🥇</span>
                                Gold Price Calculation
                              </h4>
                              <div className='space-y-3'>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Live Rate (per gram)</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>₹{baseGoldRate.toLocaleString()}</div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Gross Weight</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>{formData.goldWeight}g</div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Purity</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>
                                      {formData.goldPurity} ({pricing.goldPurityPercentage}%)
                                    </div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Net Weight</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>{pricing.netGoldWeight.toFixed(2)}g</div>
                                  </div>
                                </div>
                                <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                  <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Fine Gold Weight</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    {pricing.fineGoldWeight.toFixed(3)}g = {pricing.netGoldWeight.toFixed(2)}g ×{' '}
                                    {pricing.goldPurityPercentage}%
                                  </div>
                                </div>
                                <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                  <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Vendor Wastage</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.vendorWastage.toLocaleString()} = {formData.goldWeight}g × {VENDOR_WASTAGE_PERCENTAGE}% × ₹
                                    {baseGoldRate.toLocaleString()}
                                  </div>
                                </div>
                                <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                  <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Platform Charges</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.platformCharges.toLocaleString()} = {PLATFORM_CHARGES_PERCENTAGE}% of Subtotal
                                  </div>
                                </div>
                                <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded border-2 border-green-500'>
                                  <div className='text-green-800 dark:text-green-200 text-xs mb-1 font-medium'>Gold Price Formula</div>
                                  <div className='font-bold text-green-900 dark:text-green-100 text-lg'>
                                    ₹{pricing.goldPrice.toLocaleString()} = {pricing.fineGoldWeight.toFixed(3)}g × ₹
                                    {baseGoldRate.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Silver Price Breakdown */}
                          {formData.hasSilver && formData.silverWeight > 0 && (
                            <div className='bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700'>
                              <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                                <span className='text-2xl'>🥈</span>
                                Silver Price Calculation
                              </h4>
                              <div className='space-y-3'>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Live Rate (per gram)</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>₹{baseSilverRate.toLocaleString()}</div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Gross Weight</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>{formData.silverWeight}g</div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Purity</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>
                                      {formData.silverPurity} ({pricing.silverPurityPercentage}%)
                                    </div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Net Weight</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>
                                      {pricing.netSilverWeight.toFixed(2)}g
                                    </div>
                                  </div>
                                </div>
                                <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                  <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Fine Silver Weight</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    {pricing.fineSilverWeight.toFixed(3)}g = {pricing.netSilverWeight.toFixed(2)}g ×{' '}
                                    {pricing.silverPurityPercentage}%
                                  </div>
                                </div>
                                <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded border-2 border-green-500'>
                                  <div className='text-green-800 dark:text-green-200 text-xs mb-1 font-medium'>Silver Price Formula</div>
                                  <div className='font-bold text-green-900 dark:text-green-100 text-lg'>
                                    ₹{pricing.silverPrice.toLocaleString()} = {pricing.fineSilverWeight.toFixed(3)}g × ₹
                                    {baseSilverRate.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Diamonds Breakdown */}
                          {formData.hasDiamond && formData.diamondCarat > 0 && (
                            <div className='bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700'>
                              <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                                <span className='text-2xl'>💎</span>
                                Diamond Price Calculation
                              </h4>
                              <div className='space-y-3'>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Total Carat Weight</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>{formData.diamondCarat}ct</div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Rate per Carat</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>
                                      ₹{formData.diamondRatePerCarat.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Number of Stones</div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>{formData.numberOfStones || 1}</div>
                                  </div>
                                  {formData.diamondShape && (
                                    <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                      <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Shape</div>
                                      <div className='font-semibold text-slate-900 dark:text-white'>{formData.diamondShape}</div>
                                    </div>
                                  )}
                                </div>
                                <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded border-2 border-green-500'>
                                  <div className='text-green-800 dark:text-green-200 text-xs mb-1 font-medium'>Diamond Price Formula</div>
                                  <div className='font-bold text-green-900 dark:text-green-100 text-lg'>
                                    ₹{pricing.diamondPrice.toLocaleString()} = {formData.diamondCarat}ct × ₹
                                    {formData.diamondRatePerCarat.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Charges Breakdown */}
                          <div className='bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700'>
                            <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                              <span className='text-2xl'>💰</span>
                              Charges Breakdown
                            </h4>
                            <div className='space-y-3'>
                              <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Making Charges</div>
                                    <div className='text-xs text-slate-500 dark:text-slate-400'>
                                      {formData.makingChargesType === 'fixed'
                                        ? `Fixed: ₹${formData.makingCharges}`
                                        : formData.makingChargesType === 'percentage'
                                        ? `Percentage: ${formData.makingCharges}% of metal cost`
                                        : `${(formData.goldWeight + formData.silverWeight).toFixed(
                                            2
                                          )}g × ₹${MAKING_CHARGES_RATE_PER_GRAM} per gram`}
                                    </div>
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.makingCharges.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Vendor Wastage</div>
                                    <div className='text-xs text-slate-500 dark:text-slate-400'>
                                      {VENDOR_WASTAGE_PERCENTAGE}% of metal weight × rate
                                    </div>
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.vendorWastage.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Hallmark Charges</div>
                                    <div className='text-xs text-slate-500 dark:text-slate-400'>
                                      {formData.hallmarked || formData.bis_hallmark ? 'Applied' : 'Not applied'}
                                    </div>
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.hallmarkCharges.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Shipping Charges</div>
                                    <div className='text-xs text-slate-500 dark:text-slate-400'>
                                      {formData.free_shipping ? 'Free shipping' : 'Standard shipping'}
                                    </div>
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.shippingCharges.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Insurance</div>
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.insuranceCharges.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Packing</div>
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.packingCharges.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              {formData.otherCharges > 0 && (
                                <div className='bg-white dark:bg-slate-700 p-3 rounded border'>
                                  <div className='flex justify-between items-center'>
                                    <div>
                                      <div className='text-slate-600 dark:text-slate-400 text-xs mb-1'>Other Charges</div>
                                    </div>
                                    <div className='font-semibold text-slate-900 dark:text-white'>
                                      ₹{pricing.otherCharges.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* GST & Final Price */}
                          <div className='bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border-2 border-green-500'>
                            <h4 className='text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                              <span className='text-2xl'>📊</span>
                              Final Price Calculation
                            </h4>
                            <div className='space-y-3'>
                              <div className='bg-white dark:bg-slate-700 p-4 rounded border'>
                                <div className='flex justify-between items-center mb-2'>
                                  <div className='text-slate-700 dark:text-slate-300 font-medium'>Subtotal</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>₹{pricing.subtotal.toLocaleString()}</div>
                                </div>
                                <div className='text-xs text-slate-500 dark:text-slate-400'>
                                  Metal Price + Making Charges + Vendor Wastage + Diamonds + All Fixed Charges
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-4 rounded border'>
                                <div className='flex justify-between items-center mb-2'>
                                  <div className='text-slate-700 dark:text-slate-300 font-medium'>
                                    Platform Charges ({PLATFORM_CHARGES_PERCENTAGE}%)
                                  </div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>
                                    ₹{pricing.platformCharges.toLocaleString()}
                                  </div>
                                </div>
                                <div className='text-xs text-slate-500 dark:text-slate-400'>{PLATFORM_CHARGES_PERCENTAGE}% of Subtotal</div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-4 rounded border'>
                                <div className='flex justify-between items-center mb-2'>
                                  <div className='text-slate-700 dark:text-slate-300 font-medium'>Amount (Subtotal + Platform)</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>₹{pricing.amount.toLocaleString()}</div>
                                </div>
                              </div>
                              <div className='bg-white dark:bg-slate-700 p-4 rounded border'>
                                <div className='flex justify-between items-center mb-2'>
                                  <div className='text-slate-700 dark:text-slate-300 font-medium'>GST ({GST_PERCENTAGE}%)</div>
                                  <div className='font-semibold text-slate-900 dark:text-white'>₹{pricing.gstAmount.toLocaleString()}</div>
                                </div>
                                <div className='text-xs text-slate-500 dark:text-slate-400'>{GST_PERCENTAGE}% of Amount</div>
                              </div>
                              <div className='bg-green-100 dark:bg-green-900/40 p-4 rounded border-2 border-green-600'>
                                <div className='flex justify-between items-center'>
                                  <div className='text-green-900 dark:text-green-100 font-bold text-lg'>Total Final Price</div>
                                  <div className='font-bold text-green-900 dark:text-green-100 text-2xl'>
                                    ₹{pricing.totalFinalPrice.toLocaleString()}
                                  </div>
                                </div>
                                <div className='text-xs text-green-700 dark:text-green-300 mt-2'>
                                  Amount + GST = ₹{pricing.amount.toLocaleString()} + ₹{pricing.gstAmount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Summary Card */}
                          <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800'>
                            <h4 className='text-md font-semibold text-blue-900 dark:text-blue-100 mb-3'>Calculation Summary</h4>
                            <div className='space-y-2 text-sm'>
                              <div className='flex justify-between'>
                                <span className='text-blue-700 dark:text-blue-300'>Metal Price:</span>
                                <span className='font-semibold text-blue-900 dark:text-blue-100'>
                                  ₹{pricing.metalPrice.toLocaleString()}
                                </span>
                              </div>
                              {pricing.diamondPrice > 0 && (
                                <div className='flex justify-between'>
                                  <span className='text-blue-700 dark:text-blue-300'>Diamond Price:</span>
                                  <span className='font-semibold text-blue-900 dark:text-blue-100'>
                                    ₹{pricing.diamondPrice.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <div className='flex justify-between'>
                                <span className='text-blue-700 dark:text-blue-300'>All Charges:</span>
                                <span className='font-semibold text-blue-900 dark:text-blue-100'>
                                  ₹
                                  {(
                                    pricing.makingCharges +
                                    pricing.vendorWastage +
                                    pricing.hallmarkCharges +
                                    pricing.shippingCharges +
                                    pricing.insuranceCharges +
                                    pricing.packingCharges +
                                    pricing.otherCharges
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className='flex justify-between border-t pt-2 mt-2'>
                                <span className='text-blue-900 dark:text-blue-100 font-bold'>Final Price:</span>
                                <span className='font-bold text-blue-900 dark:text-blue-100 text-lg'>
                                  ₹{pricing.totalFinalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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
