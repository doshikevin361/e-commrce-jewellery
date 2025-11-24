'use client';

import { Search, SearchCheckIcon } from 'lucide-react';
import { useState } from 'react';

const trendingSearches = ['Gold Rings', 'Diamond Necklace', 'Pearl Earrings', 'Wedding Sets'];

const SearchBar = () => {
  const [query, setQuery] = useState('');

  return (
    <div className='w-full'>
      <div className='flex items-center rounded-full border border-[#E6D3C2] bg-white px-4 py-2 text-sm shadow-sm'>
        {/* <Search size={16} className='text-[#1F3B29]/60' /> */}
        <input
          type='text'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search for jewelry, materials, or collections'
          className='ml-2 flex-1 bg-transparent text-[#1F3B29] placeholder:text-[#B7A28F] focus:outline-none'
        />
        <button className='rounded-full bg-[#1F3B29] p-2 text-sm font-semibold text-white transition hover:bg-[#16301F]'><Search /></button>
      </div>
    </div>
  );
};

export default SearchBar;


