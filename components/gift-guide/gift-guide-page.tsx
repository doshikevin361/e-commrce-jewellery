'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Gift, Heart, Sparkles, Calendar, ArrowRight, Star } from 'lucide-react';
import { ProductCard } from '@/components/home/common/product-card';
import { featuredProducts } from '@/app/utils/dummyData';

export function GiftGuidePage() {
  const occasions = [
    {
      icon: <Heart size={28} />,
      title: 'Anniversary',
      description: 'Celebrate your love with timeless pieces',
      products: featuredProducts.slice(0, 3),
      color: 'from-pink-100 to-pink-50',
    },
    {
      icon: <Sparkles size={28} />,
      title: 'Engagement',
      description: 'Find the perfect ring for your proposal',
      products: featuredProducts.slice(1, 4),
      color: 'from-blue-100 to-blue-50',
    },
    {
      icon: <Calendar size={28} />,
      title: 'Birthday',
      description: 'Make their special day unforgettable',
      products: featuredProducts.slice(2, 5),
      color: 'from-purple-100 to-purple-50',
    },
  ];

  const priceRanges = [
    { range: 'Under $100', description: 'Thoughtful gifts that show you care', count: 12 },
    { range: '$100 - $250', description: 'Elegant pieces for special occasions', count: 24 },
    { range: '$250 - $500', description: 'Premium jewelry for memorable moments', count: 18 },
    { range: '$500+', description: 'Luxury pieces for lifetime memories', count: 8 },
  ];

  const giftIdeas = [
    { category: 'For Her', items: ['Diamond Necklace', 'Pearl Earrings', 'Gold Bracelet'] },
    { category: 'For Him', items: ['Gold Cufflinks', 'Silver Chain', 'Leather Bracelet'] },
    { category: 'For Couples', items: ['Matching Rings', 'His & Hers Sets', 'Promise Rings'] },
  ];

  return (
    <div className='mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10'>
      {/* Header */}
      <div className='mb-8 sm:mb-12 text-center'>
        <div className='inline-flex items-center gap-2 mb-4'>
          <div className='h-px w-8 bg-[#E6D3C2]' />
          <Gift size={24} className='text-[#C8A15B]' />
          <div className='h-px w-8 bg-[#E6D3C2]' />
        </div>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-3'>
          Gift Guide
        </h1>
        <p className='text-sm sm:text-base text-[#4F3A2E] max-w-2xl mx-auto'>
          Find the perfect jewelry gift for every occasion and budget
        </p>
      </div>

      {/* Occasions */}
      <div className='mb-12 sm:mb-16'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-6 sm:mb-8'>Shop by Occasion</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
          {occasions.map((occasion, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${occasion.color} rounded-2xl p-6 sm:p-8 border border-[#E6D3C2] hover:border-[#C8A15B] transition-all hover:shadow-xl`}>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#C8A15B]'>
                  {occasion.icon}
                </div>
                <h3 className='text-xl sm:text-2xl font-bold text-[#1F3B29]'>{occasion.title}</h3>
              </div>
              <p className='text-sm sm:text-base text-[#4F3A2E] mb-6'>{occasion.description}</p>
              <Link
                href='/products'
                className='inline-flex items-center gap-2 text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors'>
                Shop {occasion.title}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div className='mb-12 sm:mb-16'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-6 sm:mb-8'>Shop by Budget</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          {priceRanges.map((range, index) => (
            <Link
              key={index}
              href={`/products?minPrice=${range.range.includes('Under') ? '0' : range.range.split('$')[1]?.split(' ')[0] || '100'}&maxPrice=${range.range.includes('+') ? '1000' : range.range.split('$')[1]?.split(' ')[0] || '250'}`}
              className='bg-white border-2 border-[#E6D3C2] rounded-xl p-5 sm:p-6 hover:border-[#C8A15B] transition-all hover:shadow-lg group'>
              <div className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-2 group-hover:text-[#C8A15B] transition-colors'>
                {range.range}
              </div>
              <p className='text-sm text-[#4F3A2E] mb-3'>{range.description}</p>
              <div className='flex items-center gap-2 text-xs sm:text-sm text-[#C8A15B] font-semibold'>
                <span>{range.count} items</span>
                <ArrowRight size={14} className='group-hover:translate-x-1 transition-transform' />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Gift Ideas by Category */}
      <div className='mb-12 sm:mb-16'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-6 sm:mb-8'>Gift Ideas</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
          {giftIdeas.map((idea, index) => (
            <div key={index} className='bg-white border-2 border-[#E6D3C2] rounded-xl p-6 hover:border-[#C8A15B] transition-all'>
              <h3 className='text-xl font-bold text-[#1F3B29] mb-4'>{idea.category}</h3>
              <ul className='space-y-2 mb-4'>
                {idea.items.map((item, i) => (
                  <li key={i} className='flex items-center gap-2 text-sm text-[#4F3A2E]'>
                    <Star size={14} className='text-[#C8A15B]' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href='/products'
                className='text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors inline-flex items-center gap-1'>
                View All
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Gifts */}
      <div className='mb-12'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29]'>Popular Gift Choices</h2>
          <Link
            href='/products'
            className='text-sm font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors inline-flex items-center gap-1'>
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
          {featuredProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className='bg-gradient-to-br from-[#F5EEE5] to-white rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-[#E6D3C2]'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1F3B29] mb-3'>Need Help Choosing?</h2>
        <p className='text-sm sm:text-base text-[#4F3A2E] mb-6 max-w-2xl mx-auto'>
          Our jewelry experts are here to help you find the perfect gift. Contact us for personalized recommendations.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/contact'
            className='inline-flex items-center justify-center gap-2 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors'>
            Get Expert Advice
          </Link>
          <Link
            href='/size-guide'
            className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1F3B29] px-6 py-3 text-[#1F3B29] font-semibold hover:bg-[#1F3B29] hover:text-white transition-colors'>
            View Size Guide
          </Link>
        </div>
      </div>
    </div>
  );
}

