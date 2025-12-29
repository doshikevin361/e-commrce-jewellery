'use client';

import { Search, Camera, Mic } from 'lucide-react';
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

  const handleCameraClick = () => {
    // Placeholder for image search functionality
    console.log('Image search clicked');
  };

  const handleMicClick = () => {
    // Placeholder for voice search functionality
    console.log('Voice search clicked');
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
        <div className='flex items-center w-full rounded-full border border-gray-200 bg-white pl-4 pr-2 py-2.5 sm:py-3 text-sm shadow-sm hover:border-gray-300 transition-colors'>
          <Search size={18} className='text-[#1F3B29] shrink-0 mr-2' />
          <input
            type='text'
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder='Search for diamond jewellery'
            className='flex-1 bg-transparent text-[#1F3B29] placeholder:text-gray-400 focus:outline-none text-sm sm:text-base'
          />
          <div className='flex items-center gap-1 sm:gap-2'>
            <button
              type='button'
              onClick={handleCameraClick}
              className='flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-[#1F3B29] hover:bg-gray-100 transition-colors'
              aria-label='Image search'>
              <Camera size={18} className='sm:w-5 sm:h-5' />
            </button>
            <button
              type='button'
              onClick={handleMicClick}
              className='flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-[#1F3B29] hover:bg-gray-100 transition-colors'
              aria-label='Voice search'>
              <Mic size={18} className='sm:w-5 sm:h-5' />
            </button>
          </div>
        </div>
      </form>

      <SearchDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} query={query} onQueryChange={setQuery} />
    </div>
  );
};

export default SearchBar;
