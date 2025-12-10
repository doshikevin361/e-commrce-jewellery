'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Filter, Grid, List, Star, SlidersHorizontal, Check, ArrowUpDown, Sparkles, Gem, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLoader } from '@/components/common/page-loader';

// Dynamic interfaces
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  category: string;
  brand?: string;
  mainImage: string;
  displayPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
  urlSlug?: string;
  // Product Type
  product_type?: string;
  // Material flags
  hasGold?: boolean;
  hasSilver?: boolean;
  hasDiamond?: boolean;
  // Gold fields
  goldPurity?: string;
  goldWeight?: number;
  // Silver fields
  silverPurity?: string;
  silverWeight?: number;
  // Diamond fields
  diamondCarat?: number;
  diamondShape?: string;
  diamondCut?: string;
  numberOfStones?: number;
  // Legacy fields
  metalType?: string;
  metalPurity?: string;
  metalWeight?: number;
  stoneType?: string;
  stoneClarity?: string;
  stoneColor?: string;
  stoneCut?: string;
  // Jewelry Type & Details
  jewelryType?: string;
  jewelrySubType?: string;
  // Ring Details
  ringSetting?: string;
  ringSize?: string;
  ringSizeSystem?: string;
  ringStyle?: string;
  // Chain Details
  chainType?: string;
  chainLength?: number;
  // Earring Details
  earringType?: string;
  earringBackType?: string;
  // Bracelet Details
  braceletType?: string;
  braceletLength?: number;
  // Design & Style
  designStyle?: string;
  finishType?: string;
  pattern?: string;
  stoneSetting?: string;
  stoneArrangement?: string;
  // Demographics
  gender?: string;
  // Quality & Certification
  hallmarked?: boolean;
  bis_hallmark?: boolean;
  certification?: string;
  // Size
  size?: string;
  totalWeight?: number;
}

// Convert Product to ProductCardData
const convertToProductCard = (product: Product): ProductCardData => {
  const productId = product._id.toString();
  return {
    id: productId,
    _id: productId, // Ensure _id is set as string for ProductCard component
    title: product.name,
    category: product.category,
    price: `₹${product.displayPrice.toLocaleString()}`,
    originalPrice: product.hasDiscount ? `₹${product.originalPrice.toLocaleString()}` : undefined,
    rating: product.rating || 4.5,
    reviews: product.reviewCount || 0,
    image: product.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    badge: product.featured ? 'Featured' : product.trending ? 'Trending' : undefined,
    // Extended attributes for filtering
    material: product.metalType || 'Gold',
    brand: product.brand || 'Unknown',
    inStock: product.stock > 0,
    color: product.metalPurity || 'Gold',
    size: product.size || 'Medium',
  };
};

