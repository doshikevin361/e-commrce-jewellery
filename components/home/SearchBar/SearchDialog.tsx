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

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchDialog({ open, onOpenChange, query, onQueryChange }: SearchDialogProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
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
    router.push(`/products/${product._id || product._id}`);
    onOpenChange(false);
  };

  // Highlight text in results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className='bg-yellow-200 text-[#1F3B29] font-medium'>
          {part}
        </mark>
      ) : (
        part
      )
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
      className='absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6D3C2] rounded-xl shadow-xl z-50 max-h-[600px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200'>
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
          <div className='py-4 text-center text-[#4F3A2E]'>
            <p>Start typing to search...</p>
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
                      variant='outline'
                      className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'
                      onClick={() => handleKeywordClick(keyword)}>
                      {highlightText(keyword, query)}
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
                      variant='outline'
                      className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'
                      onClick={() => handleCategoryClick(category.name)}>
                      {highlightText(category.name, query)}
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
                      variant='outline'
                      className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'
                      onClick={() => handleBrandClick(brand.name)}>
                      {highlightText(brand.name, query)}
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
                        variant='outline'
                        className='cursor-pointer hover:bg-[#F5EEE5] hover:border-[#1F3B29] transition-colors text-[#4F3A2E] border-[#E6D3C2]'
                        onClick={() => handleAttributeClick(attr.name, value)}>
                        {highlightText(value, query)}
                      </Badge>
                    ))
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
                    <div
                      key={product._id}
                      className='flex items-center gap-3 p-2 rounded-lg hover:bg-[#F5EEE5] cursor-pointer transition-colors group'
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
                    </div>
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
