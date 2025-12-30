'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Hero Banner Skeleton
export function HeroBannerSkeleton() {
  return (
    <div className='relative w-full h-[480px] md:h-[540px] lg:h-[620px]'>
      <div className='w-full h-full px-6 lg:px-12 flex items-center justify-center'>
        <div className='relative w-[85%] md:w-[70%] lg:w-[100%] h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden'>
          <Skeleton className='w-full h-full' />
          <div className='absolute inset-0 flex items-center px-8'>
            <div className='space-y-4 max-w-xl'>
              <Skeleton className='h-6 w-32 rounded-full' />
              <Skeleton className='h-12 w-3/4' />
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-2/3' />
              <Skeleton className='h-10 w-32 rounded-full' />
            </div>
          </div>
        </div>
      </div>
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3'>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className='w-3 h-3 rotate-45' />
        ))}
      </div>
    </div>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col rounded-xl border border-[#E6D3C2]/70 bg-white p-3 sm:p-4 w-full', className)}>
      <Skeleton className='h-40 sm:h-48 md:h-56 w-full rounded-xl' />
      <div className='mt-4 flex flex-col gap-3'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-16' />
        <div className='flex items-center justify-between gap-2 mt-auto'>
          <div className='flex flex-col gap-1 flex-1'>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>
          <Skeleton className='h-9 w-24 rounded-full' />
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 lg:gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product Slider Skeleton
export function ProductSliderSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='flex gap-4 sm:gap-4 md:gap-5 lg:gap-6 overflow-hidden pb-2'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex-shrink-0' style={{ width: '260px', minWidth: '260px', maxWidth: '300px' }}>
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Category Strip Skeleton
export function CategoryStripSkeleton() {
  return (
    <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4 md:gap-6 pt-6 sm:pt-8'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='flex flex-col items-center gap-3'>
          <Skeleton className='aspect-square w-full rounded-full' />
          <Skeleton className='h-3 w-16 rounded-full' />
        </div>
      ))}
    </div>
  );
}

// New Arrivals Section Skeleton
export function NewArrivalsSkeleton() {
  return (
    <section className='relative w-full'>
      <Skeleton className='h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] w-full' />
      <div className='max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 -mt-16 sm:-mt-20 md:-mt-24 relative z-10'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
          {[1, 2].map(i => (
            <div key={i} className='bg-white rounded-xl overflow-hidden shadow-lg'>
              <Skeleton className='h-[240px] sm:h-[280px] md:h-[320px] lg:h-[350px] w-full' />
              <Skeleton className='h-6 w-3/4 mx-4 my-4' />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Collections Section Skeleton
export function CollectionsSkeleton() {
  return (
    <section className='w-full overflow-hidden'>
      <div className='border-b border-web pb-3 mb-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-6 w-20' />
        </div>
      </div>
      <div className='grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2 md:gap-6'>
        <div className='flex flex-col md:flex-row items-center gap-4 sm:gap-6 rounded-2xl bg-[#F3F5F7] p-4 sm:p-6 md:p-8'>
          <Skeleton className='h-48 sm:h-64 md:h-[300px] w-full md:w-1/2 rounded-xl' />
          <div className='flex flex-col justify-center w-full md:w-1/2 space-y-3'>
            <Skeleton className='h-8 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-10 w-32 rounded-full' />
          </div>
        </div>
        <div className='flex flex-col gap-3 sm:gap-4 md:gap-5 rounded-2xl bg-[#F3F5F7] p-4 sm:p-6 md:p-8'>
          <div className='space-y-3'>
            <Skeleton className='h-6 w-2/3' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-4/5' />
            <Skeleton className='h-10 w-28 rounded-full' />
          </div>
          <Skeleton className='h-48 sm:h-64 md:h-[280px] lg:h-[330px] w-full rounded-xl' />
        </div>
      </div>
    </section>
  );
}

// Gallery Section Skeleton
export function GallerySkeleton() {
  return (
    <section className='w-full overflow-hidden'>
      <div className='text-center mb-6 sm:mb-8'>
        <Skeleton className='h-8 w-32 mx-auto mb-2' />
        <Skeleton className='h-4 w-64 mx-auto' />
      </div>
      <div className='grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-32 sm:h-40 md:h-56 w-full rounded-xl lg:h-64' />
        ))}
      </div>
    </section>
  );
}

// Why Choose Us Skeleton
export function WhyChooseUsSkeleton() {
  return (
    <section className='w-full overflow-hidden'>
      <div className='text-center mb-6 sm:mb-8'>
        <Skeleton className='h-8 w-40 mx-auto mb-2' />
        <Skeleton className='h-4 w-96 mx-auto' />
      </div>
      <div className='grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex flex-col items-center rounded-2xl border border-web/50 bg-white p-3 sm:p-4 md:p-5 text-center'>
            <Skeleton className='mb-2 sm:mb-3 rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18' />
            <Skeleton className='h-4 w-20 mb-2' />
            <Skeleton className='h-3 w-full' />
          </div>
        ))}
      </div>
    </section>
  );
}
