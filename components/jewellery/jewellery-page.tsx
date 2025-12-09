'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Filter, Gem, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/common/page-loader';

// Interfaces
interface Category {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface Brand {
  _id: string;
  name: string;
  status: string;
}

interface Attribute {
  _id: string;
  name: string;
  style: string;
  values: string[];
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
  metalType?: string;
  metalPurity?: string;
  stoneType?: string;
  gender?: string;
  size?: string;
  [key: string]: any; // For dynamic attributes
}

// Convert Product to ProductCardData
const convertToProductCard = (product: Product): ProductCardData => ({
  id: product._id,
  title: product.name,
  category: product.category,
  price: `₹${product.displayPrice.toLocaleString()}`,
  originalPrice: product.hasDiscount ? `₹${product.originalPrice.toLocaleString()}` : undefined,
  rating: product.rating || 4.5,
  reviews: product.reviewCount || 0,
  image: product.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  badge: product.featured ? 'Featured' : product.trending ? 'Trending' : undefined,
  material: product.metalType || 'Gold',
  brand: product.brand || 'Unknown',
  inStock: product.stock > 0,
});

// Predefined price ranges
const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
  { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
  { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
  { label: '₹1,00,000 - ₹2,50,000', min: 100000, max: 250000 },
  { label: 'Above ₹2,50,000', min: 250000, max: 10000000 },
];

export function JewelleryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for dynamic data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and display states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    attributes: true,
    price: true,
  });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsRes = await fetch('/api/public/products?limit=1000');
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }

        // Fetch categories
        const categoriesRes = await fetch('/api/public/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        // Fetch brands
        const brandsRes = await fetch('/api/public/brands');
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.brands || []);
        }

        // Fetch attributes
        const attributesRes = await fetch('/api/public/attributes');
        if (attributesRes.ok) {
          const attributesData = await attributesRes.json();
          setAttributes(attributesData.attributes || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load jewellery products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const search = searchParams.get('search');

    // Only update if params exist to avoid clearing filters unnecessarily
    if (category !== null) {
      setSelectedCategories(category ? category.split(',').filter(Boolean) : []);
    }
    if (brand !== null) {
      setSelectedBrands(brand ? brand.split(',').filter(Boolean) : []);
    }
    if (minPrice && maxPrice) {
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    }
    if (inStock === 'true') {
      setShowInStockOnly(true);
    } else if (inStock === 'false' || (inStock === null && showInStockOnly)) {
      // Only reset if explicitly set to false
    }

    // Parse attribute filters - check all URL params for attribute matches
    const attrFilters: Record<string, string[]> = {};

    // Check known attribute names first
    attributes.forEach(attr => {
      const paramName = attr.name.toLowerCase().replace(/\s+/g, '_');
      const value = searchParams.get(paramName);
      if (value) {
        attrFilters[attr.name] = value.split(',').filter(Boolean);
      }
    });

    // Also check for any other URL params that might be attributes (for dynamic attribute support)
    searchParams.forEach((value, key) => {
      if (!['category', 'brand', 'minPrice', 'maxPrice', 'inStock', 'search'].includes(key)) {
        // This might be an attribute
        const matchingAttr = attributes.find(attr => attr.name.toLowerCase().replace(/\s+/g, '_') === key);
        if (matchingAttr) {
          if (!attrFilters[matchingAttr.name]) {
            attrFilters[matchingAttr.name] = [];
          }
          attrFilters[matchingAttr.name] = value.split(',').filter(Boolean);
        } else {
          // Try to match by common attribute patterns
          const normalizedKey = key.toLowerCase();
          if (
            normalizedKey.includes('metal') ||
            normalizedKey.includes('purity') ||
            normalizedKey.includes('stone') ||
            normalizedKey.includes('type') ||
            normalizedKey.includes('gender')
          ) {
            // Create a temporary attribute filter
            const attrName = key
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            attrFilters[attrName] = value.split(',').filter(Boolean);
          }
        }
      }
    });

    if (Object.keys(attrFilters).length > 0) {
      setSelectedAttributes(attrFilters);
    } else if (attributes.length > 0) {
      // Only reset if we have attributes loaded and no filters in URL
      const hasAnyParam =
        searchParams.has('category') ||
        searchParams.has('brand') ||
        searchParams.has('minPrice') ||
        searchParams.has('maxPrice') ||
        searchParams.has('inStock') ||
        searchParams.has('search');
      if (!hasAnyParam) {
        setSelectedAttributes({});
      }
    }

    // Handle search query
    if (search !== null) {
      setSearchQuery(search || '');
    }
  }, [searchParams, attributes.length]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    }
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      params.set('minPrice', priceRange[0].toString());
      params.set('maxPrice', priceRange[1].toString());
    }
    if (showInStockOnly) {
      params.set('inStock', 'true');
    }

    // Add attribute filters
    Object.entries(selectedAttributes).forEach(([attrName, values]) => {
      if (values.length > 0) {
        params.set(attrName.toLowerCase().replace(/\s+/g, '_'), values.join(','));
      }
    });

    const newUrl = params.toString() ? `/jewellery?${params.toString()}` : '/jewellery';
    router.replace(newUrl, { scroll: false });
  }, [selectedCategories, selectedBrands, priceRange, showInStockOnly, selectedAttributes, searchQuery, router]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search query filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(queryLower) ||
          product.shortDescription?.toLowerCase().includes(queryLower) ||
          product.category?.toLowerCase().includes(queryLower) ||
          product.brand?.toLowerCase().includes(queryLower) ||
          product.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower)) ||
          product.metalType?.toLowerCase().includes(queryLower) ||
          product.metalPurity?.toLowerCase().includes(queryLower) ||
          product.stoneType?.toLowerCase().includes(queryLower);
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (product.displayPrice < priceRange[0] || product.displayPrice > priceRange[1]) return false;

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;

      // Brand filter
      if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand))) return false;

      // Attribute filters - match by attribute name to product field
      for (const [attrName, values] of Object.entries(selectedAttributes)) {
        if (values.length > 0) {
          // Try to match attribute name to product fields
          // Common mappings: Metal Type -> metalType, Stone Type -> stoneType, etc.
          const normalizedAttrName = attrName.toLowerCase().replace(/\s+/g, '');
          let productValue: any = null;

          // Try direct field match first
          if (product[attrName]) {
            productValue = product[attrName];
          } else if (product[attrName.toLowerCase().replace(/\s+/g, '_')]) {
            productValue = product[attrName.toLowerCase().replace(/\s+/g, '_')];
          } else {
            // Try common field name mappings
            const fieldMappings: Record<string, string> = {
              metaltype: 'metalType',
              metaltype: 'metalType',
              metalpurity: 'metalPurity',
              stonetype: 'stoneType',
              gender: 'gender',
              size: 'size',
            };

            const mappedField = fieldMappings[normalizedAttrName];
            if (mappedField && product[mappedField]) {
              productValue = product[mappedField];
            }
          }

          if (!productValue || !values.includes(String(productValue))) return false;
        }
      }

      // Stock filter
      if (showInStockOnly && product.stock <= 0) return false;

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
        filtered.sort((a, b) => b._id.localeCompare(a._id));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
    }

    return filtered;
  }, [products, priceRange, selectedCategories, selectedBrands, selectedAttributes, showInStockOnly, sortBy, searchQuery]);

  // Calculate price range from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return [0, 1000000];
    const prices = products.map(p => p.displayPrice);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange(priceBounds);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedAttributes({});
    setShowInStockOnly(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    const slug = product.urlSlug || product._id;
    router.push(`/products/${slug}`);
  };

  // Toggle section
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle attribute filter change
  const handleAttributeChange = (attrName: string, value: string, checked: boolean) => {
    setSelectedAttributes(prev => {
      const current = prev[attrName] || [];
      if (checked) {
        return { ...prev, [attrName]: [...current, value] };
      } else {
        return { ...prev, [attrName]: current.filter(v => v !== value) };
      }
    });
    setCurrentPage(1);
  };

  // Handle predefined price range
  const handlePriceRangeSelect = (min: number, max: number) => {
    setPriceRange([min, max]);
    setCurrentPage(1);
  };

  if (loading) {
    return <PageLoader message='Loading jewellery...' className='min-h-screen' />;
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#F5EEE5]'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error}</p>
          <Button onClick={() => window.location.reload()} className='bg-[#1F3B29] hover:bg-[#3F5C45]'>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    Object.values(selectedAttributes).reduce((sum, arr) => sum + arr.length, 0) +
    (showInStockOnly ? 1 : 0) +
    (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1] ? 1 : 0);

  return (
    <div className='min-h-screen'>
      {/* Hero Banner */}
      <div className='relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-[#1F3B29] to-[#3F5C45]'>
        <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85")] bg-cover bg-center opacity-50'></div>
        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6'>Exquisite Jewellery</h1>
          <p className='text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl'>
            Discover our stunning collection of handcrafted jewellery pieces
          </p>
        </div>
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1440px]'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29]'>All Jewellery</h2>
            <p className='text-[#4F3A2E] mt-1'>{filteredAndSortedProducts.length} products found</p>
          </div>

          <div className='flex items-center gap-3 flex-wrap'>
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-[140px] sm:w-48 border-[#E6D3C2]'>
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

            {/* Filter Toggle - Mobile */}
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className='lg:hidden flex items-center gap-2 border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5]'>
              <Filter className='w-4 h-4' />
              Filters
              {activeFiltersCount > 0 && (
                <span className='bg-[#C8A15B] text-white text-xs rounded-full px-2 py-0.5'>{activeFiltersCount}</span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 ||
          selectedBrands.length > 0 ||
          Object.keys(selectedAttributes).length > 0 ||
          searchQuery.trim() ||
          showInStockOnly ||
          priceRange[0] > priceBounds[0] ||
          priceRange[1] < priceBounds[1]) && (
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <span className='text-sm font-medium text-[#1F3B29]'>Active filters:</span>
            {searchQuery.trim() && (
              <Badge variant='outline' className='bg-[#F5EEE5] border-[#E6D3C2] text-[#1F3B29]'>
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className='ml-2 hover:text-red-600'>
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            )}
            {selectedCategories.map(category => (
              <Badge key={category} variant='outline' className='bg-[#F5EEE5] border-[#E6D3C2] text-[#1F3B29]'>
                {category}
                <button
                  onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                  className='ml-2 hover:text-red-600'>
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            ))}
            {selectedBrands.map(brand => (
              <Badge key={brand} variant='outline' className='bg-[#F5EEE5] border-[#E6D3C2] text-[#1F3B29]'>
                {brand}
                <button onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))} className='ml-2 hover:text-red-600'>
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            ))}
            {Object.entries(selectedAttributes).map(([attrName, values]) =>
              values.map(value => (
                <Badge key={`${attrName}-${value}`} variant='outline' className='bg-[#F5EEE5] border-[#E6D3C2] text-[#1F3B29]'>
                  {attrName}: {value}
                  <button onClick={() => handleAttributeChange(attrName, value, false)} className='ml-2 hover:text-red-600'>
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))
            )}
            {showInStockOnly && (
              <Badge variant='outline' className='bg-[#F5EEE5] border-[#E6D3C2] text-[#1F3B29]'>
                In Stock Only
                <button onClick={() => setShowInStockOnly(false)} className='ml-2 hover:text-red-600'>
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            )}
            {(priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) && (
              <Badge variant='outline' className='bg-[#F5EEE5] border-[#E6D3C2] text-[#1F3B29]'>
                Price: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                <button onClick={() => setPriceRange(priceBounds)} className='ml-2 hover:text-red-600'>
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className='flex gap-6 lg:gap-8'>
          {/* Filters Sidebar */}
          <aside className={cn('w-full lg:w-80 flex-shrink-0 transition-all duration-300', 'lg:block', showFilters ? 'block' : 'hidden')}>
            <div className='bg-white border border-[#E6D3C2] rounded-xl p-4 sm:p-6 sticky top-36'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-[#1F3B29]'>Filters</h3>
                <div className='flex items-center gap-2'>
                  {activeFiltersCount > 0 && (
                    <Button variant='ghost' size='sm' onClick={clearAllFilters} className='text-xs text-[#4F3A2E] hover:text-[#1F3B29]'>
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowFilters(false)}
                    className='lg:hidden text-[#4F3A2E] hover:text-[#1F3B29]'>
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              <div className='space-y-6'>
                {/* Price Range */}
                <div>
                  <button onClick={() => toggleSection('price')} className='w-full flex items-center justify-between mb-3'>
                    <h4 className='font-medium text-[#1F3B29]'>Price Range</h4>
                    {openSections.price ? (
                      <ChevronUp className='w-4 h-4 text-[#4F3A2E]' />
                    ) : (
                      <ChevronDown className='w-4 h-4 text-[#4F3A2E]' />
                    )}
                  </button>
                  {openSections.price && (
                    <div className='space-y-4'>
                      {/* Custom Price Slider */}
                      <div>
                        <Slider
                          value={priceRange}
                          onValueChange={value => {
                            setPriceRange(value as [number, number]);
                            setCurrentPage(1);
                          }}
                          max={priceBounds[1]}
                          min={priceBounds[0]}
                          step={1000}
                          className='mb-2'
                        />
                        <div className='flex justify-between text-sm text-[#4F3A2E]'>
                          <span>₹{priceRange[0].toLocaleString()}</span>
                          <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Predefined Price Ranges */}
                      <div className='space-y-2'>
                        <p className='text-xs text-[#4F3A2E] font-medium mb-2'>Quick Select:</p>
                        {PRICE_RANGES.map((range, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePriceRangeSelect(range.min, range.max)}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                              priceRange[0] === range.min && priceRange[1] === range.max
                                ? 'bg-[#1F3B29] text-white'
                                : 'bg-[#F5EEE5] text-[#1F3B29] hover:bg-[#E6D3C2]'
                            )}>
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('categories')} className='w-full flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-[#1F3B29]'>Categories</h4>
                      {openSections.categories ? (
                        <ChevronUp className='w-4 h-4 text-[#4F3A2E]' />
                      ) : (
                        <ChevronDown className='w-4 h-4 text-[#4F3A2E]' />
                      )}
                    </button>
                    {openSections.categories && (
                      <div className='space-y-2 max-h-60 overflow-y-auto'>
                        {categories.map(category => (
                          <label key={category._id} className='flex items-center gap-2 cursor-pointer group'>
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
                              className='rounded border-[#E6D3C2] text-[#1F3B29] focus:ring-[#1F3B29]'
                            />
                            <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{category.name}</span>
                            <span className='text-xs text-[#4F3A2E]/60'>({category.productCount})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Brands */}
                {brands.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('brands')} className='w-full flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-[#1F3B29]'>Brands</h4>
                      {openSections.brands ? (
                        <ChevronUp className='w-4 h-4 text-[#4F3A2E]' />
                      ) : (
                        <ChevronDown className='w-4 h-4 text-[#4F3A2E]' />
                      )}
                    </button>
                    {openSections.brands && (
                      <div className='space-y-2 max-h-60 overflow-y-auto'>
                        {brands.map(brand => (
                          <label key={brand._id} className='flex items-center gap-2 cursor-pointer group'>
                            <input
                              type='checkbox'
                              checked={selectedBrands.includes(brand.name)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedBrands([...selectedBrands, brand.name]);
                                } else {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                                }
                                setCurrentPage(1);
                              }}
                              className='rounded border-[#E6D3C2] text-[#1F3B29] focus:ring-[#1F3B29]'
                            />
                            <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{brand.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Attributes */}
                {attributes.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('attributes')} className='w-full flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-[#1F3B29]'>Attributes</h4>
                      {openSections.attributes ? (
                        <ChevronUp className='w-4 h-4 text-[#4F3A2E]' />
                      ) : (
                        <ChevronDown className='w-4 h-4 text-[#4F3A2E]' />
                      )}
                    </button>
                    {openSections.attributes && (
                      <div className='space-y-4'>
                        {attributes.map(attr => (
                          <div key={attr._id}>
                            <p className='text-xs font-medium text-[#4F3A2E] mb-2'>{attr.name}</p>
                            <div className='space-y-2 max-h-40 overflow-y-auto'>
                              {attr.values.map(value => (
                                <label key={value} className='flex items-center gap-2 cursor-pointer group'>
                                  <input
                                    type='checkbox'
                                    checked={selectedAttributes[attr.name]?.includes(value) || false}
                                    onChange={e => handleAttributeChange(attr.name, value, e.target.checked)}
                                    className='rounded border-[#E6D3C2] text-[#1F3B29] focus:ring-[#1F3B29]'
                                  />
                                  <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stock Filter */}
                <div>
                  <label className='flex items-center gap-2 cursor-pointer group'>
                    <input
                      type='checkbox'
                      checked={showInStockOnly}
                      onChange={e => {
                        setShowInStockOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className='rounded border-[#E6D3C2] text-[#1F3B29] focus:ring-[#1F3B29]'
                    />
                    <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className='flex-1 min-w-0'>
            {paginatedProducts.length === 0 ? (
              <div className='text-center py-12 bg-white rounded-xl border border-[#E6D3C2]'>
                <div className='w-24 h-24 mx-auto mb-4 bg-[#F5EEE5] rounded-full flex items-center justify-center'>
                  <Gem className='w-12 h-12 text-[#4F3A2E]' />
                </div>
                <h3 className='text-lg font-medium text-[#1F3B29] mb-2'>No products found</h3>
                <p className='text-[#4F3A2E] mb-4'>Try adjusting your filters or search terms</p>
                <Button onClick={clearAllFilters} className='bg-[#1F3B29] hover:bg-[#3F5C45] text-white'>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className='grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
                  {paginatedProducts.map(product => (
                    <ProductCard key={product._id} product={convertToProductCard(product)} onClick={() => handleProductClick(product)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex justify-center items-center gap-2 mt-8 sm:mt-12'>
                    <Button
                      variant='outline'
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className='border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5]'>
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
                              className={cn(
                                'w-10',
                                currentPage === page
                                  ? 'bg-[#1F3B29] hover:bg-[#3F5C45] text-white'
                                  : 'border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5]'
                              )}>
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                          return (
                            <span key={page} className='px-2 text-[#4F3A2E]'>
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
                      disabled={currentPage === totalPages}
                      className='border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5]'>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
