'use client';

import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchDialog } from './SearchDialog';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/jewellery?search=${encodeURIComponent(query.trim())}`);
      setIsDialogOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsDialogOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsDialogOpen(true);
    }
  };

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDialogOpen(false);
      }
    };

    if (isDialogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDialogOpen]);

  return (
    <div ref={containerRef} className='w-full relative'>
      <form onSubmit={handleSearch} className='w-full'>
        <div className='flex items-center w-full rounded-full border border-[#E6D3C2] bg-white pl-4 pr-3 py-2 text-sm shadow-sm'>
          <input
            type='text'
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
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

      <SearchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
};

export default SearchBar;
