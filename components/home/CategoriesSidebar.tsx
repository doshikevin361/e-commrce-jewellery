'use client';

import { useCategories } from '@/contexts/CategoriesContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronRight, Diamond, Gem, Link2, CircleDot, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const sidebarCategories = [
  'Rings',
  'Necklace',
  'Earring',
  'Bracelet',
  'Brooch',
  'Gold Jewellery',
  'Cufflink',
  'Pearls',
  'Piercing',
  'Platinum',
  'Navratna',
  'Chain',
];

const categoryIcons: Record<string, React.ReactElement> = {
  Rings: <Diamond size={18} />,
  Necklace: <Gem size={18} />,
  Earring: <CircleDot size={18} />,
  Bracelet: <Link2 size={18} />,
  Brooch: <Sparkles size={18} />,
  'Gold Jewellery': <Diamond size={18} />,
  Cufflink: <Link2 size={18} />,
  Pearls: <Gem size={18} />,
  Piercing: <CircleDot size={18} />,
  Platinum: <Diamond size={18} />,
  Navratna: <Gem size={18} />,
  Chain: <Link2 size={18} />,
};

// Grid2x2CheckIcon component
const Grid2x2CheckIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}>
    <path d='M12 3v6m6-6h-6M3 12h6m-6 6h6m6 0v-6m0 6h-6' />
    <path d='M8 8h8v8H8z' fill='currentColor' opacity='0.3' />
    <path d='M8 16l4-4 4 4' stroke='currentColor' strokeWidth='2' />
  </svg>
);

export function CategoriesSidebar() {
  const { sidebarOpen, setSidebarOpen, mobileCategoriesOpen, setMobileCategoriesOpen } = useCategories();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 1024);
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
        if (window.innerWidth >= 1024) {
          setMobileCategoriesOpen(false);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [setMobileCategoriesOpen]);

  // Desktop Sidebar (right side overlay)
  if (!isMobile) {
    return (
      <>
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 lg:z-50 transition-opacity duration-300'
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside
          className={`fixed top-0 right-0 h-full w-[260px] bg-white shadow-2xl z-40 lg:z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className='p-4 sm:p-5 md:p-6'>
            <div className='flex items-center justify-between mb-4 sm:mb-5'>
              <div className='flex items-center gap-2'>
                <Grid2x2CheckIcon size={20} className='text-[#1F3B29]' />
                <h3 className='text-base sm:text-lg font-semibold tracking-[0.2em] text-[#1F3B29]'>Categories</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5EEE5]/60 transition-colors duration-300 text-[#1F3B29]'>
                <span className='text-xl font-semibold'>&times;</span>
              </button>
            </div>
            <ul className='space-y-2 sm:space-y-3 text-xs sm:text-sm font-semibold text-[#1C1F1A]'>
              {sidebarCategories.map((category, index) => (
                <li
                  key={category}
                  className='flex items-center justify-between rounded-xl sm:rounded-2xl px-1 py-1.5 sm:py-2 transition-all duration-300 hover:bg-[#F5EEE5]/60 hover:translate-x-2 hover:shadow-md cursor-pointer'
                  onClick={() => setSidebarOpen(false)}>
                  <div className='flex items-center gap-1.5 sm:gap-2 text-[#3F5C45]'>
                    <span className='transition-transform duration-300'>{categoryIcons[category]}</span>
                    <span className='truncate'>{category}</span>
                  </div>
                  <ChevronRight size={14} className='sm:w-4 sm:h-4 text-[#3F5C45] transition-transform duration-300 flex-shrink-0' />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </>
    );
  }

  // Mobile/Tablet Drawer (Sheet)
  return (
    <Sheet open={mobileCategoriesOpen} onOpenChange={setMobileCategoriesOpen}>
      <SheetContent side='left' className='w-[280px] sm:w-[320px] p-0 overflow-y-auto bg-white'>
        <SheetHeader className='px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E6D3C2]/50 sticky top-0 bg-white z-10'>
          <SheetTitle className='text-base sm:text-lg font-semibold tracking-[0.2em] text-[#1F3B29] text-left flex items-center gap-2'>
            <Grid2x2CheckIcon size={20} className='text-[#1F3B29]' />
            Categories
          </SheetTitle>
        </SheetHeader>
        <ul className='p-3 sm:p-4 space-y-1 sm:space-y-2'>
          {sidebarCategories.map((category) => (
            <li
              key={category}
              className='flex items-center justify-between rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 hover:bg-[#F5EEE5]/60 hover:translate-x-2 hover:shadow-md cursor-pointer active:scale-95'
              onClick={() => setMobileCategoriesOpen(false)}>
              <div className='flex items-center gap-2 sm:gap-3 text-[#3F5C45] flex-1'>
                <span className='transition-transform duration-300 flex-shrink-0'>{categoryIcons[category]}</span>
                <span className='text-sm sm:text-base font-semibold text-[#1C1F1A]'>{category}</span>
              </div>
              <ChevronRight size={18} className='sm:w-5 sm:h-5 text-[#3F5C45] transition-transform duration-300 flex-shrink-0' />
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

