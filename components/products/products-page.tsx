'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Filter, Grid, List, Star, SlidersHorizontal, Check, ArrowUpDown, Sparkles, Gem, Tag } from 'lucide-react';
import { featuredProducts, trendingPro } from '@/app/utils/dummyData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Combine all products and add extended attributes with unique IDs
const allProducts: ProductCardData[] = [
  ...featuredProducts.map((p, index) => ({
    ...p,
    id: `featured-${p.id}`, // Make IDs unique
    material: ['Gold', 'Silver', 'Platinum', 'Gold', 'Silver', 'Platinum', 'Gold', 'Silver'][index % 8],
    brand: ['LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance'][index % 8],
    inStock: index % 3 !== 0,
    color: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum', 'Yellow Gold', 'White Gold', 'Rose Gold'][index % 8],
    size: ['Small', 'Medium', 'Large', 'Small', 'Medium', 'Large', 'Small', 'Medium'][index % 8],
  })),
  ...trendingPro.map((p, index) => ({
    ...p,
    id: `trending-${p.id}`, // Make IDs unique
    material: ['Gold', 'Silver', 'Platinum', 'Gold', 'Silver', 'Platinum', 'Gold', 'Silver'][index % 8],
    brand: ['LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance'][index % 8],
    inStock: index % 3 !== 0,
    color: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum', 'Yellow Gold', 'White Gold', 'Rose Gold'][index % 8],
    size: ['Small', 'Medium', 'Large', 'Small', 'Medium', 'Large', 'Small', 'Medium'][index % 8],
  })),
];

const materials = ['Gold', 'Silver', 'Platinum'];
const brands = ['LuxeLoom', 'Elegance', 'Prestige'];
const colors = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'];
const sizes = ['Small', 'Medium', 'Large'];
const gemstones = ['Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Pearl', 'None'];
const styles = ['Vintage', 'Modern', 'Classic', 'Contemporary', 'Art Deco'];
const collections = ['Wedding', 'Engagement', 'Everyday', 'Luxury', 'Gift'];
const metalPurity = ['14K', '18K', '22K', '24K', '925 Sterling'];

