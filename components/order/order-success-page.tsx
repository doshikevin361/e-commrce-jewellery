'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/user-dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#F5EEE5] to-white'>
      <div className='max-w-md w-full'>
        <div className='bg-white border-2 border-[#E6D3C2] rounded-2xl p-8 text-center shadow-lg'>
          <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6'>
            <CheckCircle size={48} className='text-green-600' />
          </div>

          <h1 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-3'>Order Placed Successfully!</h1>
          <p className='text-[#4F3A2E] mb-6'>Thank you for your purchase. Your order has been confirmed.</p>

          <div className='bg-[#F5EEE5] border border-[#E6D3C2] rounded-lg p-4 mb-6'>
            <p className='text-sm text-[#4F3A2E] mb-2'>Order ID</p>
            <p className='text-xl font-bold text-[#1F3B29]'>{orderId}</p>
          </div>

          <div className='space-y-3'>
            <Link
              href='/user-dashboard'
              className='w-full flex items-center justify-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
              <Package size={20} />
              View Order Details
            </Link>

            <Link
              href='/products'
              className='w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-3 text-[#1F3B29] font-semibold hover:bg-[#F5EEE5] transition-colors'>
              <ArrowRight size={20} />
              Continue Shopping
            </Link>
          </div>

          <p className='text-sm text-[#4F3A2E] mt-6'>
            Redirecting to your orders in <span className='font-bold text-[#C8A15B]'>{countdown}</span> seconds...
          </p>
        </div>

        <div className='mt-6 text-center'>
          <p className='text-sm text-[#4F3A2E]'>
            An order confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}
