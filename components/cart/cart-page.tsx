'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { PageLoader } from '@/components/common/page-loader';
import { ProductCard, type ProductCardData } from '@/components/home/common/product-card';
import { useRouter } from 'next/navigation';

export function CartPage() {
  const { cartItems, isLoading, updateQuantity, removeFromCart, fetchCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

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

  const subtotal = cartItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping over ₹5000
  const total = subtotal + shipping;

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  // Only show full page loader on initial load, not during quantity updates
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  if (isLoggedIn === null || (isLoading && initialLoad)) {
    return <PageLoader message='Loading cart...' />;
  }

  if (isLoggedIn === false) {
    return (
      <div className='mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
        <div className='text-center'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F5EEE5] flex items-center justify-center mx-auto mb-4 sm:mb-6'>
            <ShoppingCart size={32} className='sm:w-10 sm:h-10 text-[#C8A15B]' />
          </div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-[#1F3B29] mb-3 sm:mb-4'>Login Required</h1>
          <p className='text-xs sm:text-sm md:text-base text-[#4F3A2E] mb-6 sm:mb-8 max-w-md mx-auto px-4'>
            Please log in to view your cart and checkout items.
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
      <div className='mb-6 sm:mb-8 md:mb-10'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EEE5]'>
            <ShoppingCart className='h-6 w-6 text-[#C8A15B]' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29]'>Shopping Cart</h1>
            <p className='text-sm sm:text-base text-[#4F3A2E]'>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6'>
        {cartItems.map(cartItem => {
          const product: ProductCardData = {
            id: cartItem._id,
            _id: cartItem._id,
            title: cartItem.title,
            category: cartItem.category,
            price: formatCurrency(cartItem.displayPrice),
            originalPrice:
              cartItem.originalPriceNum && cartItem.originalPriceNum > cartItem.displayPrice
                ? formatCurrency(cartItem.originalPriceNum)
                : undefined,
            image: cartItem.image,
            urlSlug: cartItem.urlSlug,
          };

          return (
            <ProductCard
              key={cartItem._id}
              product={product}
              hideDefaultAction
              actionSlot={
                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-3 rounded-xl border border-[#E6D3C2] px-3 py-2'>
                    <button
                      onClick={() => handleUpdateQuantity(cartItem._id, -1)}
                      disabled={cartItem.quantity <= 1 || updatingItems.has(cartItem._id)}
                      className='rounded-full p-1.5 hover:bg-[#F5EEE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      <Minus size={16} />
                    </button>
                    <span className='text-sm font-semibold text-[#1F3B29] min-w-[2rem] text-center'>
                      {updatingItems.has(cartItem._id) ? <Loader2 size={14} className='animate-spin mx-auto' /> : cartItem.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(cartItem._id, 1)}
                      disabled={cartItem.quantity >= cartItem.stock || updatingItems.has(cartItem._id)}
                      className='rounded-full p-1.5 hover:bg-[#F5EEE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(cartItem._id)}
                    className='flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors'
                    aria-label='Remove item'>
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              }
            />
          );
        })}
      </div>

      <div className='mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8'>
        <div className='rounded-2xl border border-[#E6D3C2] bg-[#F5EEE5] p-4 sm:p-5 md:p-6'>
          <p className='text-xs sm:text-sm text-[#4F3A2E] mb-1'>Cart Total</p>
          <p className='text-2xl sm:text-3xl font-bold text-[#1F3B29]'>{formatCurrency(subtotal)}</p>
          <p className='mt-2 text-xs sm:text-sm text-[#4F3A2E]'>
            {shipping === 0 ? 'You have free shipping!' : `Add ${formatCurrency(5000 - subtotal)} more for free shipping.`}
          </p>
          <div className='mt-4 flex flex-wrap gap-3'>
            <Link
              href='/products'
              className='inline-flex items-center justify-center rounded-full border-2 border-[#001e38] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#001e38] hover:bg-[#001e38] hover:text-white transition-colors'>
              Continue Shopping
            </Link>
            <Link
              href='/wishlist'
              className='inline-flex items-center justify-center rounded-full border border-[#001e38] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#4F3A2E] hover:bg-white transition-colors'>
              View Wishlist
            </Link>
          </div>
        </div>

        <div className='rounded-2xl border-2 border-[#001e38] bg-white p-4 sm:p-5 md:p-6'>
          <h2 className='text-lg sm:text-xl font-bold text-[#1F3B29] mb-4'>Order Summary</h2>
          <div className='space-y-3 text-sm text-[#4F3A2E]'>
            <div className='flex justify-between'>
              <span>Subtotal</span>
              <span className='font-semibold'>{formatCurrency(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping</span>
              <span className='font-semibold'>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className='border-t border-[#E6D3C2] pt-3 flex justify-between text-base font-bold text-[#1F3B29]'>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Link
            href='/checkout'
            className='mt-5 flex w-full items-center justify-center rounded-full bg-[#001e38] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2a4d3a] transition-colors'>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
