'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, memo } from 'react';
import { ShoppingCart, Star, Heart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import toast from 'react-hot-toast';

export type ProductCardData = {
  id: number | string;
  _id?: string;
  title: string;
  category: string;
  price: string;
  rating?: number;
  reviews?: number;
  image: string;
  badge?: string;
  originalPrice?: string;
  material?: string;
  brand?: string;
  inStock?: boolean;
  color?: string;
  size?: string;
  urlSlug?: string;
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  actionLabel?: string;
  onClick?: () => void;
  showDeleteIcon?: boolean;
  onDelete?: () => void;
};

export const ProductCard = memo(
  ({ product, className, actionLabel = 'Add to cart', onClick, showDeleteIcon = false, onDelete }: ProductCardProps) => {
    const router = useRouter();
    const { addToCart, cartItems } = useCart();
    const { isProductInWishlist } = useWishlist();
    const rating = product.rating || 4.5;
    const isListView = className?.includes('flex-row');
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const productId = (product as any)._id || product.id.toString();
    const productSlug = (product as any).urlSlug || productId;

    const isInCart = cartItems.some(item => item._id === productId || item.id === productId.toString());
    const isInWishlist = isProductInWishlist(productId);

    useEffect(() => {
      const checkAuth = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
        setIsLoggedIn(!!token);
      };
      checkAuth();
      window.addEventListener('authChange', checkAuth);
      return () => window.removeEventListener('authChange', checkAuth);
    }, []);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isLoggedIn) {
        window.dispatchEvent(new Event('openLoginModal'));
        return;
      }

      try {
        setWishlistLoading(true);

        if (isInWishlist) {
          const response = await fetch(`/api/customer/wishlist?productId=${productId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            toast.success('Product removed from wishlist');
            window.dispatchEvent(new Event('wishlistChange'));
          }
        } else {
          const response = await fetch('/api/customer/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: productSlug }),
          });

          if (response.ok) {
            toast.success('Product added to wishlist');
            window.dispatchEvent(new Event('wishlistChange'));
          }
        }
      } catch (error) {
        console.error('Wishlist error:', error);
        toast.error('Failed to update wishlist');
      } finally {
        setWishlistLoading(false);
      }
    };

    const handleProductClick = () => {
      if (onClick) {
        onClick();
      } else {
        router.push(`/products/${productSlug}`);
      }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isInCart) {
        toast('This item already exists in cart', {
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FCD34D',
          },
        });
        return;
      }

      setCartLoading(true);
      try {
        await addToCart(productId, 1);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setCartLoading(false);
      }
    };

    return (
      <article
        className={cn(
          'group relative flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl',
          className,
        )}>
        {/* Image Section */}
        <div onClick={handleProductClick} className='relative cursor-pointer overflow-hidden bg-gray-100'>
          <div className='aspect-square relative'>
            {/* Badge */}
            {product.badge && (
              <span className='absolute left-3 top-3 z-10 rounded-full bg-[#001e38] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md'>
                {product.badge}
              </span>
            )}

            {/* Wishlist / Delete */}
            {showDeleteIcon && onDelete ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete();
                }}
                className='absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow hover:bg-red-50 transition'>
                <Trash2 size={16} className='text-gray-700 hover:text-red-600' />
              </button>
            ) : (
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className='absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow hover:bg-red-50 transition'>
                <Heart size={16} className={cn('transition', isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700')} />
              </button>
            )}

            {/* Image */}
            <img
              src={product.image}
              alt={product.title}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
            />

            {/* Gradient overlay */}
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition' />
          </div>
        </div>

        {/* Content */}
        <div className='flex flex-1 flex-col p-4'>
          {/* Category */}
          <p className='mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500'>{product.category}</p>

          {/* Title */}
          <h3
            onClick={handleProductClick}
            className='mb-2 line-clamp-2 cursor-pointer text-[15px] font-semibold leading-snug text-[#001e38] transition'>
            {product.title}
          </h3>

          {/* Rating */}
          <div className='mb-3 flex items-center gap-1.5'>
            <div className='flex gap-0.5'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <span className='text-xs text-gray-500'>({product.reviews || 0})</span>
          </div>

          {/* Bottom */}
          <div className='mt-auto'>
            {/* Price */}
            <div className='mb-4 flex items-end gap-2'>
              <span className='text-xl font-bold text-[#001e38]'>{product.price}</span>
              {product.originalPrice && <span className='text-sm text-gray-400 line-through'>{product.originalPrice}</span>}
            </div>

            {/* Button */}
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || isInCart}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
                isInCart
                  ? 'border border-gray-300 bg-gray-100 text-[#001e38]'
                  : 'bg-[#001e38] text-white shadow-md hover:bg-[#002a52] hover:shadow-lg active:scale-[0.98]',
              )}>
              <ShoppingCart size={16} />
              {cartLoading ? 'Adding...' : isInCart ? 'In Cart' : actionLabel}
            </button>
          </div>
        </div>
      </article>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.image === nextProps.product.image &&
      prevProps.product.title === nextProps.product.title &&
      prevProps.className === nextProps.className &&
      prevProps.actionLabel === nextProps.actionLabel &&
      prevProps.showDeleteIcon === nextProps.showDeleteIcon
    );
  },
);
ProductCard.displayName = 'ProductCard';
