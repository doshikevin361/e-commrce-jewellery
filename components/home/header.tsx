'use client';

import { Diamond, ShoppingCart, User } from 'lucide-react';
import SearchBar from './SearchBar/SearchBar';


export function HomeHeader() {
  return (
    <header className='bg-white sticky top-0 z-50 shadow-sm'>
      <div className='mx-auto mb-2 sm:mb-3 md:mb-4 flex w-full max-w-full items-center justify-between gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 pt-3 sm:pt-4 md:pt-6 lg:pt-8 lg:max-w-7xl lg:px-0'>
        <div className='flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0'>
          <Diamond size={16} className='sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px] text-[#1F3B29]' />
          <span className='text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.15em] lg:tracking-[0.2em] text-[#1F3B29] whitespace-nowrap'>LuxeLoom</span>
        </div>

        <div className='hidden sm:flex mx-2 sm:mx-3 md:mx-4 lg:mx-5 flex-1 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl'>
          <SearchBar />
        </div>

        <div className='flex items-center gap-1.5 sm:gap-2 md:gap-4 lg:gap-6 text-xs sm:text-sm text-[#1F3B29]'>
          <button className='flex items-center gap-0.5 sm:gap-1 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95' aria-label='Account'>
            <User size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]' />
            <span className='hidden md:inline text-xs md:text-sm'>Your Account</span>
          </button>
          <button className='flex items-center gap-0.5 sm:gap-1 font-semibold px-1 sm:px-1.5 md:px-2 transition-all duration-300 hover:scale-110 active:scale-95 relative' aria-label='Cart'>
            <ShoppingCart size={15} className='sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]' />
            <span className='hidden md:inline text-xs md:text-sm'>Your Cart</span>
            <span className='absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 md:top-0 md:right-0 bg-[#C8A15B] text-white text-[9px] sm:text-[10px] font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center'>0</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className='sm:hidden px-3 pb-2 sm:pb-3'>
        <SearchBar />
      </div>
    </header>
  );
}

