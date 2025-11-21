'use client';

import { Diamond, ShoppingCart, User } from 'lucide-react';
import SearchBar from './SearchBar/SearchBar';

const navLinks = ['Home', 'Shop', 'Blog', 'About Us'];

export function HomeHeader() {
  return (
    <header className='bg-white'>
      <div className='mx-auto mb-4 flex w-full max-w-full items-center justify-between gap-4 px-4 py-3 pt-8 md:px-6 lg:max-w-7xl lg:px-0'>
        <div className='flex items-center gap-2'>
          <Diamond size={18} className='text-[#1F3B29]' />
          <span className='text-xl font-semibold tracking-[0.2em] text-[#1F3B29]'>LuxeLoom</span>
        </div>

        <div className='mx-5 flex-1 md:max-w-2xl'>
          <SearchBar />
        </div>

        <div className='flex items-center gap-6 text-sm text-[#1F3B29]'>
          <button className='flex items-center gap-1 font-semibold' aria-label='Account'>
            <User size={18} />
            Your Account
          </button>
          <button className='flex items-center gap-1 font-semibold' aria-label='Cart'>
            <ShoppingCart size={18} />
            Your Cart
          </button>
        </div>
      </div>

      <nav className='border-t border-[#E6D3C2]/70'>
        <ul className='mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-4 text-sm font-semibold text-[#4F3A2E]'>
          {navLinks.map(link => (
            <li key={link} className='cursor-pointer transition hover:text-[#1F3B29]'>
              {link}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

