'use client';

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
  image: string;
  badge?: string;
  originalPrice?: string;
  material?: string;
  brand?: string;
  inStock?: boolean;
  color?: string;
  size?: string;
  urlSlug?: string;
  karat?: string;
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
  retailerProductId?: string;
  retailerId?: string;
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
    retailerProductId,
    retailerId,
  }: ProductCardProps) => {
    const router = useRouter();
    const { addToCart, cartItems } = useCart();
    const { isProductInWishlist } = useWishlist();
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const productId = (product as any)._id || product.id.toString();
    const productSlug = (product as any).urlSlug || productId;
    const isInCart = cartItems.some(
      item => item._id === productId || item.id === productId.toString(),
    );
    const isInWishlist = isProductInWishlist(productId);

    useEffect(() => {
      const checkAuth = () => {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('customerToken')
            : null;
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
          const res = await fetch(`/api/customer/wishlist?productId=${productId}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            toast.success('Removed from wishlist');
            window.dispatchEvent(new Event('wishlistChange'));
          }
        } else {
          const res = await fetch('/api/customer/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: productSlug }),
          });
          if (res.ok) {
            toast.success('Added to wishlist');
            window.dispatchEvent(new Event('wishlistChange'));
          }
        }
      } catch {
        toast.error('Failed to update wishlist');
      } finally {
        setWishlistLoading(false);
      }
    };

    const handleProductClick = () => {
      if (onClick) onClick();
      else router.push(`/products/${productSlug}`);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isInCart) {
        toast('Already in cart', { icon: '⚠️' });
        return;
      }
      setCartLoading(true);
      try {
        if (retailerProductId && retailerId) {
          await addToCart(productId, 1, { retailerProductId, retailerId });
        } else {
          await addToCart(productId, 1);
        }
      } catch {
        // handled in context
      } finally {
        setCartLoading(false);
      }
    };

    return (
      <div className={cn(
        'group relative flex flex-col bg-white rounded-2xl overflow-hidden',
        'transition-transform duration-300 hover:-translate-y-1',
        className,
      )}>

        {/* ── Image ── */}
        <div className='relative aspect-square overflow-hidden bg-[#f8f5f0]'>
          <img
            src={product.image}
            alt={product.title}
            onClick={handleProductClick}
            className='h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105'
          />

          {/* Badge – top left */}
          {product.badge && (
            <span className='absolute left-3 top-3 rounded-full bg-black px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white'>
              {product.badge}
            </span>
          )}

          {/* Karat – top right */}
          {product.karat && (
            <span className='absolute right-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-800 backdrop-blur-sm'>
              {product.karat}
            </span>
          )}

          {/* Wishlist / Delete – bottom right */}
          {showDeleteIcon && onDelete ? (
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className='absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-50'>
              <Trash2 size={14} className='text-red-600' />
            </button>
          ) : (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className='absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition hover:scale-110'>
              <Heart
                size={14}
                className={cn(
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-500',
                )}
              />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className='flex flex-1 flex-col px-4 pt-3 pb-4'>

          {/* Category */}
          <span className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-700'>
            {product.category}
          </span>

          {/* Title */}
          <h3
            onClick={handleProductClick}
            className='mb-2 line-clamp-2 cursor-pointer text-[13px] font-semibold leading-snug text-neutral-900'>
            {product.title}
          </h3>

          {/* Stars only – no review count */}
          {/* <div className='mb-3 flex gap-0.5'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(product.rating ?? 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-neutral-200 text-neutral-200'
                }
              />
            ))}
          </div> */}

          {/* Price + Cart */}
          <div className='mt-auto flex items-center justify-between border-t border-neutral-100 pt-3'>
            <span className='text-[17px] font-bold text-[#7a1a2e]'>
              {product.price}
            </span>

            {actionSlot ? (
              actionSlot
            ) : !hideDefaultAction ? (
              <button
                onClick={handleAddToCart}
                disabled={isInCart || cartLoading}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-all',
                  isInCart
                    ? 'bg-neutral-200 text-neutral-400'
                    : 'bg-[#7a1a2e] text-white hover:bg-[#9b2240] hover:scale-105',
                )}>
                {cartLoading ? (
                  <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <ShoppingCart size={15} />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.product.id === next.product.id &&
    prev.product.price === next.product.price &&
    prev.product.image === next.product.image &&
    prev.product.title === next.product.title &&
    prev.product.karat === next.product.karat &&
    prev.className === next.className &&
    prev.showDeleteIcon === next.showDeleteIcon &&
    prev.hideDefaultAction === next.hideDefaultAction &&
    prev.actionSlot === next.actionSlot,
);
ProductCard.displayName = 'ProductCard';