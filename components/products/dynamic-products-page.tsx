'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Filter, Grid, List, Star, SlidersHorizontal, Check, ArrowUpDown, Sparkles, Gem, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  // Jewelry specific
  metalType?: string;
  metalPurity?: string;
  metalWeight?: number;
  stoneType?: string;
  occasion?: string;
  gender?: string;
  size?: string;
}

// Convert Product to ProductCardData
const convertToProductCard = (product: Product): ProductCardData => ({
  id: parseInt(product._id.slice(-6), 16), // Convert ObjectId to number
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
});

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
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGemstones, setSelectedGemstones] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedMetalPurity, setSelectedMetalPurity] = useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Extract filter options from products
  const filterOptions = useMemo(() => {
    const materials = [...new Set(products.map(p => p.metalType).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const metalPurities = [...new Set(products.map(p => p.metalPurity).filter(Boolean))];
    const stoneTypes = [...new Set(products.map(p => p.stoneType).filter(Boolean))];
    const occasions = [...new Set(products.map(p => p.occasion).filter(Boolean))];
    const genders = [...new Set(products.map(p => p.gender).filter(Boolean))];
    const sizes = [...new Set(products.map(p => p.size).filter(Boolean))];
    
    return {
      materials,
      brands,
      metalPurities,
      stoneTypes,
      occasions,
      genders,
      sizes,
    };
  }, [products]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get URL parameters
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const trending = searchParams.get('trending');
        const search = searchParams.get('search');
        
        // Build API URL
        const params = new URLSearchParams();
        if (category && category !== 'all') params.set('category', category);
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
            fetchedProducts = fetchedProducts.filter((product: Product) =>
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
    if (category && category !== 'all') {
      setSelectedCategories([category]);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Price range filter
      if (product.displayPrice < priceRange[0] || product.displayPrice > priceRange[1]) return false;
      
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
      
      // Material filter
      if (selectedMaterials.length > 0 && (!product.metalType || !selectedMaterials.includes(product.metalType))) return false;
      
      // Brand filter
      if (selectedBrands.length > 0 && (!product.brand || !selectedBrands.includes(product.brand))) return false;
      
      // Metal purity filter
      if (selectedMetalPurity.length > 0 && (!product.metalPurity || !selectedMetalPurity.includes(product.metalPurity))) return false;
      
      // Stone type filter
      if (selectedGemstones.length > 0 && (!product.stoneType || !selectedGemstones.includes(product.stoneType))) return false;
      
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
    selectedMaterials,
    selectedBrands,
    selectedMetalPurity,
    selectedGemstones,
    showInStockOnly,
    minRating,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedGemstones([]);
    setSelectedStyles([]);
    setSelectedCollections([]);
    setSelectedMetalPurity([]);
    setShowInStockOnly(false);
    setMinRating(0);
    setCurrentPage(1);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    router.push(`/products/${product._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {searchParams.get('category') ? `${searchParams.get('category')} Collection` : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedProducts.length} products found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    min={0}
                    step={1000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categories.map(category => (
                        <label key={category._id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.name]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                              }
                              setCurrentPage(1);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{category.name}</span>
                          <span className="text-xs text-gray-500">({category.productCount})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials */}
                {filterOptions.materials.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Metal Type</h4>
                    <div className="space-y-2">
                      {filterOptions.materials.map(material => (
                        <label key={material} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMaterials([...selectedMaterials, material]);
                              } else {
                                setSelectedMaterials(selectedMaterials.filter(m => m !== material));
                              }
                              setCurrentPage(1);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {filterOptions.brands.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filterOptions.brands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }
                              setCurrentPage(1);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInStockOnly}
                      onChange={(e) => {
                        setShowInStockOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => {
                            setMinRating(rating);
                            setCurrentPage(1);
                          }}
                          className="rounded border-gray-300"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-sm text-gray-700">& up</span>
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
        <div className="flex-1">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Gem className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={clearAllFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {paginatedProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={convertToProductCard(product)}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
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
