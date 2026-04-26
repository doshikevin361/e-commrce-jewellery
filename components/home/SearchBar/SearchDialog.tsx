'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, TrendingUp, Sparkles, ArrowRight, Tag, Layers, Star } from 'lucide-react';
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
    sellerType?: 'vendor' | 'retailer';
    retailerId?: string;
  }>;
}

const POPULAR_SEARCHES = [
  { label: 'Rings', icon: '💍' },
  { label: 'Earrings', icon: '✨' },
  { label: 'Necklaces', icon: '📿' },
  { label: 'Bracelets', icon: '⌚' },
  { label: 'Diamond', icon: '💎' },
  { label: 'Gold', icon: '🥇' },
  { label: 'Bridal', icon: '👰' },
  { label: 'Gifts', icon: '🎁' },
];

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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) { setResults(null); return; }
      try {
        setLoading(true);
        const response = await fetch(`/api/public/search?query=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) setResults(await response.json());
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (open && debouncedQuery.trim()) fetchResults();
    else setResults(null);
  }, [debouncedQuery, open]);

  // Fetch popular products
  useEffect(() => {
    if (!open || query.trim()) return;
    const controller = new AbortController();
    const fetchPopularProducts = async () => {
      try {
        setLoadingPopular(true);
        const response = await fetch('/api/public/homepage', { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        const sections = Array.isArray(payload?.sections) ? payload.sections : [];
        const preferredSection =
          sections.find((s: any) => s?.type === 'newProducts') ||
          sections.find((s: any) => s?.type === 'featuredProducts') ||
          sections.find((s: any) => s?.type === 'trendingProducts');
        const products = Array.isArray(preferredSection?.data?.products) ? preferredSection.data.products : [];
        setPopularProducts(products.slice(0, 4).map((product: any, index: number) => {
          const id = product?._id?.toString() ?? `popular-${index}`;
          const sellingPrice = typeof product?.sellingPrice === 'number' ? product.sellingPrice : 0;
          const regularPrice = typeof product?.regularPrice === 'number' ? product.regularPrice : sellingPrice;
          const discountPercent = typeof product?.discount === 'number' && product.discount > 0 && product.discount <= 100 ? product.discount : 0;
          return {
            _id: id, name: product?.name || 'Untitled Product', category: product?.category || 'Jewellery',
            brand: product?.brand, mainImage: product?.mainImage || '/placeholder.jpg',
            displayPrice: sellingPrice > 0 ? sellingPrice : regularPrice, originalPrice: regularPrice,
            hasDiscount: discountPercent > 0, discountPercent, slug: product?.urlSlug || id,
          };
        }));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error('Popular products error:', error);
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
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) onOpenChange(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      if (inputRef?.current) setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  const handleKeywordClick = (keyword: string) => { router.push(`/jewellery?search=${encodeURIComponent(keyword)}`); onOpenChange(false); };
  const handleCategoryClick = (categoryName: string) => { router.push(`/jewellery?category=${encodeURIComponent(categoryName)}`); onOpenChange(false); };
  const handleBrandClick = (brandName: string) => { router.push(`/jewellery?brand=${encodeURIComponent(brandName)}`); onOpenChange(false); };
  const handleAttributeClick = (attrName: string, value: string) => { router.push(`/jewellery?${attrName.toLowerCase().replace(/\s+/g, '_')}=${encodeURIComponent(value)}`); onOpenChange(false); };
  const handleProductClick = (product: SearchResult['products'][0]) => {
    router.push(product.sellerType === 'retailer' && product._id ? `/products/retailer/${product._id}` : `/products/${product.slug || product._id}`);
    onOpenChange(false);
  };

  const highlightText = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-[#C8A15B]/20 text-[#8B6914] font-semibold not-italic px-0.5 rounded">{part}</mark>
        : part
    );
  };

  if (!open) return null;

  const hasResults = results && (results.keywords.length > 0 || results.categories.length > 0 || results.brands.length > 0 || results.attributes.length > 0 || results.products.length > 0);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* Backdrop blur overlay */}
      {/* <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in-0 duration-200" onClick={() => onOpenChange(false)} /> */}

      <div
        ref={dialogRef}
        id={listboxId}
        role="listbox"
        aria-label="Search suggestions"
        className={cn(
          "absolute top-[calc(100%+12px)] left-0 right-0 z-50",
          "bg-white/95 backdrop-blur-xl",
          "border border-[#C8A15B]/20",
          "shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(200,161,91,0.08)]",
          "rounded-2xl overflow-hidden",
          "max-h-[600px] overflow-y-auto",
          "animate-in fade-in-0 slide-in-from-top-2 duration-300",
        )}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#C8A15B30 transparent' }}
      >
        {/* Top gradient accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#a05a64] to-transparent" />

        <div className="p-5">
          {/* Loading state */}
          {loading && hasQuery ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-[#C8A15B]/20 border-t-[#C8A15B] animate-spin" />
                <Sparkles className="w-4 h-4 text-[#C8A15B] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-[#4F3A2E]/60 font-medium tracking-wide">Discovering jewellery…</p>
            </div>
          ) : hasQuery && !hasResults ? (
            /* No results */
            <div className="py-10 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F5EEE5] flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[#C8A15B]/60" />
              </div>
              <p className="text-[#1F3B29] font-semibold">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-[#4F3A2E]/50">Try different keywords or browse categories</p>
            </div>
          ) : !hasQuery ? (
            /* Default state */
            <div className="space-y-6">
              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C8A15B]" />
                  <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Trending Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(({ label, icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleKeywordClick(label)}
                      className={cn(
                        "group inline-flex items-center gap-1.5 px-3.5 py-1.5",
                        "text-sm text-[#4F3A2E] font-medium",
                        "bg-[#F9F3EC] hover:cursor-pointer",
                        "border border-[#a05a64]/50",
                        "rounded-full transition-all duration-200",
                        "hover:shadow-[0_2px_12px_rgba(200,161,91,0.3)]",
                        "hover:scale-105 active:scale-100",
                      )}
                    >
                      <span className="text-base leading-none">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#E6D3C2] to-transparent" />

              {/* Popular Products */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-3.5 h-3.5 text-[#C8A15B]" />
                  <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Popular Products</h3>
                </div>
                {loadingPopular ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 rounded-xl bg-[#F5EEE5] animate-pulse" />
                    ))}
                  </div>
                ) : popularProducts.length === 0 ? (
                  <p className="text-sm text-[#4F3A2E]/50 py-3">No popular products available.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {popularProducts.map(product => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleProductClick(product)}
                        className={cn(
                          "group flex items-center gap-3 p-2.5 text-left",
                          "rounded-xl border border-transparent",
                          "hover:bg-white hover:border-[#a05a64]/50",
                          "transition-all duration-200",
                        )}
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#F5EEE5] ring-1 ring-[#E6D3C2]/60">
                          <img
                            src={product.mainImage || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1F3B29] line-clamp-1 transition-colors">{product.name}</p>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-bold text-[#1F3B29]">₹{product.displayPrice.toLocaleString()}</span>
                            {product.hasDiscount && (
                              <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1 py-0.5 rounded-full">{product.discountPercent}% off</span>
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
            /* Results state */
            <div className="space-y-5">
              {/* Keywords */}
              {results.keywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Search className="w-3.5 h-3.5 text-[#C8A15B]" />
                    <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Suggestions</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.keywords.map((keyword, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleKeywordClick(keyword)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#4F3A2E] bg-[#F9F3EC] hover:bg-[#C8A15B] hover:text-white border border-[#E6D3C2] hover:border-[#C8A15B] rounded-full transition-all duration-200 font-medium hover:shadow-[0_2px_8px_rgba(200,161,91,0.25)]"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        {highlightText(keyword, query)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories & Brands row */}
              {(results.categories.length > 0 || results.brands.length > 0) && (
                <div className="flex gap-6">
                  {results.categories.length > 0 && (
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Layers className="w-3.5 h-3.5 text-[#C8A15B]" />
                        <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Categories</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {results.categories.map(category => (
                          <button
                            key={category._id}
                            type="button"
                            onClick={() => handleCategoryClick(category.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#1F3B29] bg-[#F0EBF8] hover:bg-[#1F3B29] hover:text-white border border-[#1F3B29]/10 hover:border-[#1F3B29] rounded-full transition-all duration-200 font-medium"
                          >
                            {highlightText(category.name, query)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.brands.length > 0 && (
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Tag className="w-3.5 h-3.5 text-[#C8A15B]" />
                        <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Brands</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {results.brands.map(brand => (
                          <button
                            key={brand._id}
                            type="button"
                            onClick={() => handleBrandClick(brand.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#4F3A2E] bg-[#F9F3EC] hover:bg-[#C8A15B] hover:text-white border border-[#E6D3C2] hover:border-[#C8A15B] rounded-full transition-all duration-200 font-medium"
                          >
                            {highlightText(brand.name, query)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attributes */}
              {results.attributes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A15B]" />
                    <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Attributes</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.attributes.map(attr =>
                      attr.values.slice(0, 5).map((value, idx) => (
                        <button
                          key={`${attr._id}-${idx}`}
                          type="button"
                          onClick={() => handleAttributeClick(attr.name, value)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#4F3A2E] bg-white hover:bg-[#F9F3EC] border border-[#E6D3C2] hover:border-[#C8A15B] rounded-full transition-all duration-200 font-medium"
                        >
                          <span className="text-[10px] font-bold text-[#C8A15B]/70 uppercase">{attr.name}</span>
                          <span className="w-px h-3 bg-[#E6D3C2]" />
                          {highlightText(value, query)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Divider */}
              {results.products.length > 0 && (
                <div className="h-px bg-gradient-to-r from-transparent via-[#E6D3C2] to-transparent" />
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-[#C8A15B]" />
                      <h3 className="text-xs font-bold text-[#1F3B29] uppercase tracking-widest">Products</h3>
                    </div>
                    <span className="text-xs text-[#4F3A2E]/40 font-medium">{results.products.length} found</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {results.products.map(product => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleProductClick(product)}
                        className={cn(
                          "group flex w-full items-center gap-4 p-3 text-left",
                          "rounded-xl border border-transparent",
                          "hover:bg-[#F9F3EC] hover:border-[#E6D3C2]",
                          "transition-all duration-200",
                        )}
                      >
                        {/* Image */}
                        <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-[#F5EEE5] ring-1 ring-[#E6D3C2]/80 group-hover:ring-[#C8A15B]/40 transition-all">
                          <img
                            src={product.mainImage || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1F3B29] group-hover:text-[#C8A15B] transition-colors line-clamp-1">
                            {highlightText(product.name, query)}
                          </p>
                          <p className="text-xs text-[#4F3A2E]/50 mt-0.5">{product.category}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm font-bold text-[#1F3B29]">₹{product.displayPrice.toLocaleString()}</span>
                            {product.hasDiscount && (
                              <>
                                <span className="text-xs text-[#4F3A2E]/40 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{product.discountPercent}% off</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-[#C8A15B]/10 flex items-center justify-center">
                            <ArrowRight className="w-3.5 h-3.5 text-[#C8A15B]" />
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

        {/* Bottom accent */}
        <div className="px-5 py-3 border-t border-[#F0EAE0] bg-[#FDFAF7] flex items-center justify-between">
          <p className="text-xs text-[#4F3A2E]/40">Press <kbd className="px-1.5 py-0.5 bg-[#F0EAE0] rounded text-[#4F3A2E]/60 font-mono text-[10px]">↵</kbd> to search all results</p>
          <button type="button" onClick={() => onOpenChange(false)} className="text-xs text-[#4F3A2E]/40 hover:text-[#4F3A2E]/70 transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Close
          </button>
        </div>
      </div>
    </>
  );
}