export function ProductsPage() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGemstones, setSelectedGemstones] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedMetalPurity, setSelectedMetalPurity] = useState<string[]>([]);
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [availability, setAvailability] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Get category and search from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) {
      setSelectedCategories([category]);
    }
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return Array.from(cats);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Search filter
      if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !product.category?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Price filter
      const price = parseFloat(product.price.replace('$', '').replace(',', ''));
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Material filter
      if (selectedMaterials.length > 0 && product.material && !selectedMaterials.includes(product.material)) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && product.brand && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Color filter
      if (selectedColors.length > 0 && product.color && !selectedColors.includes(product.color)) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0 && product.size && !selectedSizes.includes(product.size)) {
        return false;
      }

      // Availability filter
      if (availability === 'in-stock' && !product.inStock) {
        return false;
      }
      if (availability === 'out-of-stock' && product.inStock) {
        return false;
      }

      // Rating filter
      if (product.rating < minRating) {
        return false;
      }

      // Discount filter
      if (showDiscountOnly && !product.badge && !product.originalPrice) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price.replace('$', '').replace(',', '')) - parseFloat(b.price.replace('$', '').replace(',', '')));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price.replace('$', '').replace(',', '')) - parseFloat(a.price.replace('$', '').replace(',', '')));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        filtered.reverse();
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, priceRange, selectedCategories, selectedMaterials, selectedBrands, selectedColors, selectedSizes, selectedGemstones, selectedStyles, selectedCollections, selectedMetalPurity, showDiscountOnly, availability, minRating, sortBy]);

  const toggleFilter = (filterArray: string[], setFilterArray: (value: string[]) => void, value: string) => {
    setFilterArray(
      filterArray.includes(value) ? filterArray.filter(f => f !== value) : [...filterArray, value]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedGemstones([]);
    setSelectedStyles([]);
    setSelectedCollections([]);
    setSelectedMetalPurity([]);
    setShowDiscountOnly(false);
    setAvailability('all');
    setMinRating(0);
    setSearchTerm('');
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedMaterials.length + 
    selectedBrands.length + 
    selectedColors.length + 
    selectedSizes.length + 
    selectedGemstones.length +
    selectedStyles.length +
    selectedCollections.length +
    selectedMetalPurity.length +
    (showDiscountOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0) +
    (availability !== 'all' ? 1 : 0);

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29] mb-2'>All Products</h1>
        <p className='text-sm sm:text-base text-[#4F3A2E]'>
          Discover our complete collection of exquisite jewelry
        </p>
      </div>

      {/* Search and Controls */}
      <div className='mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex-1 w-full sm:max-w-md'>
          <input
            type='text'
            placeholder='Search products...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2.5 rounded-lg border border-[#E6D3C2] focus:outline-none focus:ring-2 focus:ring-[#C8A15B] focus:border-transparent text-sm sm:text-base bg-white'
          />
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto flex-wrap'>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant='outline'
            className='flex items-center gap-2 border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5]'>
            <SlidersHorizontal size={18} />
            <span className='hidden sm:inline'>Filters</span>
            {activeFiltersCount > 0 && (
              <span className='bg-[#C8A15B] text-white text-xs px-2 py-0.5 rounded-full'>
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <div className='flex items-center gap-2 border border-[#E6D3C2] rounded-lg p-1 bg-white'>
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              className={viewMode === 'grid' ? 'bg-[#1F3B29] text-white hover:bg-[#2a4d3a]' : 'text-[#1F3B29] hover:bg-[#F5EEE5]'}>
              <Grid size={18} />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              className={viewMode === 'list' ? 'bg-[#1F3B29] text-white hover:bg-[#2a4d3a]' : 'text-[#1F3B29] hover:bg-[#F5EEE5]'}>
              <List size={18} />
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-[180px] border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5] focus:ring-[#C8A15B] bg-white'>
              <div className='flex items-center gap-2'>
                <ArrowUpDown size={16} className='text-[#C8A15B]' />
                <SelectValue placeholder='Sort by' />
              </div>
            </SelectTrigger>
            <SelectContent className='bg-white border-[#E6D3C2]'>
              <SelectItem value='default' className='hover:bg-[#F5EEE5] text-[#1F3B29] cursor-pointer'>
                Sort by
              </SelectItem>
              <SelectItem value='price-low' className='hover:bg-[#F5EEE5] text-[#1F3B29] cursor-pointer'>
                Price: Low to High
              </SelectItem>
              <SelectItem value='price-high' className='hover:bg-[#F5EEE5] text-[#1F3B29] cursor-pointer'>
                Price: High to Low
              </SelectItem>
              <SelectItem value='rating' className='hover:bg-[#F5EEE5] text-[#1F3B29] cursor-pointer'>
                Highest Rated
              </SelectItem>
              <SelectItem value='name' className='hover:bg-[#F5EEE5] text-[#1F3B29] cursor-pointer'>
                Name A-Z
              </SelectItem>
              <SelectItem value='newest' className='hover:bg-[#F5EEE5] text-[#1F3B29] cursor-pointer'>
                Newest First
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Filters Sidebar */}
        <aside
          className={`lg:w-72 flex-shrink-0 transition-all duration-300 ${
            showFilters ? 'block' : 'hidden lg:block'
          }`}>
          <div className='bg-white border border-[#E6D3C2] rounded-xl p-4 sm:p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6 pb-4 border-b border-[#E6D3C2]'>
              <h2 className='text-lg font-semibold text-[#1F3B29]'>Filters</h2>
              <div className='flex items-center gap-2'>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant='ghost'
                    size='sm'
                    className='text-xs text-[#4F3A2E] hover:text-[#1F3B29]'>
                    Clear all
                  </Button>
                )}
                <Button
                  onClick={() => setShowFilters(false)}
                  variant='ghost'
                  size='sm'
                  className='lg:hidden'>
                  <X size={18} />
                </Button>
              </div>
            </div>

            <div className='space-y-6'>
              {/* Price Range */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Price Range</h3>
                <Slider
                  value={priceRange}
                  onValueChange={value => setPriceRange(value as [number, number])}
                  min={0}
                  max={1000}
                  step={10}
                  className='mb-4'
                />
                <div className='flex items-center justify-between text-sm text-[#4F3A2E]'>
                  <span className='px-3 py-1 bg-[#F5EEE5] rounded-lg'>${priceRange[0]}</span>
                  <span className='px-3 py-1 bg-[#F5EEE5] rounded-lg'>${priceRange[1]}</span>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Availability</h3>
                <div className='space-y-2'>
                  {['all', 'in-stock', 'out-of-stock'].map(option => (
                    <label
                      key={option}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='radio'
                        name='availability'
                        checked={availability === option}
                        onChange={() => setAvailability(option)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29] capitalize'>
                        {option === 'all' ? 'All Products' : option === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Categories</h3>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {categories.map(category => (
                    <label
                      key={category}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Material</h3>
                <div className='space-y-2'>
                  {materials.map(material => (
                    <label
                      key={material}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedMaterials.includes(material)}
                        onChange={() => toggleFilter(selectedMaterials, setSelectedMaterials, material)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Brand</h3>
                <div className='space-y-2'>
                  {brands.map(brand => (
                    <label
                      key={brand}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Color</h3>
                <div className='space-y-2'>
                  {colors.map(color => (
                    <label
                      key={color}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedColors.includes(color)}
                        onChange={() => toggleFilter(selectedColors, setSelectedColors, color)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Size</h3>
                <div className='flex flex-wrap gap-2'>
                  {sizes.map(size => (
                    <label
                      key={size}
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-[#1F3B29] text-white border-[#1F3B29]'
                          : 'bg-white text-[#4F3A2E] border-[#E6D3C2] hover:border-[#C8A15B]'
                      }`}>
                      <input
                        type='checkbox'
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                        className='hidden'
                      />
                      <span className='text-sm font-medium'>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Minimum Rating</h3>
                <div className='space-y-2'>
                  {[4, 3, 2, 1, 0].map(rating => (
                    <label
                      key={rating}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='radio'
                        name='rating'
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] focus:ring-[#C8A15B]'
                      />
                      <div className='flex items-center gap-1'>
                        {rating > 0 ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < rating ? 'text-[#C8A15B] fill-[#C8A15B]' : 'text-[#E6D3C2]'}
                              />
                            ))}
                            <span className='text-xs text-[#4F3A2E] ml-1'>& up</span>
                          </>
                        ) : (
                          <span className='text-xs text-[#4F3A2E]'>All Ratings</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount/Sale */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3 flex items-center gap-2'>
                  <Tag size={16} className='text-[#C8A15B]' />
                  Special Offers
                </h3>
                <label className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                  <input
                    type='checkbox'
                    checked={showDiscountOnly}
                    onChange={e => setShowDiscountOnly(e.target.checked)}
                    className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                  />
                  <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>On Sale / Discounted</span>
                </label>
              </div>

              {/* Gemstones */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3 flex items-center gap-2'>
                  <Gem size={16} className='text-[#C8A15B]' />
                  Gemstone
                </h3>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {gemstones.map(gemstone => (
                    <label
                      key={gemstone}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedGemstones.includes(gemstone)}
                        onChange={() => toggleFilter(selectedGemstones, setSelectedGemstones, gemstone)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{gemstone}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3 flex items-center gap-2'>
                  <Sparkles size={16} className='text-[#C8A15B]' />
                  Style
                </h3>
                <div className='space-y-2'>
                  {styles.map(style => (
                    <label
                      key={style}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedStyles.includes(style)}
                        onChange={() => toggleFilter(selectedStyles, setSelectedStyles, style)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Collections */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Collection</h3>
                <div className='space-y-2'>
                  {collections.map(collection => (
                    <label
                      key={collection}
                      className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                      <input
                        type='checkbox'
                        checked={selectedCollections.includes(collection)}
                        onChange={() => toggleFilter(selectedCollections, setSelectedCollections, collection)}
                        className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                      />
                      <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{collection}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Metal Purity */}
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-3'>Metal Purity</h3>
                <div className='flex flex-wrap gap-2'>
                  {metalPurity.map(purity => (
                    <label
                      key={purity}
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${
                        selectedMetalPurity.includes(purity)
                          ? 'bg-[#1F3B29] text-white border-[#1F3B29]'
                          : 'bg-white text-[#4F3A2E] border-[#E6D3C2] hover:border-[#C8A15B]'
                      }`}>
                      <input
                        type='checkbox'
                        checked={selectedMetalPurity.includes(purity)}
                        onChange={() => toggleFilter(selectedMetalPurity, setSelectedMetalPurity, purity)}
                        className='hidden'
                      />
                      <span className='text-sm font-medium'>{purity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid/List */}
        <div className='flex-1'>
          <div className='mb-4 flex items-center justify-between'>
            <p className='text-sm text-[#4F3A2E]'>
              Showing <span className='font-semibold text-[#1F3B29]'>{filteredProducts.length}</span> of{' '}
              <span className='font-semibold text-[#1F3B29]'>{allProducts.length}</span> products
            </p>
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearFilters}
                variant='ghost'
                size='sm'
                className='text-xs text-[#4F3A2E] hover:text-[#1F3B29]'>
                Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
              </Button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className='text-center py-16 bg-[#F5EEE5] rounded-xl'>
              <p className='text-[#4F3A2E] mb-4 text-lg'>No products found matching your filters.</p>
              <Button onClick={clearFilters} variant='outline' className='border-[#E6D3C2] text-[#1F3B29] hover:bg-[#1F3B29] hover:text-white'>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                  : 'space-y-4 sm:space-y-6'
              }>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
