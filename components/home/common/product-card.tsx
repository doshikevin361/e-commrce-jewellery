'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProductCardData = {
  id: number | string;
  title: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  originalPrice?: string;
  material?: string;
  brand?: string;
  inStock?: boolean;
  color?: string;
  size?: string;
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  actionLabel?: string;
};

export const ProductCard = ({ product, className, actionLabel = 'Add to cart' }: ProductCardProps) => {
  const rating = product.rating.toFixed(1);
  const isListView = className?.includes('flex-row');

  return (
    <article
      className={cn(
        'flex min-w-0 w-full snap-start rounded-xl border border-[#E6D3C2]/70 bg-white p-3 sm:p-4 group',
        isListView ? 'flex-row gap-4 sm:gap-6' : 'flex-col',
        className
      )}>
      <Link href={`/products/${product.id}`} className={cn('block', isListView ? 'flex-shrink-0 w-32 sm:w-40' : 'w-full')}>
        <div className={cn(
          'relative overflow-hidden rounded-xl bg-[#F5EEE5] cursor-pointer',
          isListView ? 'h-32 sm:h-40 w-full' : 'h-40 sm:h-48 w-full'
        )}>
          {product.badge && (
            <span className='absolute left-3 top-3 z-10 rounded-full bg-[#C8A15B] px-3 py-1 text-[11px] font-semibold text-white'>
              {product.badge}
            </span>
          )}
          <Image 
            src={product.image} 
            alt={product.title} 
            fill 
            sizes={isListView ? '160px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'} 
            className='object-cover transition-transform duration-300 group-hover:scale-110' 
          />
        </div>
      </Link>
      <div className={cn(
        'flex-1 flex flex-col',
        isListView ? 'justify-between' : 'mt-3 sm:mt-4 space-y-1.5 sm:space-y-2'
      )}>
        <div>
          <Link href={`/products/${product.id}`} className='block'>
            <p className='text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#3F5C45]'>{product.category}</p>
            <h3 className='text-sm sm:text-base font-semibold text-[#1F3B29] line-clamp-2 hover:text-[#C8A15B] transition-colors cursor-pointer'>{product.title}</h3>
          </Link>
          <div className='flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#4F3A2E] mt-1.5'>
            <Star className='text-[#C8A15B]' size={14} className='sm:w-4 sm:h-4' />
            <span className='font-semibold text-[#1C1F1A]'>{rating}</span>
            <span className='text-[#1C1F1A]/60'>({product.reviews})</span>
          </div>
        </div>
        <div className={cn('flex items-center', isListView ? 'justify-between mt-3' : 'gap-2 sm:gap-3')}>
          <div className='flex items-center gap-2 sm:gap-3'>
            <span className='text-base sm:text-lg font-semibold text-[#1F3B29]'>
              {product.price.startsWith('$') ? product.price : `$${product.price}`}
            </span>
            {product.originalPrice && (
              <span className='text-xs sm:text-sm text-[#4F3A2E] line-through'>
                {product.originalPrice.startsWith('$') ? product.originalPrice : `$${product.originalPrice}`}
              </span>
            )}
          </div>
          <Link
            href={`/products/${product.id}`}
            className={cn(
              'cursor-pointer inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[#1F3B29] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all hover:bg-[#1F3B29] hover:text-white',
              isListView ? 'flex-shrink-0' : 'w-full'
            )}>
            <ShoppingCart size={14} className='sm:w-4 sm:h-4' />
            <span className='hidden sm:inline'>{actionLabel}</span>
            <span className='sm:hidden'>Add</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

