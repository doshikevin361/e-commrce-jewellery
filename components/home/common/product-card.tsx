'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProductCardData = {
  id: number | string;
  title: string;
  category: string;
  price: string;
  rating?: number; // Made optional to handle dynamic data
  reviews?: number; // Made optional to handle dynamic data
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
  onClick?: () => void;
};

export const ProductCard = ({ product, className, actionLabel = 'Add to cart', onClick }: ProductCardProps) => {
  const router = useRouter();
  const rating = product.rating || 4.5;
  const isListView = className?.includes('flex-row');

  const handleProductClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to product detail page using product ID
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <article className={cn('flex flex-col rounded-xl border border-[#E6D3C2]/70 bg-white p-3 sm:p-4 group w-[320px] h-full', className)}>
      <div onClick={handleProductClick} className='block cursor-pointer w-full'>
        <div className='relative overflow-hidden rounded-xl bg-[#F5EEE5] h-48 sm:h-56 w-full'>
          {product.badge && (
            <span className='absolute left-3 top-3 z-10 rounded-full bg-[#C8A15B] px-3 py-1 text-[11px] font-semibold text-white'>
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.title}
            className='w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110'
          />
        </div>
      </div>

      {/* body */}
      <div className='mt-4 flex flex-col flex-1'>
        <p className='text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#3F5C45]'>{product.category}</p>
        <h3
          onClick={handleProductClick}
          className='text-sm sm:text-base font-semibold text-[#1F3B29] line-clamp-2 hover:text-[#C8A15B] transition-colors cursor-pointer'>
          {product.title}
        </h3>

        <div className='flex items-center gap-2 text-xs my-1.5'>
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          ))}
          <span className='text-black/60'>({product.reviews || 0})</span>
        </div>

        {/* Price + Button */}
        <div className='mt-auto flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <span className='text-lg font-semibold text-[#1F3B29]'>{product.price}</span>
            {product.originalPrice && <span className='text-sm text-[#4F3A2E] line-through'>{product.originalPrice}</span>}
          </div>

          <button
            onClick={e => e.stopPropagation()}
            className='cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3B29] px-4 py-2 text-sm font-semibold text-[#1F3B29] transition-all hover:bg-[#1F3B29] hover:text-white'>
            <ShoppingCart size={16} />
            <span>{actionLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
