'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

const trendingSearches = ['Gold Rings', 'Diamond Necklace', 'Pearl Earrings', 'Wedding Sets'];

const SearchBar = () => {
  const [query, setQuery] = useState('');

  return (
    <div className='w-full'>
      <label className='mb-2 block text-xs font-semibold tracking-[0.2em] text-[#1F3B29]/70'>SEARCH</label>
      <div className='flex items-center rounded-full border border-[#E6D3C2] bg-white px-4 py-2 text-sm shadow-sm'>
        <Search size={16} className='text-[#1F3B29]/60' />
        <input
          type='text'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search for jewelry, materials, or collections'
          className='ml-3 flex-1 bg-transparent text-[#1F3B29] placeholder:text-[#B7A28F] focus:outline-none'
        />
        <button className='rounded-full bg-[#1F3B29] px-4 py-1 text-sm font-semibold text-white transition hover:bg-[#16301F]'>Go</button>
      </div>
      <div className='mt-2 flex flex-wrap gap-2 text-xs text-[#4F3A2E]'>
        {trendingSearches.map(item => (
          <button
            key={item}
            onClick={() => setQuery(item)}
            className='rounded-full border border-[#E6D3C2] px-3 py-1 hover:border-[#1F3B29] hover:text-[#1F3B29]'>
            #{item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;


