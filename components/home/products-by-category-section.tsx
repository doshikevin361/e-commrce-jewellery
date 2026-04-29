'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader, sectionHeadingTitleClassName } from '@/components/home/common/section-header';
import { ProductCard, type ProductCardData } from '@/components/home/common/product-card';
import { JEWELRY_CATEGORIES } from '@/components/home/shop-by-jewelry-category';

type ApiCategory = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  productCount?: number;
  children?: ApiCategory[];
};

type CategoryTab = {
  key: string;
  label: string;
  /** Value passed to `/api/public/products?category=` */
  filter: string;
  productCount: number;
};

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80';
const MIN_CATEGORY_SWITCH_LOADER_MS = 450;

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '₹0.00';
  }
  return `₹${value.toFixed(2)}`;
};

const mapProductsFromApi = (incoming?: unknown[]): ProductCardData[] => {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return [];
  }

  return incoming.map((product: any, index: number) => {
    const sellingPrice =
      typeof product?.sellingPrice === 'number' && product.sellingPrice > 0
        ? product.sellingPrice
        : typeof product?.regularPrice === 'number' && product.regularPrice > 0
          ? product.regularPrice
          : 0;

    const regularPrice = typeof product?.regularPrice === 'number' && product.regularPrice > 0 ? product.regularPrice : sellingPrice;

    const discountPercent = typeof product?.discount === 'number' && product.discount > 0 && product.discount <= 100 ? product.discount : 0;

    const hasDiscount = discountPercent > 0 || (regularPrice > sellingPrice && regularPrice > 0 && sellingPrice > 0);

    const productId = typeof product?._id === 'string' ? product._id : (product?._id?.toString?.() ?? `product-${index}`);

    const karat = [product?.goldPurity, product?.silverPurity].filter(Boolean)[0];

    return {
      id: productId,
      _id: productId,
      title: product?.name || 'Untitled Product',
      category: typeof product?.category === 'string' ? product.category : 'Jewellery',
      price: formatCurrency(sellingPrice),
      originalPrice: hasDiscount && regularPrice > sellingPrice ? formatCurrency(regularPrice) : undefined,
      rating: typeof product?.rating === 'number' ? product.rating : 4.8,
      reviews: typeof product?.reviewCount === 'number' ? product.reviewCount : 0,
      image: product?.mainImage || DEFAULT_PRODUCT_IMAGE,
      badge: product?.badge,
      karat: karat ? String(karat).trim() : undefined,
      urlSlug: product?.urlSlug,
    };
  });
};

function collectTabsFromApi(roots: ApiCategory[]): CategoryTab[] {
  const seen = new Set<string>();
  const out: CategoryTab[] = [];

  const visit = (node: ApiCategory) => {
    const filter = (node.slug || node.name || '').trim();
    const count = node.productCount ?? 0;
    if (filter && count > 0 && !seen.has(filter)) {
      seen.add(filter);
      out.push({ key: node._id, label: node.name, filter, productCount: count });
    }
    node.children?.forEach(visit);
  };

  roots.forEach(visit);
  out.sort((a, b) => b.productCount - a.productCount);
  return out.slice(0, 8);
}

function staticFallbackTabs(): CategoryTab[] {
  return JEWELRY_CATEGORIES.map(c => ({
    key: c.slug,
    label: c.name,
    filter: c.slug,
    productCount: 0,
  }));
}

