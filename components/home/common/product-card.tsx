import Image from 'next/image';
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
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  actionLabel?: string;
};

export const ProductCard = ({ product, className, actionLabel = 'Add to cart' }: ProductCardProps) => {
  const rating = product.rating.toFixed(1);

  return (
    <article
      className={cn(
        'flex min-w-0 w-full snap-start flex-col rounded-xl border border-[#E6D3C2]/70 bg-white p-3 sm:p-4',
        className
      )}>
      <div className='relative h-40 sm:h-48 w-full overflow-hidden rounded-xl bg-[#F5EEE5]'>
        {product.badge && (
          <span className='absolute left-3 top-3 rounded-full bg-[#C8A15B] px-3 py-1 text-[11px] font-semibold text-white'>
            {product.badge}
          </span>
        )}
        <Image src={product.image} alt={product.title} fill sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw' className='object-cover' />
      </div>
      <div className='mt-3 sm:mt-4 space-y-1.5 sm:space-y-2'>
        <p className='text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#3F5C45]'>{product.category}</p>
        <h3 className='text-sm sm:text-base font-semibold text-[#1F3B29] line-clamp-2'>{product.title}</h3>
        <div className='flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#4F3A2E]'>
          <Star className='text-[#C8A15B]' size={14} className='sm:w-4 sm:h-4' />
          <span className='font-semibold text-[#1C1F1A]'>{rating}</span>
          <span className='text-[#1C1F1A]/60'>({product.reviews})</span>
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <span className='text-base sm:text-lg font-semibold text-[#1F3B29]'>{product.price}</span>
          {product.originalPrice && <span className='text-xs sm:text-sm text-[#4F3A2E] line-through'>{product.originalPrice}</span>}
        </div>
        <button
          type='button'
          className='cursor-pointer inline-flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[#1F3B29] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#1F3B29] transition-all hover:bg-[#1F3B29] hover:text-white'>
          <ShoppingCart size={14} className='sm:w-4 sm:h-4' />
          <span className='hidden sm:inline'>{actionLabel}</span>
          <span className='sm:hidden'>Add</span>
        </button>
      </div>
    </article>
  );
};
