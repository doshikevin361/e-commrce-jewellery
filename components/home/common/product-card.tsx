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
        'flex min-w-[200px] sm:min-w-[280px] snap-start flex-col rounded-xl border border-[#E6D3C2]/70 bg-white p-4',
        className
      )}>
      <div className='relative h-48 w-full overflow-hidden rounded-xl bg-[#F5EEE5]'>
        {product.badge && (
          <span className='absolute left-3 top-3 rounded-full bg-[#C8A15B] px-3 py-1 text-[11px] font-semibold text-white'>
            {product.badge}
          </span>
        )}
        <Image src={product.image} alt={product.title} fill sizes='(max-width: 768px) 240px, 280px' className='object-cover' />
      </div>
      <div className='mt-4 space-y-2'>
        <p className='text-[11px] uppercase tracking-[0.3em] text-[#3F5C45]'>{product.category}</p>
        <h3 className='text-base font-semibold text-[#1F3B29]'>{product.title}</h3>
        <div className='flex items-center gap-2 text-xs text-[#4F3A2E]'>
          <Star className='text-[#C8A15B]' size={16} />
          <span className='font-semibold text-[#1C1F1A]'>{rating}</span>
          <span className='text-[#1C1F1A]/60'>({product.reviews})</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-lg font-semibold text-[#1F3B29]'>{product.price}</span>
          {product.originalPrice && <span className='text-sm text-[#4F3A2E] line-through'>{product.originalPrice}</span>}
        </div>
        <button
          type='button'
          className='cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1F3B29] px-4 py-2 text-sm font-semibold text-[#1F3B29]'>
          <ShoppingCart size={16} />
          <span>{actionLabel}</span>
        </button>
      </div>
    </article>
  );
};
