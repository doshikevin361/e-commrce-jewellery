'use client';

import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { blogCards } from '@/app/utils/dummyData';

export default function BlogPage() {
  return (
    <>
      <CategoriesSidebar />
      <div className='w-full overflow-x-hidden'>
        {/* Hero Banner */}
        <section className='relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <Image
              src='https://images.unsplash.com/photo-1603561596112-1d0c62c80203?auto=format&fit=crop&w=1600&q=80'
              alt='Blog'
              fill
              sizes='100vw'
              className='object-cover'
              priority
              unoptimized
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10' />
          </div>
          <div className='relative z-20 h-full flex flex-col justify-center items-center text-center px-3 sm:px-4 md:px-6 text-white'>
            <div className='flex items-center justify-center gap-2 mb-4 sm:mb-5'>
              <div className='w-8 sm:w-10 h-px bg-white/50' />
              <BookOpen size={24} className='sm:w-7 sm:h-7 md:w-8 md:h-8 text-white' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              BLOG
            </h1>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed drop-shadow-lg'>
              Discover jewelry trends, styling tips, and stories from LuxeLoom.
            </p>
          </div>
        </section>

        <section className='mx-auto w-full max-w-[1280px] py-8 sm:py-10 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-0'>

          {/* Blog Posts Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12'>
            {blogCards.map((post) => (
              <article
                key={post.id}
                className='group flex flex-col rounded-xl sm:rounded-2xl border border-[#E6D3C2]/70 bg-white overflow-hidden transition-all duration-300 hover:border-[#1F3B29]/50 hover:shadow-xl hover:-translate-y-2'>
                {/* Image */}
                <Link href={`/blog/${post.id}`} className='relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-gray-200'>
                  <Image
                    src={post.img}
                    alt={post.title}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover transition-transform duration-500 group-hover:scale-110'
                    unoptimized
                  />
                </Link>

                {/* Content */}
                <div className='flex flex-col flex-1 p-4 sm:p-5 md:p-6'>
                  <div className='flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3'>
                    <span className='px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#C8A15B]/10 text-[#C8A15B] text-xs sm:text-sm font-semibold uppercase tracking-wide'>
                      {post.category}
                    </span>
                    <div className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#3F5C45]'>
                      <Calendar size={14} className='sm:w-4 sm:h-4' />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${post.id}`}>
                    <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-[#1F3B29] mb-2 sm:mb-3 group-hover:text-[#C8A15B] transition-colors duration-300 line-clamp-2'>
                      {post.title}
                    </h2>
                  </Link>

                  <p className='text-sm sm:text-base text-[#3F5C45] leading-relaxed mb-4 sm:mb-5 line-clamp-3 flex-1'>
                    {post.desc}
                  </p>

                  <Link
                    href={`/blog/${post.id}`}
                    className='inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#1F3B29] transition-all duration-300 hover:text-[#C8A15B] hover:translate-x-1 group/link'>
                    Read More
                    <ArrowRight size={16} className='sm:w-5 sm:h-5 transition-transform duration-300 group-hover/link:translate-x-1' />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className='text-center'>
            <button className='px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg border-2 border-[#1F3B29] text-[#1F3B29] font-bold text-sm sm:text-base md:text-lg hover:bg-[#1F3B29] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 tracking-wide uppercase'>
              Load More Posts
            </button>
          </div>

          {/* Categories Filter */}
          <div className='mt-12 mb-8'>
            <h2 className='text-2xl font-bold text-[#1F3B29] mb-6 text-center'>Browse by Category</h2>
            <div className='flex flex-wrap justify-center gap-3'>
              {['Design', 'Stories', 'Craft', 'Trends', 'Guide', 'Collection'].map(category => (
                <Link
                  key={category}
                  href={`/blog?category=${category}`}
                  className='px-6 py-2 rounded-full border-2 border-[#E6D3C2] text-[#1F3B29] font-semibold hover:border-[#C8A15B] hover:bg-[#F5EEE5] transition-all'>
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Separator */}
          <div className='flex items-center justify-center gap-2 mt-12 sm:mt-16'>
            <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
            <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-[#C8A15B]' />
            <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
          </div>
        </section>
    </div>
    </>
  );
}