export function DynamicProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for dynamic data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and display states
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Jewelry Type Filters
  const [selectedJewelryTypes, setSelectedJewelryTypes] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  
  // Material Filters
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]); // Gold, Silver, Diamond
  const [selectedGoldPurity, setSelectedGoldPurity] = useState<string[]>([]);
  const [selectedSilverPurity, setSelectedSilverPurity] = useState<string[]>([]);
  
  // Diamond/Gemstone Filters
  const [selectedDiamondShapes, setSelectedDiamondShapes] = useState<string[]>([]);
  const [selectedDiamondCuts, setSelectedDiamondCuts] = useState<string[]>([]);
  const [selectedStoneTypes, setSelectedStoneTypes] = useState<string[]>([]);
  const [diamondCaratRange, setDiamondCaratRange] = useState<[number, number]>([0, 10]);
  
  // Ring Specific Filters
  const [selectedRingSettings, setSelectedRingSettings] = useState<string[]>([]);
  const [selectedRingSizes, setSelectedRingSizes] = useState<string[]>([]);
  const [selectedRingStyles, setSelectedRingStyles] = useState<string[]>([]);
  
  // Chain Specific Filters
  const [selectedChainTypes, setSelectedChainTypes] = useState<string[]>([]);
  
  // Earring Specific Filters
  const [selectedEarringTypes, setSelectedEarringTypes] = useState<string[]>([]);
  
  // Bracelet Specific Filters
  const [selectedBraceletTypes, setSelectedBraceletTypes] = useState<string[]>([]);
  
  // Design & Style Filters
  const [selectedDesignStyles, setSelectedDesignStyles] = useState<string[]>([]);
  const [selectedFinishTypes, setSelectedFinishTypes] = useState<string[]>([]);
  const [selectedStoneSettings, setSelectedStoneSettings] = useState<string[]>([]);
  
  // Demographics
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  
  // Quality Filters
  const [showHallmarkedOnly, setShowHallmarkedOnly] = useState(false);
  const [showBISHallmarkedOnly, setShowBISHallmarkedOnly] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  // Extract filter options from products
  const filterOptions = useMemo(() => {
    const materials: string[] = [];
    products.forEach(p => {
      if (p.hasGold) materials.push('Gold');
      if (p.hasSilver) materials.push('Silver');
      if (p.hasDiamond) materials.push('Diamond');
      // Legacy support
      if (p.metalType && !materials.includes(p.metalType)) materials.push(p.metalType);
    });

    const jewelryTypes = [...new Set(products.map(p => p.jewelryType).filter(Boolean))];
    const productTypes = [...new Set(products.map(p => p.product_type).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    
    const goldPurities = [...new Set(products.map(p => p.goldPurity).filter(Boolean))];
    const silverPurities = [...new Set(products.map(p => p.silverPurity).filter(Boolean))];
    
    const diamondShapes = [...new Set(products.map(p => p.diamondShape).filter(Boolean))];
    const diamondCuts = [...new Set(products.map(p => p.diamondCut).filter(Boolean))];
    const stoneTypes = [...new Set(products.map(p => p.stoneType).filter(Boolean))];
    
    const ringSettings = [...new Set(products.map(p => p.ringSetting).filter(Boolean))];
    const ringSizes = [...new Set(products.map(p => p.ringSize).filter(Boolean))];
    const ringStyles = [...new Set(products.map(p => p.ringStyle).filter(Boolean))];
    
    const chainTypes = [...new Set(products.map(p => p.chainType).filter(Boolean))];
    const earringTypes = [...new Set(products.map(p => p.earringType).filter(Boolean))];
    const braceletTypes = [...new Set(products.map(p => p.braceletType).filter(Boolean))];
    
    const designStyles = [...new Set(products.map(p => p.designStyle).filter(Boolean))];
    const finishTypes = [...new Set(products.map(p => p.finishType).filter(Boolean))];
    const stoneSettings = [...new Set(products.map(p => p.stoneSetting).filter(Boolean))];
    
    const genders = [...new Set(products.map(p => p.gender).filter(Boolean))];
    const certifications = [...new Set(products.map(p => p.certification).filter(Boolean))];

    const maxDiamondCarat = Math.max(...products.map(p => p.diamondCarat || 0).filter(c => c > 0), 10);

    return {
      materials: [...new Set(materials)],
      jewelryTypes,
      productTypes,
      brands,
      goldPurities,
      silverPurities,
      diamondShapes,
      diamondCuts,
      stoneTypes,
      ringSettings,
      ringSizes,
      ringStyles,
      chainTypes,
      earringTypes,
      braceletTypes,
      designStyles,
      finishTypes,
      stoneSettings,
      genders,
      certifications,
      maxDiamondCarat,
    };
  }, [products]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get URL parameters
        const category = searchParams.get('category');
        const productType = searchParams.get('product_type');
        const jewelryType = searchParams.get('jewelryType');
        const featured = searchParams.get('featured');
        const trending = searchParams.get('trending');
        const search = searchParams.get('search');

        // Build API URL
        const params = new URLSearchParams();
        if (category && category !== 'all') params.set('category', category);
        if (productType) params.set('product_type', productType);
        if (jewelryType) params.set('jewelryType', jewelryType);
        if (featured) params.set('featured', featured);
        if (trending) params.set('trending', trending);
        params.set('limit', '100'); // Get more products for filtering

        // Fetch products
        const productsRes = await fetch(`/api/public/products?${params.toString()}`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          let fetchedProducts = productsData.products || [];

          // Apply search filter if provided
          if (search) {
            fetchedProducts = fetchedProducts.filter(
              (product: Product) =>
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()))
            );
          }

          setProducts(fetchedProducts);
        }

        // Fetch categories
        const categoriesRes = await fetch('/api/public/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const productType = searchParams.get('product_type');
    const jewelryType = searchParams.get('jewelryType');
    
    if (category && category !== 'all') {
      setSelectedCategories([category]);
    }
    
    // Set product type filter from URL
    if (productType) {
      setSelectedProductTypes([productType]);
    }
    
    // Set jewelry type filter from URL
    if (jewelryType) {
      setSelectedJewelryTypes([jewelryType]);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Price range filter
      if (product.displayPrice < priceRange[0] || product.displayPrice > priceRange[1]) return false;

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;

      // Brand filter
      if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand))) return false;

      // Jewelry Type filter
      if (selectedJewelryTypes.length > 0 && (!product.jewelryType || !selectedJewelryTypes.includes(product.jewelryType))) return false;

      // Product Type filter
      if (selectedProductTypes.length > 0 && (!product.product_type || !selectedProductTypes.includes(product.product_type))) return false;

      // Material filter (Gold, Silver, Diamond)
      if (selectedMaterials.length > 0) {
        const hasSelectedMaterial = selectedMaterials.some(material => {
          if (material === 'Gold') return product.hasGold || product.metalType === 'Gold';
          if (material === 'Silver') return product.hasSilver || product.metalType === 'Silver';
          if (material === 'Diamond') return product.hasDiamond || product.stoneType === 'Diamond';
          return product.metalType === material;
        });
        if (!hasSelectedMaterial) return false;
      }

      // Gold Purity filter
      if (selectedGoldPurity.length > 0 && (!product.goldPurity || !selectedGoldPurity.includes(product.goldPurity))) {
        // Also check legacy metalPurity if it's a gold purity
        if (!product.metalPurity || !selectedGoldPurity.includes(product.metalPurity)) return false;
      }

      // Silver Purity filter
      if (selectedSilverPurity.length > 0 && (!product.silverPurity || !selectedSilverPurity.includes(product.silverPurity))) {
        // Also check legacy metalPurity if it's a silver purity
        if (!product.metalPurity || !selectedSilverPurity.includes(product.metalPurity)) return false;
      }

      // Diamond Shape filter
      if (selectedDiamondShapes.length > 0 && (!product.diamondShape || !selectedDiamondShapes.includes(product.diamondShape))) return false;

      // Diamond Cut filter
      if (selectedDiamondCuts.length > 0 && (!product.diamondCut || !selectedDiamondCuts.includes(product.diamondCut))) {
        // Also check legacy stoneCut
        if (!product.stoneCut || !selectedDiamondCuts.includes(product.stoneCut)) return false;
      }

      // Stone Type filter
      if (selectedStoneTypes.length > 0 && (!product.stoneType || !selectedStoneTypes.includes(product.stoneType))) return false;

      // Diamond Carat Range filter
      if (product.diamondCarat && (product.diamondCarat < diamondCaratRange[0] || product.diamondCarat > diamondCaratRange[1])) return false;

      // Ring Setting filter
      if (selectedRingSettings.length > 0 && (!product.ringSetting || !selectedRingSettings.includes(product.ringSetting))) return false;

      // Ring Size filter
      if (selectedRingSizes.length > 0 && (!product.ringSize || !selectedRingSizes.includes(product.ringSize))) return false;

      // Ring Style filter
      if (selectedRingStyles.length > 0 && (!product.ringStyle || !selectedRingStyles.includes(product.ringStyle))) return false;

      // Chain Type filter
      if (selectedChainTypes.length > 0 && (!product.chainType || !selectedChainTypes.includes(product.chainType))) return false;

      // Earring Type filter
      if (selectedEarringTypes.length > 0 && (!product.earringType || !selectedEarringTypes.includes(product.earringType))) return false;

      // Bracelet Type filter
      if (selectedBraceletTypes.length > 0 && (!product.braceletType || !selectedBraceletTypes.includes(product.braceletType))) return false;

      // Design Style filter
      if (selectedDesignStyles.length > 0 && (!product.designStyle || !selectedDesignStyles.includes(product.designStyle))) return false;

      // Finish Type filter
      if (selectedFinishTypes.length > 0 && (!product.finishType || !selectedFinishTypes.includes(product.finishType))) return false;

      // Stone Setting filter
      if (selectedStoneSettings.length > 0 && (!product.stoneSetting || !selectedStoneSettings.includes(product.stoneSetting))) return false;

      // Gender filter
      if (selectedGenders.length > 0 && (!product.gender || !selectedGenders.includes(product.gender))) return false;

      // Hallmark filter
      if (showHallmarkedOnly && !product.hallmarked && !product.bis_hallmark) return false;

      // BIS Hallmark filter
      if (showBISHallmarkedOnly && !product.bis_hallmark) return false;

      // Certification filter
      if (selectedCertifications.length > 0 && (!product.certification || !selectedCertifications.includes(product.certification))) return false;

      // Stock filter
      if (showInStockOnly && product.stock <= 0) return false;

      // Rating filter
      if (minRating > 0 && (product.rating || 0) < minRating) return false;

      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.displayPrice - b.displayPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.displayPrice - a.displayPrice);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        // Assuming newer products have higher _id values
        filtered.sort((a, b) => b._id.localeCompare(a._id));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default: featured first, then trending, then by rating
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
    }

    return filtered;
  }, [
    products,
    priceRange,
    selectedCategories,
    selectedBrands,
    selectedJewelryTypes,
    selectedProductTypes,
    selectedMaterials,
    selectedGoldPurity,
    selectedSilverPurity,
    selectedDiamondShapes,
    selectedDiamondCuts,
    selectedStoneTypes,
    diamondCaratRange,
    selectedRingSettings,
    selectedRingSizes,
    selectedRingStyles,
    selectedChainTypes,
    selectedEarringTypes,
    selectedBraceletTypes,
    selectedDesignStyles,
    selectedFinishTypes,
    selectedStoneSettings,
    selectedGenders,
    showHallmarkedOnly,
    showBISHallmarkedOnly,
    selectedCertifications,
    showInStockOnly,
    minRating,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedJewelryTypes([]);
    setSelectedProductTypes([]);
    setSelectedMaterials([]);
    setSelectedGoldPurity([]);
    setSelectedSilverPurity([]);
    setSelectedDiamondShapes([]);
    setSelectedDiamondCuts([]);
    setSelectedStoneTypes([]);
    setDiamondCaratRange([0, Math.max(10, filterOptions.maxDiamondCarat || 10)]);
    setSelectedRingSettings([]);
    setSelectedRingSizes([]);
    setSelectedRingStyles([]);
    setSelectedChainTypes([]);
    setSelectedEarringTypes([]);
    setSelectedBraceletTypes([]);
    setSelectedDesignStyles([]);
    setSelectedFinishTypes([]);
    setSelectedStoneSettings([]);
    setSelectedGenders([]);
    setShowHallmarkedOnly(false);
    setShowBISHallmarkedOnly(false);
    setSelectedCertifications([]);
    setShowInStockOnly(false);
    setMinRating(0);
    setCurrentPage(1);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    const slug = product.urlSlug || product._id;
    router.push(`/products/${slug}`);
  };

  if (loading) {
    return <PageLoader message="Loading products..." className="min-h-screen" />;
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error}</p>
          <button onClick={() => window.location.reload()} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 max-w-[1440px]'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8'>
        <div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900'>
            {searchParams.get('category') ? `${searchParams.get('category')} Collection` : 'All Products'}
          </h1>
          <p className='text-sm sm:text-base text-gray-600 mt-1'>{filteredAndSortedProducts.length} products found</p>
        </div>

        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'>
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-full sm:w-48 text-xs sm:text-sm'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='default'>Default</SelectItem>
              <SelectItem value='price-low'>Price: Low to High</SelectItem>
              <SelectItem value='price-high'>Price: High to Low</SelectItem>
              <SelectItem value='rating'>Highest Rated</SelectItem>
              <SelectItem value='newest'>Newest First</SelectItem>
              <SelectItem value='name'>Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className='flex rounded-lg border border-gray-200 p-1'>
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size='sm' onClick={() => setViewMode('grid')} className='px-3'>
              <Grid className='w-4 h-4' />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size='sm' onClick={() => setViewMode('list')} className='px-3'>
              <List className='w-4 h-4' />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button variant='outline' onClick={() => setShowFilters(!showFilters)} className='flex items-center gap-2'>
            <Filter className='w-4 h-4' />
            Filters
          </Button>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8'>
        {/* Filters Sidebar - Mobile: Overlay, Desktop: Sidebar */}
        {showFilters && (
          <div className='lg:hidden fixed inset-0 z-50 bg-black/50' onClick={() => setShowFilters(false)} />
        )}
        {showFilters && (
          <div className='w-full lg:w-80 flex-shrink-0 fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto bg-white lg:bg-transparent shadow-xl lg:shadow-none'>
            <div className='bg-white border border-gray-200 rounded-lg lg:rounded-lg p-4 sm:p-5 md:p-6 h-full lg:h-auto lg:sticky top-20 sm:top-24 md:top-28 lg:top-32 max-h-[100vh] lg:max-h-[calc(100vh-6rem)] overflow-y-auto'>
              <div className='flex items-center justify-between mb-4 sm:mb-5 md:mb-6'>
                <h3 className='text-base sm:text-lg font-semibold text-gray-900'>Filters</h3>
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='sm' onClick={clearAllFilters} className='text-xs sm:text-sm'>
                    Clear All
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowFilters(false)}
                    className='lg:hidden'>
                    <X className='w-4 h-4 sm:w-5 sm:h-5' />
                  </Button>
                </div>
              </div>

              <div className='space-y-6'>
                {/* Price Range */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Price Range (₹)</h4>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={100000} min={0} step={1000} className='mb-2' />
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Jewelry Type - Most Important Filter */}
                {filterOptions.jewelryTypes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Jewelry Type</h4>
                    <div className='space-y-2 max-h-48 overflow-y-auto'>
                      {filterOptions.jewelryTypes.map(type => (
                        <label key={type} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedJewelryTypes.includes(type)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedJewelryTypes([...selectedJewelryTypes, type]);
                              } else {
                                setSelectedJewelryTypes(selectedJewelryTypes.filter(t => t !== type));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Type - Dynamic from all product types */}
                {filterOptions.productTypes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Product Type</h4>
                    <div className='space-y-3'>
                      {filterOptions.productTypes.map(productType => {
                        // Determine styling based on product type
                        const getTypeStyle = (type: string) => {
                          if (type.includes('Gold')) {
                            return { borderColor: 'border-[#C8A15B]/30', textColor: 'text-[#C8A15B]' };
                          } else if (type.includes('Silver')) {
                            return { borderColor: 'border-gray-300', textColor: 'text-gray-600' };
                          } else if (type.includes('Diamond')) {
                            return { borderColor: 'border-blue-300', textColor: 'text-blue-600' };
                          } else if (type.includes('Platinum')) {
                            return { borderColor: 'border-gray-400', textColor: 'text-gray-700' };
                          } else if (type.includes('Gemstone')) {
                            return { borderColor: 'border-purple-300', textColor: 'text-purple-600' };
                          }
                          return { borderColor: 'border-gray-200', textColor: 'text-gray-700' };
                        };

                        const style = getTypeStyle(productType);
                        const isGold = productType.includes('Gold');
                        const isSilver = productType.includes('Silver');

                        // Get border color class
                        const borderClass = style.borderColor;

                        return (
                          <div key={productType} className={`pl-2 border-l-2 ${borderClass}`}>
                            <label className='flex items-center gap-2 cursor-pointer'>
                              <input
                                type='checkbox'
                                checked={selectedProductTypes.includes(productType)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedProductTypes([...selectedProductTypes, productType]);
                                  } else {
                                    setSelectedProductTypes(selectedProductTypes.filter(t => t !== productType));
                                  }
                                  setCurrentPage(1);
                                }}
                                className='rounded border-gray-300'
                              />
                              <span className={`text-sm font-medium ${style.textColor}`}>{productType}</span>
                            </label>
                            
                            {/* Show Gold Purity if Gold Jewelry */}
                            {isGold && filterOptions.goldPurities.length > 0 && selectedProductTypes.includes(productType) && (
                              <div className='ml-6 mt-2 space-y-2'>
                                <p className='text-xs text-gray-600 mb-2'>Gold Purity:</p>
                                {filterOptions.goldPurities.map(purity => (
                                  <label key={purity} className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                      type='checkbox'
                                      checked={selectedGoldPurity.includes(purity)}
                                      onChange={e => {
                                        if (e.target.checked) {
                                          setSelectedGoldPurity([...selectedGoldPurity, purity]);
                                        } else {
                                          setSelectedGoldPurity(selectedGoldPurity.filter(p => p !== purity));
                                        }
                                        setCurrentPage(1);
                                      }}
                                      className='rounded border-gray-300'
                                    />
                                    <span className='text-sm text-gray-700'>{purity}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {/* Show Silver Purity if Silver Jewelry */}
                            {isSilver && filterOptions.silverPurities.length > 0 && selectedProductTypes.includes(productType) && (
                              <div className='ml-6 mt-2 space-y-2'>
                                <p className='text-xs text-gray-600 mb-2'>Silver Purity:</p>
                                {filterOptions.silverPurities.map(purity => (
                                  <label key={purity} className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                      type='checkbox'
                                      checked={selectedSilverPurity.includes(purity)}
                                      onChange={e => {
                                        if (e.target.checked) {
                                          setSelectedSilverPurity([...selectedSilverPurity, purity]);
                                        } else {
                                          setSelectedSilverPurity(selectedSilverPurity.filter(p => p !== purity));
                                        }
                                        setCurrentPage(1);
                                      }}
                                      className='rounded border-gray-300'
                                    />
                                    <span className='text-sm text-gray-700'>{purity}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gold Purity */}
                {filterOptions.goldPurities.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Gold Purity</h4>
                    <div className='space-y-2'>
                      {filterOptions.goldPurities.map(purity => (
                        <label key={purity} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedGoldPurity.includes(purity)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedGoldPurity([...selectedGoldPurity, purity]);
                              } else {
                                setSelectedGoldPurity(selectedGoldPurity.filter(p => p !== purity));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{purity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Silver Purity */}
                {filterOptions.silverPurities.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Silver Purity</h4>
                    <div className='space-y-2'>
                      {filterOptions.silverPurities.map(purity => (
                        <label key={purity} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedSilverPurity.includes(purity)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedSilverPurity([...selectedSilverPurity, purity]);
                              } else {
                                setSelectedSilverPurity(selectedSilverPurity.filter(p => p !== purity));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{purity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diamond Carat Range */}
                {filterOptions.maxDiamondCarat > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Diamond Carat</h4>
                    <Slider 
                      value={diamondCaratRange} 
                      onValueChange={setDiamondCaratRange} 
                      max={filterOptions.maxDiamondCarat} 
                      min={0} 
                      step={0.1} 
                      className='mb-2' 
                    />
                    <div className='flex justify-between text-sm text-gray-600'>
                      <span>{diamondCaratRange[0]} ct</span>
                      <span>{diamondCaratRange[1]} ct</span>
                    </div>
                  </div>
                )}

                {/* Diamond Shape */}
                {filterOptions.diamondShapes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Diamond Shape</h4>
                    <div className='space-y-2'>
                      {filterOptions.diamondShapes.map(shape => (
                        <label key={shape} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedDiamondShapes.includes(shape)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDiamondShapes([...selectedDiamondShapes, shape]);
                              } else {
                                setSelectedDiamondShapes(selectedDiamondShapes.filter(s => s !== shape));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{shape}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diamond Cut */}
                {filterOptions.diamondCuts.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Diamond Cut</h4>
                    <div className='space-y-2'>
                      {filterOptions.diamondCuts.map(cut => (
                        <label key={cut} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedDiamondCuts.includes(cut)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDiamondCuts([...selectedDiamondCuts, cut]);
                              } else {
                                setSelectedDiamondCuts(selectedDiamondCuts.filter(c => c !== cut));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{cut}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stone Type */}
                {filterOptions.stoneTypes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Gemstone Type</h4>
                    <div className='space-y-2 max-h-40 overflow-y-auto'>
                      {filterOptions.stoneTypes.map(stone => (
                        <label key={stone} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedStoneTypes.includes(stone)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedStoneTypes([...selectedStoneTypes, stone]);
                              } else {
                                setSelectedStoneTypes(selectedStoneTypes.filter(s => s !== stone));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{stone}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ring Specific Filters */}
                {filterOptions.ringSettings.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Ring Setting</h4>
                    <div className='space-y-2 max-h-40 overflow-y-auto'>
                      {filterOptions.ringSettings.map(setting => (
                        <label key={setting} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedRingSettings.includes(setting)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedRingSettings([...selectedRingSettings, setting]);
                              } else {
                                setSelectedRingSettings(selectedRingSettings.filter(s => s !== setting));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{setting}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filterOptions.ringStyles.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Ring Style</h4>
                    <div className='space-y-2'>
                      {filterOptions.ringStyles.map(style => (
                        <label key={style} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedRingStyles.includes(style)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedRingStyles([...selectedRingStyles, style]);
                              } else {
                                setSelectedRingStyles(selectedRingStyles.filter(s => s !== style));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chain Type */}
                {filterOptions.chainTypes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Chain Type</h4>
                    <div className='space-y-2 max-h-40 overflow-y-auto'>
                      {filterOptions.chainTypes.map(type => (
                        <label key={type} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedChainTypes.includes(type)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedChainTypes([...selectedChainTypes, type]);
                              } else {
                                setSelectedChainTypes(selectedChainTypes.filter(t => t !== type));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Earring Type */}
                {filterOptions.earringTypes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Earring Type</h4>
                    <div className='space-y-2'>
                      {filterOptions.earringTypes.map(type => (
                        <label key={type} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedEarringTypes.includes(type)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedEarringTypes([...selectedEarringTypes, type]);
                              } else {
                                setSelectedEarringTypes(selectedEarringTypes.filter(t => t !== type));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bracelet Type */}
                {filterOptions.braceletTypes.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Bracelet Type</h4>
                    <div className='space-y-2'>
                      {filterOptions.braceletTypes.map(type => (
                        <label key={type} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedBraceletTypes.includes(type)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedBraceletTypes([...selectedBraceletTypes, type]);
                              } else {
                                setSelectedBraceletTypes(selectedBraceletTypes.filter(t => t !== type));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Design Style */}
                {filterOptions.designStyles.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Design Style</h4>
                    <div className='space-y-2'>
                      {filterOptions.designStyles.map(style => (
                        <label key={style} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedDesignStyles.includes(style)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDesignStyles([...selectedDesignStyles, style]);
                              } else {
                                setSelectedDesignStyles(selectedDesignStyles.filter(s => s !== style));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gender */}
                {filterOptions.genders.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Gender</h4>
                    <div className='space-y-2'>
                      {filterOptions.genders.map(gender => (
                        <label key={gender} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedGenders.includes(gender)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedGenders([...selectedGenders, gender]);
                              } else {
                                setSelectedGenders(selectedGenders.filter(g => g !== gender));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality & Certification */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Quality & Certification</h4>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={showHallmarkedOnly}
                        onChange={e => {
                          setShowHallmarkedOnly(e.target.checked);
                          setCurrentPage(1);
                        }}
                        className='rounded border-gray-300'
                      />
                      <span className='text-sm text-gray-700'>Hallmarked</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={showBISHallmarkedOnly}
                        onChange={e => {
                          setShowBISHallmarkedOnly(e.target.checked);
                          setCurrentPage(1);
                        }}
                        className='rounded border-gray-300'
                      />
                      <span className='text-sm text-gray-700'>BIS Hallmarked</span>
                    </label>
                  </div>
                </div>

                {filterOptions.certifications.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Certification</h4>
                    <div className='space-y-2'>
                      {filterOptions.certifications.map(cert => (
                        <label key={cert} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedCertifications.includes(cert)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCertifications([...selectedCertifications, cert]);
                              } else {
                                setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Categories</h4>
                    <div className='space-y-2 max-h-40 overflow-y-auto'>
                      {categories.map(category => (
                        <label key={category._id} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedCategories.includes(category.name)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.name]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{category.name}</span>
                          <span className='text-xs text-gray-500'>({category.productCount})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {filterOptions.brands.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-3'>Brands</h4>
                    <div className='space-y-2 max-h-40 overflow-y-auto'>
                      {filterOptions.brands.map(brand => (
                        <label key={brand} className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedBrands.includes(brand)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }
                              setCurrentPage(1);
                            }}
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Filter */}
                <div>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={showInStockOnly}
                      onChange={e => {
                        setShowInStockOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className='rounded border-gray-300'
                    />
                    <span className='text-sm text-gray-700'>In Stock Only</span>
                  </label>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Minimum Rating</h4>
                  <div className='space-y-2'>
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='radio'
                          name='rating'
                          checked={minRating === rating}
                          onChange={() => {
                            setMinRating(rating);
                            setCurrentPage(1);
                          }}
                          className='rounded border-gray-300'
                        />
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className='text-sm text-gray-700'>& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className='flex-1'>
          {paginatedProducts.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                <Gem className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No products found</h3>
              <p className='text-gray-600 mb-4'>Try adjusting your filters or search terms</p>
              <Button onClick={clearAllFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
                }`}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product._id} product={convertToProductCard(product)} onClick={() => handleProductClick(product)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-2 mt-12'>
                  <Button variant='outline' onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>

                  <div className='flex gap-1'>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => setCurrentPage(page)}
                            className='w-10'>
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return (
                          <span key={page} className='px-2'>
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant='outline'
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
