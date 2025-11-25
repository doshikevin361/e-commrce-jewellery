'use client';

import { useState, useMemo } from 'react';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { trendingPro, featuredProducts } from '@/app/utils/dummyData';
import { TrendingUp, Star, Filter, Grid, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Combine and get trending products (highest rated) with extended attributes and unique IDs
const allProducts: ProductCardData[] = [
  ...trendingPro.map((p, index) => ({
    ...p,
    id: `trending-${p.id}`,
    material: ['Gold', 'Silver', 'Platinum', 'Gold', 'Silver', 'Platinum', 'Gold', 'Silver'][index % 8],
    brand: ['LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance'][index % 8],
    inStock: index % 3 !== 0,
    color: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum', 'Yellow Gold', 'White Gold', 'Rose Gold'][index % 8],
  })),
  ...featuredProducts.map((p, index) => ({
    ...p,
    id: `featured-${p.id}`,
    material: ['Gold', 'Silver', 'Platinum', 'Gold', 'Silver', 'Platinum', 'Gold', 'Silver'][index % 8],
    brand: ['LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance', 'Prestige', 'LuxeLoom', 'Elegance'][index % 8],
    inStock: index % 3 !== 0,
    color: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum', 'Yellow Gold', 'White Gold', 'Rose Gold'][index % 8],
  })),
];

const trendingProducts = allProducts
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 12);

export function TrendingPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const materials = ['Gold', 'Silver', 'Platinum'];

  const filteredProducts = useMemo(() => {
    let filtered = trendingProducts.filter(product => {
      const price = parseFloat(product.price.replace('$', '').replace(',', ''));
      if (price < priceRange[0] || price > priceRange[1]) return false;
      
      if (selectedMaterials.length > 0 && product.material && !selectedMaterials.includes(product.material)) {
        return false;
      }
      
      if (product.rating < minRating) return false;
      
      return true;
    });

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
      default:
        break;
    }

    return filtered;
  }, [priceRange, selectedMaterials, minRating, sortBy]);

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedMaterials([]);
    setMinRating(0);
  };

  const activeFiltersCount = selectedMaterials.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8 sm:mb-12 text-center'>
        <div className='inline-flex items-center gap-2 mb-4'>
          <div className='h-px w-8 bg-[#E6D3C2]' />
          <TrendingUp size={24} className='text-[#C8A15B]' />
          <div className='h-px w-8 bg-[#E6D3C2]' />
        </div>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-3'>
          Trending Products
        </h1>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Discover our most popular and highly-rated jewelry pieces, loved by customers worldwide
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12'>
        <div className='bg-[#F5EEE5] rounded-xl p-4 sm:p-6 text-center'>
          <div className='flex items-center justify-center gap-1 mb-2'>
            <Star size={20} className='text-[#C8A15B] fill-[#C8A15B]' />
            <span className='text-2xl sm:text-3xl font-bold text-[#1F3B29]'>4.9</span>
          </div>
          <p className='text-xs sm:text-sm text-[#4F3A2E]'>Average Rating</p>
        </div>
        <div className='bg-[#F5EEE5] rounded-xl p-4 sm:p-6 text-center'>
          <div className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-2'>{trendingProducts.length}+</div>
          <p className='text-xs sm:text-sm text-[#4F3A2E]'>Trending Items</p>
        </div>
        <div className='bg-[#F5EEE5] rounded-xl p-4 sm:p-6 text-center'>
          <div className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-2'>1000+</div>
          <p className='text-xs sm:text-sm text-[#4F3A2E]'>Happy Customers</p>
        </div>
        <div className='bg-[#F5EEE5] rounded-xl p-4 sm:p-6 text-center'>
          <div className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-2'>24/7</div>
          <p className='text-xs sm:text-sm text-[#4F3A2E]'>Support</p>
        </div>
      </div>

      {/* Controls */}
      <div className='mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex items-center gap-3 flex-wrap'>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant='outline'
            className='flex items-center gap-2 border-[#E6D3C2] text-[#1F3B29] hover:bg-[#F5EEE5]'>
            <Filter size={18} />
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
        </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='px-4 py-2.5 rounded-lg border border-[#E6D3C2] focus:outline-none focus:ring-2 focus:ring-[#C8A15B] text-sm sm:text-base text-[#1F3B29] bg-white'>
            <option value='rating'>Sort by Rating</option>
            <option value='price-low'>Price: Low to High</option>
            <option value='price-high'>Price: High to Low</option>
          </select>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className='mb-6 bg-white border border-[#E6D3C2] rounded-xl p-4 sm:p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-[#1F3B29]'>Filters</h3>
            <div className='flex items-center gap-2'>
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant='ghost' size='sm' className='text-xs text-[#4F3A2E] hover:text-[#1F3B29]'>
                  Clear all
                </Button>
              )}
              <Button onClick={() => setShowFilters(false)} variant='ghost' size='sm'>
                <X size={18} />
              </Button>
            </div>
          </div>
          
          <div className='space-y-6'>
            {/* Price Range */}
            <div>
              <h4 className='text-sm font-semibold text-[#1F3B29] mb-3'>Price Range</h4>
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

            {/* Materials */}
            <div>
              <h4 className='text-sm font-semibold text-[#1F3B29] mb-3'>Material</h4>
              <div className='space-y-2'>
                {materials.map(material => (
                  <label
                    key={material}
                    className='flex items-center gap-2 cursor-pointer group hover:bg-[#F5EEE5] p-2 rounded-lg transition-colors'>
                    <input
                      type='checkbox'
                      checked={selectedMaterials.includes(material)}
                      onChange={() => toggleMaterial(material)}
                      className='w-4 h-4 text-[#C8A15B] border-[#E6D3C2] rounded focus:ring-[#C8A15B]'
                    />
                    <span className='text-sm text-[#4F3A2E] group-hover:text-[#1F3B29]'>{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className='text-sm font-semibold text-[#1F3B29] mb-3'>Minimum Rating</h4>
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
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className='mb-4'>
        <p className='text-sm text-[#4F3A2E] mb-4'>
          Showing <span className='font-semibold text-[#1F3B29]'>{filteredProducts.length}</span> trending products
        </p>
      </div>

      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
            : 'space-y-4'
        }>
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            className={viewMode === 'list' ? 'flex-row min-h-[200px]' : ''}
          />
        ))}
      </div>
    </div>
  );
}

