'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { ProductCard, ProductCardData } from '@/components/home/common/product-card';
import { PageLoader } from '@/components/common/page-loader';
import { useToast } from '@/hooks/use-toast';

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
      setIsLoggedIn(!!token);
      if (!token) {
        window.dispatchEvent(new Event('openLoginModal'));
      }
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [router]);

  // Fetch wishlist items
  useEffect(() => {
    if (isLoggedIn === false) {
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/customer/wishlist');

        if (response.status === 401) {
          // Not logged in, redirect to login
          router.push('/?login=true');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        const data = await response.json();
        setWishlistItems(data.products || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to load wishlist. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router, toast]);

  const removeFromWishlist = async (productId: string) => {
    try {
      setRemoving(productId);
      const response = await fetch(`/api/customer/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        router.push('/?login=true');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      // Remove from local state
      setWishlistItems(items =>
        items.filter(item => {
          const itemId = (item as any)._id || item.id.toString();
          return itemId !== productId;
        })
      );

      // Dispatch event to update wishlist count in header
      window.dispatchEvent(new Event('wishlistChange'));

      toast({
        title: 'Success',
        description: 'Product removed from wishlist',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRemoving(null);
    }
  };

  if (isLoggedIn === null || loading) {
    return <PageLoader message='Loading wishlist...' className='min-h-screen' />;
  }

  if (isLoggedIn === false) {
    return (
      <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
        <div className='text-center'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5EEE5] flex items-center justify-center mx-auto mb-4 sm:mb-6'>
            <Heart size={32} className='sm:w-10 sm:h-10 text-[#C8A15B]' />
          </div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-[#1F3B29] mb-3 sm:mb-4'>Login Required</h1>
          <p className='text-xs sm:text-sm md:text-base text-[#4F3A2E] mb-6 sm:mb-8 max-w-md mx-auto px-4'>
            Please log in to view your wishlist and saved items.
          </p>
          <Link
            href='/'
            className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
        <div className='text-center'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5EEE5] flex items-center justify-center mx-auto mb-4 sm:mb-6'>
            <Heart size={32} className='sm:w-10 sm:h-10 text-[#C8A15B]' />
          </div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-[#1F3B29] mb-3 sm:mb-4'>Your Wishlist is Empty</h1>
          <p className='text-xs sm:text-sm md:text-base text-[#4F3A2E] mb-6 sm:mb-8 max-w-md mx-auto px-4'>
            Start adding items you love to your wishlist. They'll be saved here for you to purchase later.
          </p>
          <Link
            href='/products'
            className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
            <ArrowRight size={16} className='sm:w-[18px] sm:h-[18px]' />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-6 sm:mb-8 md:mb-12'>
        <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
          <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F5EEE5] flex items-center justify-center'>
            <Heart size={20} className='sm:w-6 sm:h-6 text-[#C8A15B] fill-[#C8A15B]' />
          </div>
          <div>
            <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F3B29]'>My Wishlist</h1>
            <p className='text-xs sm:text-sm md:text-base text-[#4F3A2E]'>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'>
      {wishlistItems.map(product => {
          const productId = (product as any)._id || product.id.toString();
          const productSlug = (product as any).urlSlug || productId;
          return (
            <div key={productId} className='group relative'>
              <ProductCard
                product={product}
                onClick={() => router.push(`/products/${productSlug}`)}
                showDeleteIcon={true}
                onDelete={() => removeFromWishlist(productId)}
              />
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className='mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center bg-[#F5EEE5] rounded-xl p-4 sm:p-5 md:p-6'>
        <div>
          <p className='text-xs sm:text-sm text-[#4F3A2E] mb-1'>Total Items</p>
          <p className='text-xl sm:text-2xl font-bold text-[#1F3B29]'>{wishlistItems.length}</p>
        </div>
        <div className='flex gap-2 sm:gap-3 w-full sm:w-auto'>
          <Link
            href='/products'
            className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-[#1F3B29] font-semibold hover:bg-[#1F3B29] hover:text-white transition-colors w-full sm:w-auto'>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
