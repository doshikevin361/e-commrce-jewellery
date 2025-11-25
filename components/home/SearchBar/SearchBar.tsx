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
      <div className='flex items-center rounded-full border border-[#E6D3C2] bg-white px-4 py-2 text-sm shadow-sm'>
        <input
          type='text'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search for jewelry, materials, or collections'
          className='ml-2 flex-1 bg-transparent text-[#1F3B29] placeholder:text-[#B7A28F] focus:outline-none'
        />
        <button
          type='submit'
          className='rounded-full bg-[#1F3B29] p-2 text-sm font-semibold text-white transition hover:bg-[#16301F]'>
          <Search size={16} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;


