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
  actionSlot?: React.ReactNode;
  hideDefaultAction?: boolean;
};

export const ProductCard = memo(
  ({
    product,
    className,
    actionLabel = 'Add to cart',
    onClick,
    showDeleteIcon = false,
    onDelete,
    actionSlot,
    hideDefaultAction = false,
  }: ProductCardProps) => {
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
      <div className='group relative rounded-[28px] bg-[#f5f6f8] p-5 transition-all duration-300 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)]'>
        {/* Image Container */}
        <div className='relative mb-5 overflow-hidden rounded-2xl bg-white'>
          <img
            src={product.image}
            alt={product.title}
            onClick={handleProductClick}
            className='h-56 min-w-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105'
          />

          {/* Badge */}
          {product.badge && (
            <span className='absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-[11px] font-medium text-white'>
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
              className='absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-red-50'>
              <Trash2 size={16} className='text-red-600' />
            </button>
          ) : (
            <button
              onClick={handleWishlistToggle}
              className='absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105'>
              <Heart size={16} className={cn(isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600')} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className='space-y-3'>
          {/* Category */}
          <span
            onClick={handleProductClick}
            className='inline-block rounded-full bg-neutral-200 px-3 py-1 text-[11px] font-medium text-neutral-600'>
            {product.category}
          </span>

          {/* Title */}
          <h3 onClick={handleProductClick} className='line-clamp-2 text-[15px] font-semibold cursor-pointer leading-snug text-neutral-900'>
            {product.title}
          </h3>

          {/* Rating */}
          <div className='flex items-center gap-2'>
            <div className='flex gap-0.5'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? 'fill-neutral-900 text-neutral-900' : 'fill-neutral-300 text-neutral-300'}
                />
              ))}
            </div>
            <span className='text-xs text-neutral-500'>{product.reviews || 0} reviews</span>
          </div>

          {/* Price + Action */}
          <div className='flex items-center justify-between pt-2'>
            <div className='flex items-baseline gap-2'>
              <span className='text-xl font-semibold text-neutral-900'>{product.price}</span>
              {/* {product.originalPrice && <span className='text-sm text-neutral-400 line-through'>{product.originalPrice}</span>} */}
            </div>

            {actionSlot ? (
              actionSlot
            ) : !hideDefaultAction ? (
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full transition-all',
                  isInCart ? 'bg-neutral-200 text-neutral-500' : 'bg-neutral-900 text-white hover:scale-105',
                )}>
                {cartLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <ShoppingCart size={18} />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
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
      prevProps.showDeleteIcon === nextProps.showDeleteIcon &&
      prevProps.hideDefaultAction === nextProps.hideDefaultAction &&
      prevProps.actionSlot === nextProps.actionSlot
    );
  },
);
ProductCard.displayName = 'ProductCard';