export function ProductsByCategorySection() {
  const [tabs, setTabs] = useState<CategoryTab[]>(() => staticFallbackTabs());
  const [activeFilter, setActiveFilter] = useState<string>(() => staticFallbackTabs()[0]?.filter ?? '');
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [showCategoryLoader, setShowCategoryLoader] = useState(true);
  const minLoaderUntilRef = useRef<number>(0);
  const hideLoaderTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/public/categories', { signal: ac.signal });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const roots: ApiCategory[] = Array.isArray(data?.categories) ? data.categories : [];
        const fromApi = collectTabsFromApi(roots);
        if (fromApi.length > 0) {
          setTabs(fromApi);
          setActiveFilter(prev => (fromApi.some(t => t.filter === prev) ? prev : fromApi[0].filter));
        } else {
          setTabs(staticFallbackTabs());
          setActiveFilter(prev => {
            const fallback = staticFallbackTabs();
            return fallback.some(t => t.filter === prev) ? prev : (fallback[0]?.filter ?? prev);
          });
        }
      } catch {
        /* keep static tabs */
      } finally {
        if (!ac.signal.aborted) {
          setLoadingTabs(false);
        }
      }
    })();
    return () => ac.abort();
  }, []);

  const fetchProducts = useCallback(async (categoryFilter: string, signal: AbortSignal) => {
    if (!categoryFilter) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      params.set('category', categoryFilter);
      params.set('limit', '8');
      params.set('page', '1');
      const res = await fetch(`/api/public/products?${params.toString()}`, { signal });
      if (!res.ok) {
        setProducts([]);
        return;
      }
      const data = await res.json();
      const raw = Array.isArray(data?.products) ? data.products : [];
      setProducts(mapProductsFromApi(raw).slice(0, 8));
    } catch {
      setProducts([]);
    } finally {
      if (!signal.aborted) {
        setLoadingProducts(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!activeFilter) {
      return;
    }
    const ac = new AbortController();
    fetchProducts(activeFilter, ac.signal);
    return () => ac.abort();
  }, [activeFilter, fetchProducts]);

  useEffect(() => {
    if (hideLoaderTimeoutRef.current) {
      window.clearTimeout(hideLoaderTimeoutRef.current);
      hideLoaderTimeoutRef.current = null;
    }

    if (loadingProducts) {
      const now = Date.now();
      minLoaderUntilRef.current = Math.max(minLoaderUntilRef.current, now + MIN_CATEGORY_SWITCH_LOADER_MS);
      setShowCategoryLoader(true);
      return;
    }

    const remaining = Math.max(0, minLoaderUntilRef.current - Date.now());
    if (remaining === 0) {
      setShowCategoryLoader(false);
      return;
    }

    hideLoaderTimeoutRef.current = window.setTimeout(() => {
      setShowCategoryLoader(false);
      hideLoaderTimeoutRef.current = null;
    }, remaining);
  }, [loadingProducts]);

  useEffect(() => {
    return () => {
      if (hideLoaderTimeoutRef.current) {
        window.clearTimeout(hideLoaderTimeoutRef.current);
      }
    };
  }, []);

  const activeTab = useMemo(() => tabs.find(t => t.filter === activeFilter) ?? tabs[0], [tabs, activeFilter]);

  const viewAllHref = useMemo(() => {
    const f = activeTab?.filter;
    return f ? `/products?category=${encodeURIComponent(f)}` : '/products';
  }, [activeTab]);

  const rightSlot = (
    <Link
      href={viewAllHref}
      className='inline-flex items-center gap-1 text-[10px] font-semibold text-[#1F3B29] transition-colors hover:text-[#C8A15B] sm:text-xs md:text-sm whitespace-nowrap shrink-0'>
      View category
      <ChevronRight size={14} className='sm:w-4 sm:h-4 md:w-5 md:h-5' aria-hidden />
    </Link>
  );

  return (
    <section className='w-full py-10 sm:py-12 md:py-14'>
      <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12'>
        <header className='mb-6 text-center sm:mb-8'>
          <h2 className={cn(sectionHeadingTitleClassName, 'text-center')}>Shop by category</h2>
          <p className='mt-3 font-serif text-base italic text-neutral-500 sm:text-lg'>Curated pieces from each collection</p>
        </header>

        <div className='rounded-2xl border border-[#E6D3C2]/60 bg-white/80 p-4 shadow-sm sm:p-6'>
          <div className='border-b border-web pb-3'>
            <SectionHeader
              title='Browse pieces'
              description={`Showing picks for ${activeTab?.label ?? 'this category'}.`}
              rightSlot={rightSlot}
            />
          </div>

          <div
            role='tablist'
            aria-label='Product categories'
            className='mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {(loadingTabs ? staticFallbackTabs() : tabs).map(tab => {
              const selected = tab.filter === activeFilter;
              return (
                <button
                  key={tab.key}
                  type='button'
                  role='tab'
                  aria-selected={selected}
                  onClick={() => {
                    if (tab.filter === activeFilter) return;
                    minLoaderUntilRef.current = Date.now() + MIN_CATEGORY_SWITCH_LOADER_MS;
                    setShowCategoryLoader(true);
                    setActiveFilter(tab.filter);
                  }}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm',
                    selected
                      ? 'border-[var(--web-color,#a05a64)] bg-[var(--web-color,#a05a64)] text-white'
                      : 'border-web/60 bg-gray-100 text-[#1F3B29] hover:border-[#C8A15B] hover:bg-[#F5EEE5]',
                  )}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className='mt-8'>
            {showCategoryLoader ? (
             <div className="flex flex-col items-center justify-center py-20">
      <div className="relative h-24 w-24">
        {/* Layer 1: The "Aura" - Soft golden pulse */}
        <div className="absolute inset-0 animate-pulse rounded-full bg-[#C8A15B]/10 blur-2xl" />

        {/* Layer 2: The Geometric Diamond */}
        <div className="relative flex h-full w-full items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="h-20 w-20 fill-none stroke-[#C8A15B]"
            style={{ filter: 'drop-shadow(0 0 2px rgba(200, 161, 91, 0.5))' }}
          >
            {/* The Outer Diamond Shape */}
            <path
              d="M50 5 L85 35 L50 95 L15 35 Z"
              strokeWidth="1"
              className="animate-[dash_3s_ease-in-out_infinite]"
              strokeDasharray="300"
              strokeDashoffset="300"
            />
            {/* The Internal Facets (Cross-lines) */}
            <path
              d="M15 35 L85 35 M50 5 L50 95 M15 35 L50 65 L85 35"
              strokeWidth="0.5"
              strokeOpacity="0.4"
              className="animate-pulse"
            />
            
            {/* Moving Light Glint */}
            <circle r="1" fill="white" className="animate-[glint_2s_linear_infinite]">
                <animateMotion 
                    path="M50 5 L85 35 L50 95 L15 35 Z" 
                    dur="3s" 
                    repeatCount="indefinite" 
                />
            </circle>
          </svg>
        </div>

        {/* Layer 3: Spinning Halo (Minimalist) */}
        <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-[#C8A15B]/40 animate-spin" 
             style={{ animationDuration: '2s' }} />
      </div>

      {/* Brand Text */}
      <div className="mt-8 text-center">
        <h2 className="text-sm font-light tracking-[0.3em] text-[#1F3B29] uppercase">
        Jewel Manas <span className="font-bold">Jewellery</span>
        </h2>
        <div className="mt-2 flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-[#C8A15B]/30" />
            <span className="text-[10px] italic tracking-widest text-[#4F3A2E] animate-pulse">
                Polishing Perfection
            </span>
            <span className="h-[1px] w-8 bg-[#C8A15B]/30" />
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          0% { stroke-dashoffset: 300; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -300; }
        }
        @keyframes glint {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(2); }
        }
      `}</style>
    </div>
            ) : products.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-web/40 bg-[#FAF7F2] py-14 text-center'>
                <p className='text-sm text-[#4F3A2E]'>No products in this category yet.</p>
                <Link
                  href='/jewellery'
                  className='text-sm font-semibold text-[#1F3B29] underline-offset-2 hover:text-[#C8A15B] hover:underline'>
                  Browse all jewellery
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} className='min-w-0 w-full max-w-none' />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
