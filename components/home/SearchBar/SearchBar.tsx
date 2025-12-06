'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className='w-full'>
      <div className='flex items-center w-full rounded-full border border-[#E6D3C2] bg-white pl-4 pr-3 py-2 text-sm shadow-sm'>
        <input
          type='text'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search for jewelry, materials, or collections'
          className='flex-1 bg-transparent text-[#1F3B29] placeholder:text-[#B7A28F] focus:outline-none'
        />

        <button
          type='submit'
          className='flex items-center justify-center rounded-full bg-[#1F3B29] w-9 h-9 text-white transition hover:bg-[#16301F]'>
          <Search size={16} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
