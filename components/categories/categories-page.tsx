'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoriess } from '@/app/utils/dummyData';
import { ArrowRight, Grid2x2 } from 'lucide-react';

export function CategoriesPage() {
  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8 sm:mb-12 text-center'>
        <div className='inline-flex items-center gap-2 mb-4'>
          <div className='h-px w-8 bg-[#E6D3C2]' />
          <Grid2x2 size={20} className='text-[#C8A15B]' />
          <div className='h-px w-8 bg-[#E6D3C2]' />
        </div>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-3'>
          Shop by Category
        </h1>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Explore our diverse collection of exquisite jewelry, carefully curated across different categories
        </p>
      </div>

      {/* Categories Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
        {categoriess.map((category, index) => (
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className='group relative overflow-hidden rounded-2xl bg-white border-2 border-[#E6D3C2] hover:border-[#C8A15B] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1'>
            <div className='relative h-64 sm:h-80 overflow-hidden bg-[#F5EEE5]'>
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                className='object-cover transition-transform duration-500 group-hover:scale-110'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              {index % 2 === 0 && (
                <div className='absolute top-4 right-4 bg-[#C8A15B] text-white px-3 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  New
                </div>
              )}
            </div>
            <div className='p-6 bg-white'>
              <h3 className='text-xl sm:text-2xl font-bold text-[#1F3B29] mb-2 group-hover:text-[#C8A15B] transition-colors'>
                {category.name}
              </h3>
              <p className='text-sm text-[#4F3A2E] mb-4 leading-relaxed'>
                Discover our stunning collection of {category.name.toLowerCase()}, crafted with precision and elegance
              </p>
              <div className='flex items-center gap-2 text-[#1F3B29] font-semibold text-sm group-hover:text-[#C8A15B] transition-colors'>
                <span>Shop Collection</span>
                <ArrowRight size={16} className='transform group-hover:translate-x-2 transition-transform' />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Section */}
      <div className='mt-12 sm:mt-16 bg-[#F5EEE5] rounded-2xl p-6 sm:p-8 md:p-12 text-center'>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F3B29] mb-4'>
          Can't Find What You're Looking For?
        </h2>
        <p className='text-sm sm:text-base text-[#4F3A2E] mb-6 max-w-2xl mx-auto'>
          Browse our complete product catalog or get in touch with our jewelry experts for personalized assistance.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/products'
            className='inline-flex items-center justify-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#2a4d3a] transition-colors'>
            View All Products
            <ArrowRight size={18} />
          </Link>
          <Link
            href='/contact'
            className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-3 text-sm sm:text-base font-semibold text-[#1F3B29] hover:bg-[#1F3B29] hover:text-white transition-colors'>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

