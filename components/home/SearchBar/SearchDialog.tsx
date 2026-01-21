'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchResult {
  keywords: string[];
  categories: Array<{ _id: string; name: string; slug: string }>;
  brands: Array<{ _id: string; name: string }>;
  attributes: Array<{ _id: string; name: string; values: string[] }>;
  products: Array<{
    _id: string;
    name: string;
    category: string;
    brand?: string;
    mainImage: string;
    displayPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountPercent: number;
    slug: string;
  }>;
}

const POPULAR_SEARCHES = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Diamond', 'Gold', 'Bridal', 'Gifts'];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  listboxId?: string;
}

export function SearchDialog({ open, onOpenChange, query, inputRef, listboxId = 'search-suggestions' }: SearchDialogProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [popularProducts, setPopularProducts] = useState<SearchResult['products']>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);

  // Debounce search query (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/public/search?query=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && debouncedQuery.trim()) {
      fetchResults();
    } else {
      setResults(null);
    }
  }, [debouncedQuery, open]);

  // Fetch popular products when no query
  useEffect(() => {
    if (!open || query.trim()) {
      return;
    }

    const controller = new AbortController();

    const fetchPopularProducts = async () => {
      try {
        setLoadingPopular(true);
        const response = await fetch('/api/public/homepage', { signal: controller.signal });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const sections = Array.isArray(payload?.sections) ? payload.sections : [];
        const preferredSection =
          sections.find((section: any) => section?.type === 'newProducts') ||
          sections.find((section: any) => section?.type === 'featuredProducts') ||
          sections.find((section: any) => section?.type === 'trendingProducts');

        const products = Array.isArray(preferredSection?.data?.products) ? preferredSection.data.products : [];
        const mapped = products.slice(0, 4).map((product: any, index: number) => {
          const id = product?._id?.toString() ?? `popular-${index}`;
          const sellingPrice = typeof product?.sellingPrice === 'number' ? product.sellingPrice : 0;
          const regularPrice = typeof product?.regularPrice === 'number' ? product.regularPrice : sellingPrice;
          const discountPercent =
            typeof product?.discount === 'number' && product.discount > 0 && product.discount <= 100 ? product.discount : 0;

          return {
            _id: id,
            name: product?.name || 'Untitled Product',
            category: product?.category || 'Jewellery',
            brand: product?.brand,
            mainImage: product?.mainImage || '/placeholder.jpg',
            displayPrice: sellingPrice > 0 ? sellingPrice : regularPrice,
            originalPrice: regularPrice,
            hasDiscount: discountPercent > 0,
            discountPercent,
            slug: product?.urlSlug || id,
          };
        });

        setPopularProducts(mapped);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Popular products error:', error);
        }
      } finally {
        setLoadingPopular(false);
      }
    };

    fetchPopularProducts();
    return () => controller.abort();
  }, [open, query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      if (inputRef?.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  // Handle keyword chip click
  const handleKeywordClick = (keyword: string) => {
    router.push(`/jewellery?search=${encodeURIComponent(keyword)}`);
    onOpenChange(false);
  };

  // Handle category chip click
  const handleCategoryClick = (categoryName: string) => {
    router.push(`/jewellery?category=${encodeURIComponent(categoryName)}`);
    onOpenChange(false);
  };

  // Handle brand chip click
  const handleBrandClick = (brandName: string) => {
    router.push(`/jewellery?brand=${encodeURIComponent(brandName)}`);
    onOpenChange(false);
  };

  // Handle attribute chip click
  const handleAttributeClick = (attrName: string, value: string) => {
    // Map attribute name to URL param (normalize spaces to underscores)
    const paramName = attrName.toLowerCase().replace(/\s+/g, '_');
    router.push(`/jewellery?${paramName}=${encodeURIComponent(value)}`);
    onOpenChange(false);
  };

  // Handle product click
  const handleProductClick = (product: SearchResult['products'][0]) => {
    const slug = product.slug || product._id;
    router.push(`/products/${slug}`);
    onOpenChange(false);
  };

  // Highlight text in results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className='bg-gray-200 text-[#1F3B29] font-medium'>
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  if (!open) return null;

  const hasResults =
    results &&
    (results.keywords.length > 0 ||
      results.categories.length > 0 ||
      results.brands.length > 0 ||
      results.attributes.length > 0 ||
      results.products.length > 0);

  const hasQuery = query.trim().length > 0;

  return (
    <div
      ref={dialogRef}
      id={listboxId}
      role='listbox'
      aria-label='Search suggestions'
      className='absolute top-full left-0 right-0 mt-2 bg-white border border-[#001e38]/10 shadow-xl z-50 max-h-[600px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200'>
      <div className='p-4'>
        {loading && hasQuery ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='w-6 h-6 animate-spin text-[#1F3B29]' />
            <span className='ml-2 text-[#4F3A2E]'>Searching...</span>
          </div>
        ) : hasQuery && !hasResults ? (
          <div className='py-8 text-center'>
            <p className='text-[#4F3A2E]'>No results found for &quot;{query}&quot;</p>
            <p className='text-sm text-[#4F3A2E]/60 mt-1'>Try different keywords</p>
          </div>
        ) : !hasQuery ? (
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-semibold text-[#001e38] mb-2'>Popular Searches</h3>
              <div className='flex flex-wrap gap-2'>
                {POPULAR_SEARCHES.map(term => (
                  <Badge
                    key={term}
                    asChild
                    variant='outline'
                    className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#001e38] transition-colors text-[#4F3A2E] border-[#001e38]/20'>
                    <button type='button' onClick={() => handleKeywordClick(term)}>
                      {term}
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-sm font-semibold text-[#001e38] mb-2'>Popular Products</h3>
              {loadingPopular ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-[#001e38]' />
                  <span className='ml-2 text-[#4F3A2E]'>Loading products...</span>
                </div>
              ) : popularProducts.length === 0 ? (
                <div className='py-4 text-sm text-[#4F3A2E]/70'>No popular products available.</div>
              ) : (
                <div className='space-y-2'>
                  {popularProducts.map(product => (
                    <button
                      key={product._id}
                      type='button'
                      className='flex w-full items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group text-left'
                      onClick={() => handleProductClick(product)}>
                      <div className='w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#F5EEE5]'>
                        <img
                          src={product.mainImage || '/placeholder.jpg'}
                          alt={product.name}
                          className='w-full h-full object-cover'
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[#001e38] transition-colors line-clamp-1'>{product.name}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-sm font-semibold text-[#001e38]'>₹{product.displayPrice.toLocaleString()}</span>
                          {product.hasDiscount && (
                            <>
                              <span className='text-xs text-[#4F3A2E]/60 line-through'>₹{product.originalPrice.toLocaleString()}</span>
                              <span className='text-xs text-green-600'>{product.discountPercent}% off</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Keywords */}
            {results.keywords.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-2'>Keywords</h3>
                <div className='flex flex-wrap gap-2'>
                  {results.keywords.map((keyword, idx) => (
                    <Badge
                      key={idx}
                      asChild
                      variant='outline'
                      className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'>
                      <button type='button' onClick={() => handleKeywordClick(keyword)}>
                        {highlightText(keyword, query)}
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {results.categories.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-2'>Categories</h3>
                <div className='flex flex-wrap gap-2'>
                  {results.categories.map(category => (
                    <Badge
                      key={category._id}
                      asChild
                      variant='outline'
                      className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'>
                      <button type='button' onClick={() => handleCategoryClick(category.name)}>
                        {highlightText(category.name, query)}
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {results.brands.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-2'>Brands</h3>
                <div className='flex flex-wrap gap-2'>
                  {results.brands.map(brand => (
                    <Badge
                      key={brand._id}
                      asChild
                      variant='outline'
                      className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'>
                      <button type='button' onClick={() => handleBrandClick(brand.name)}>
                        {highlightText(brand.name, query)}
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {results.attributes.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-2'>Attributes</h3>
                <div className='flex flex-wrap gap-2'>
                  {results.attributes.map(attr =>
                    attr.values.slice(0, 5).map((value, idx) => (
                      <Badge
                        key={`${attr._id}-${idx}`}
                        asChild
                        variant='outline'
                        className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'>
                        <button type='button' onClick={() => handleAttributeClick(attr.name, value)}>
                          {highlightText(value, query)}
                        </button>
                      </Badge>
                    )),
                  )}
                </div>
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-[#1F3B29] mb-2'>Products</h3>
                <div className='space-y-2'>
                  {results.products.map(product => (
                    <button
                      key={product._id}
                      type='button'
                      className='flex w-full items-center gap-3 p-2 rounded-lg hover:bg-[#F5EEE5] transition-colors group text-left'
                      onClick={() => handleProductClick(product)}>
                      <div className='w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#F5EEE5]'>
                        <img
                          src={product.mainImage || '/placeholder.jpg'}
                          alt={product.name}
                          className='w-full h-full object-cover'
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-[#1F3B29] group-hover:text-[#C8A15B] transition-colors line-clamp-1'>
                          {highlightText(product.name, query)}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-sm font-semibold text-[#1F3B29]'>₹{product.displayPrice.toLocaleString()}</span>
                          {product.hasDiscount && (
                            <>
                              <span className='text-xs text-[#4F3A2E]/60 line-through'>₹{product.originalPrice.toLocaleString()}</span>
                              <span className='text-xs text-green-600'>{product.discountPercent}% off</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
