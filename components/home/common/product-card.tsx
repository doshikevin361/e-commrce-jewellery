'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export type ProductCardData = {
  id: number | string;
  _id?: string;
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
  urlSlug?: string;
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  actionLabel?: string;
  onClick?: () => void;
  showDeleteIcon?: boolean; // Show trash icon instead of heart when true (for wishlist page)
  onDelete?: () => void; // Callback for delete action (for wishlist page)
};

export const ProductCard = ({
  product,
  className,
  actionLabel = 'Add to cart',
  onClick,
  showDeleteIcon = false,
  onDelete,
}: ProductCardProps) => {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const rating = product.rating || 4.5;
  const isListView = className?.includes('flex-row');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const productId = (product as any)._id || product.id.toString();
  const productSlug = (product as any).urlSlug || productId;
  
  // Check if product is already in cart
  const isInCart = cartItems.some(item => item._id === productId || item.id === productId.toString());

  // Check if user is logged in and if product is in wishlist
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      checkWishlistStatus();
    }
  }, [isLoggedIn, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/customer/wishlist');
      if (response.ok) {
        const data = await response.json();
        const productIds = data.products?.map((p: any) => (p._id || p.id).toString()) || [];
        setIsInWishlist(productIds.includes(productId));
      }
    } catch (error) {
      // Silent fail - user might not be logged in
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      // Dispatch event to open login modal
      window.dispatchEvent(new Event('openLoginModal'));
      return;
    }

    try {
      setWishlistLoading(true);

      if (isInWishlist) {
        // Remove from wishlist - use productId (not slug) for wishlist operations
        const response = await fetch(`/api/customer/wishlist?productId=${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsInWishlist(false);
          toast.success('Product removed from wishlist');
          // Dispatch event to update wishlist count in header
          window.dispatchEvent(new Event('wishlistChange'));
        }
      } else {
        // Add to wishlist - API will handle slug or ID
        const response = await fetch('/api/customer/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: productSlug }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success('Product added to wishlist');
          // Dispatch event to update wishlist count in header
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
      // Navigate to product detail page using product slug
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
      // Use productId (the _id) for cart operations, fallback to slug if needed
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setCartLoading(false);
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
          {/* Wishlist Icon or Delete Icon */}
          {showDeleteIcon && onDelete ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={wishlistLoading}
              className='absolute right-3 top-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[#E6D3C2] flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all group/delete disabled:opacity-50 disabled:cursor-not-allowed'>
              <Trash2 size={18} className='text-[#4F3A2E] group-hover/delete:text-red-600 transition-colors' />
            </button>
          ) : (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className='absolute right-3 top-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[#E6D3C2] flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all group/wishlist disabled:opacity-50 disabled:cursor-not-allowed'>
              <Heart
                size={18}
                className={cn(
                  'transition-colors',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-[#4F3A2E] group-hover/wishlist:text-red-600'
                )}
              />
            </button>
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
            onClick={handleAddToCart}
            disabled={cartLoading || isInCart}
            className={cn(
              'cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              isInCart
                ? 'border-[#C8A15B] bg-[#C8A15B] text-white'
                : 'border-[#1F3B29] text-[#1F3B29] hover:bg-[#1F3B29] hover:text-white'
            )}>
            <ShoppingCart size={16} />
            <span>{cartLoading ? 'Adding...' : isInCart ? 'In Cart' : actionLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
