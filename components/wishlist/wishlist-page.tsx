'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/home/common/product-card';
import { featuredProducts } from '@/app/utils/dummyData';

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(featuredProducts.slice(0, 4));

  const removeFromWishlist = (id: number | string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
        <div className='text-center'>
          <div className='w-20 h-20 rounded-full bg-[#F5EEE5] flex items-center justify-center mx-auto mb-6'>
            <Heart size={40} className='text-[#C8A15B]' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-4'>Your Wishlist is Empty</h1>
          <p className='text-sm sm:text-base text-[#4F3A2E] mb-8 max-w-md mx-auto'>
            Start adding items you love to your wishlist. They'll be saved here for you to purchase later.
          </p>
          <Link
            href='/products'
            className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
            <ArrowRight size={18} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8 sm:mb-12'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-12 h-12 rounded-full bg-[#F5EEE5] flex items-center justify-center'>
            <Heart size={24} className='text-[#C8A15B] fill-[#C8A15B]' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29]'>My Wishlist</h1>
            <p className='text-sm sm:text-base text-[#4F3A2E]'>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
        {wishlistItems.map(product => (
          <div key={product.id} className='group relative'>
            <ProductCard product={product} />
            <div className='absolute top-3 right-3 flex gap-2'>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className='w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[#E6D3C2] flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all group/btn'>
                <Trash2 size={18} className='text-[#4F3A2E] group-hover/btn:text-red-600' />
              </button>
            </div>
            <div className='mt-3 flex gap-2'>
              <Link
                href={`/products/${product.id}`}
                className='flex-1 flex items-center justify-center gap-2 rounded-full bg-[#1F3B29] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2a4d3a] transition-colors'>
                <ShoppingCart size={16} />
                Add to Cart
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className='mt-12 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F5EEE5] rounded-xl p-6'>
        <div>
          <p className='text-sm text-[#4F3A2E] mb-1'>Total Items</p>
          <p className='text-2xl font-bold text-[#1F3B29]'>{wishlistItems.length}</p>
        </div>
        <div className='flex gap-3'>
          <Link
            href='/products'
            className='inline-flex items-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-3 text-[#1F3B29] font-semibold hover:bg-[#1F3B29] hover:text-white transition-colors'>
            Continue Shopping
          </Link>
          <button className='inline-flex items-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
            Add All to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

