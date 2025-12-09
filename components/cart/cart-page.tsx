'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { PageLoader } from '@/components/common/page-loader';

export function CartPage() {
  const { cartItems, isLoading, updateQuantity, removeFromCart, fetchCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQuantity = async (productId: string, change: number) => {
    const item = cartItems.find(item => item._id === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      setUpdatingItems(prev => new Set(prev).add(productId));
      try {
        await updateQuantity(productId, newQuantity);
      } finally {
        setUpdatingItems(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    }
  };

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.displayPrice * item.quantity;
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping over ₹5000
  const total = subtotal + shipping;

  // Only show full page loader on initial load, not during quantity updates
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  if (isLoading && initialLoad) {
    return <PageLoader message='Loading cart...' />;
  }

  if (cartItems.length === 0) {
    return (
      <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
        <div className='text-center'>
          <div className='w-20 h-20 rounded-full bg-[#F5EEE5] flex items-center justify-center mx-auto mb-6'>
            <ShoppingCart size={40} className='text-[#C8A15B]' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-4'>Your Cart is Empty</h1>
          <p className='text-sm sm:text-base text-[#4F3A2E] mb-8 max-w-md mx-auto'>
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
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
    <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29] mb-2'>Shopping Cart</h1>
        <p className='text-sm sm:text-base text-[#4F3A2E]'>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2 space-y-4'>
          {cartItems.map(item => (
            <div
              key={item._id}
              className='bg-white border-2 border-[#E6D3C2] rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:border-[#C8A15B] transition-all'>
              <Link href={`/products/${item.urlSlug || item._id}`} className='relative w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-[#F5EEE5] flex-shrink-0'>
                <Image src={item.image} alt={item.title} fill sizes='128px' className='object-cover' />
              </Link>
              <div className='flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='flex-1'>
                  <Link href={`/products/${item.urlSlug || item._id}`}>
                    <h3 className='text-lg font-semibold text-[#1F3B29] mb-1 hover:text-[#C8A15B] transition-colors'>
                      {item.title}
                    </h3>
                  </Link>
                  <p className='text-sm text-[#4F3A2E] mb-2'>{item.category}</p>
                  <p className='text-xl font-bold text-[#1F3B29]'>
                    ₹{item.displayPrice.toLocaleString()}
                    {item.originalPriceNum && item.originalPriceNum > item.displayPrice && (
                      <span className='text-base text-[#4F3A2E]/50 line-through ml-2'>
                        ₹{item.originalPriceNum.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center border border-[#E6D3C2] rounded-lg relative'>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, -1)}
                      disabled={item.quantity <= 1 || updatingItems.has(item._id)}
                      className='p-2 hover:bg-[#F5EEE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      <Minus size={18} />
                    </button>
                    <span className='px-4 py-2 text-[#1F3B29] font-semibold min-w-[3rem] text-center relative'>
                      {updatingItems.has(item._id) ? (
                        <Loader2 size={16} className='animate-spin mx-auto' />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, 1)}
                      disabled={item.quantity >= item.stock || updatingItems.has(item._id)}
                      className='p-2 hover:bg-[#F5EEE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      <Plus size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    aria-label='Remove item'>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link
            href='/products'
            className='inline-flex items-center gap-2 text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors'>
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white border-2 border-[#E6D3C2] rounded-xl p-6 sticky top-24'>
            <h2 className='text-xl font-bold text-[#1F3B29] mb-6'>Order Summary</h2>
            <div className='space-y-4 mb-6'>
              <div className='flex justify-between text-sm text-[#4F3A2E]'>
                <span>Subtotal</span>
                <span className='font-semibold'>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm text-[#4F3A2E]'>
                <span>Shipping</span>
                <span className='font-semibold'>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}</span>
              </div>
              {subtotal < 5000 && (
                <p className='text-xs text-[#C8A15B]'>
                  Add ₹{(5000 - subtotal).toLocaleString()} more for free shipping!
                </p>
              )}
              <div className='border-t border-[#E6D3C2] pt-4 flex justify-between text-lg font-bold text-[#1F3B29]'>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button className='w-full rounded-full bg-[#1F3B29] px-6 py-4 text-white font-semibold hover:bg-[#2a4d3a] transition-colors mb-4'>
              Proceed to Checkout
            </button>
            <Link
              href='/wishlist'
              className='w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-3 text-[#1F3B29] font-semibold hover:bg-[#F5EEE5] transition-colors'>
              View Wishlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

