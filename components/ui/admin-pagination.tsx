import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function AdminPagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }: AdminPaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className='flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700'>
      <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
        <span>
          Showing <span className='font-medium text-slate-900 dark:text-white'>{startItem}</span> to{' '}
          <span className='font-medium text-slate-900 dark:text-white'>{endItem}</span> of{' '}
          <span className='font-medium text-slate-900 dark:text-white'>{totalItems}</span> results
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className='h-8 w-8 p-0'
          title='First page'>
          <ChevronsLeft className='h-4 w-4' />
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='h-8 w-8 p-0'
          title='Previous page'>
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <div className='flex items-center gap-1'>
          {getPageNumbers().map((page, index) => (
            <span key={index}>
              {page === '...' ? (
                <span className='px-2 text-slate-400'>...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page ? 'bg-[#22c55e] text-white hover:bg-[#1ea34b]' : ''
                  }`}>
                  {page}
                </Button>
              )}
            </span>
          ))}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='h-8 w-8 p-0'
          title='Next page'>
          <ChevronRight className='h-4 w-4' />
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className='h-8 w-8 p-0'
          title='Last page'>
          <ChevronsRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
