'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { ProductCardData } from '@/components/home/common/product-card';
import { cn } from '@/lib/utils';

function dedupeProducts(lists: ProductCardData[][]): ProductCardData[] {
  const seen = new Set<string>();
  const out: ProductCardData[] = [];
  for (const list of lists) {
    for (const p of list) {
      const key = String(p._id ?? p.id);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

function productHref(p: ProductCardData) {
  const slug = (p as { urlSlug?: string }).urlSlug ?? String(p._id ?? p.id);
  return `/products/${encodeURIComponent(slug)}`;
}

function buildSeamlessBase(raw: ProductCardData[]): ProductCardData[] {
  if (raw.length === 0) return [];
  let base = [...raw];
  let guard = 0;
  while (base.length < 12 && guard < 24) {
    base = base.concat(raw);
    guard += 1;
  }
  return base;
}

type HomeProductsMarqueeProps = {
  featuredProducts: ProductCardData[];
  trendingProducts: ProductCardData[];
  newProducts: ProductCardData[];
  isLoading: boolean;
};

export function HomeProductsMarquee({
  featuredProducts,
  trendingProducts,
  newProducts,
  isLoading,
}: HomeProductsMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const [pointerDown, setPointerDown] = useState(false);

  const merged = useMemo(
    () => dedupeProducts([featuredProducts, trendingProducts, newProducts]),
    [featuredProducts, trendingProducts, newProducts],
  );

  const baseLoop = useMemo(() => buildSeamlessBase(merged), [merged]);
  const duplicated = useMemo(() => [...baseLoop, ...baseLoop], [baseLoop]);

  const showSkeleton = isLoading && merged.length === 0;
  const showEmpty = !isLoading && merged.length === 0;

  if (showEmpty) {
    return null;
  }

  if (showSkeleton) {
    return (
      <section className='w-full border-y border-stone-200/60 bg-[#faf7f2] py-5 sm:py-6' aria-hidden>
        <div className='mx-auto flex max-w-[1440px] gap-3 overflow-hidden px-4 sm:gap-4 sm:px-6'>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className='h-48 w-[152px] shrink-0 rounded-xl bg-stone-200/70 animate-pulse sm:h-52 sm:w-[168px]' />
          ))}
        </div>
      </section>
    );
  }

  if (reduceMotion) {
    return (
      <section className='w-full border-y border-stone-200/60 bg-[#faf7f2] py-5 sm:py-6'>
        <div className='mx-auto max-w-[1440px] px-4 sm:px-6'>
          <div className='flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:gap-4'>
            {baseLoop.map((p, i) => (
              <MarqueeCard key={`${String(p._id ?? p.id)}-static-${i}`} product={p} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'home-products-marquee-root w-full border-y border-stone-200/60 bg-[#faf7f2] py-5 sm:py-6',
        pointerDown && 'is-pointer-down',
      )}
      onMouseDown={() => setPointerDown(true)}
      onMouseUp={() => setPointerDown(false)}
      onMouseLeave={() => setPointerDown(false)}
      onTouchStart={() => setPointerDown(true)}
      onTouchEnd={() => setPointerDown(false)}
    >
      <style>{`
        @keyframes homeProductsMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .home-products-marquee-track {
          display: flex;
          width: max-content;
          gap: 0.75rem;
          animation: homeProductsMarquee 50s linear infinite;
          will-change: transform;
        }
        @media (min-width: 640px) {
          .home-products-marquee-track {
            gap: 1.25rem;
          }
        }
        .home-products-marquee-root:hover .home-products-marquee-track,
        .home-products-marquee-root.is-pointer-down .home-products-marquee-track {
          animation-play-state: paused;
        }
      `}</style>
      <div className='relative overflow-hidden'>
        <div className='home-products-marquee-track items-stretch pl-4 sm:pl-6'>
          {duplicated.map((p, idx) => (
            <MarqueeCard key={`marquee-${idx}`} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarqueeCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={productHref(product)}
      className='group flex w-[152px] shrink-0 flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-[168px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf7f2]'>
      <div className='relative aspect-square bg-stone-50'>
        <Image
          src={product.image}
          alt={product.title}
          fill
          className='object-cover transition-transform duration-500 group-hover:scale-105'
          sizes='168px'
        />
      </div>
      <div className='flex min-h-0 flex-1 flex-col px-2 py-2.5'>
        <p className='line-clamp-2 text-center text-[11px] font-medium leading-snug text-neutral-800 sm:text-xs'>{product.title}</p>
        <p className='mt-1 text-center text-[11px] font-semibold text-amber-900/85 sm:text-xs'>{product.price}</p>
      </div>
    </Link>
  );
}
