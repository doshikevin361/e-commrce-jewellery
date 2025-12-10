'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  align?: 'left' | 'center';
  className?: string;
  rightSlot?: ReactNode;
};

export const SectionHeader = ({
  title,
  description,
  eyebrow,
  actionLabel,
  onActionClick,
  align = 'left',
  className,
  rightSlot,
}: SectionHeaderProps) => {
  if (align === 'center') {
    return (
      <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
        {eyebrow && <p className='text-xs uppercase tracking-[0.3em] text-[#6B6B6B]'>{eyebrow}</p>}
        <h2 className='text-2xl sm:text-3xl font-semibold text-[#1F3B29]'>{title}</h2>
        {description && <p className='max-w-2xl text-sm text-[#4F3A2E]'>{description}</p>}
        {actionLabel && (
          onActionClick ? (
            <button
              type='button'
              onClick={onActionClick}
              className='cursor-pointer inline-flex items-center gap-1 rounded-full border border-[#1F3B29] px-5 sm:px-6 md:px-7 lg:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-[#1F3B29] hover:bg-[#F5EEE5] transition-colors whitespace-nowrap'>
              {actionLabel}
            </button>
          ) : (
            <Link
              href='/products'
              className='inline-flex items-center gap-1 rounded-full border border-[#1F3B29] px-5 sm:px-6 md:px-7 lg:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-[#1F3B29] hover:bg-[#F5EEE5] transition-colors whitespace-nowrap'>
              {actionLabel}
            </Link>
          )
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3 sm:gap-4', className)}>
      <div className='space-y-2 flex-1 min-w-0'>
        {eyebrow && <p className='text-xs uppercase tracking-[0.3em] text-[#6B6B6B]'>{eyebrow}</p>}
        <h2 className='text-xl sm:text-2xl md:text-3xl font-semibold text-[#1F3B29]'>{title}</h2>
        {description && <p className='text-sm text-[#4F3A2E]'>{description}</p>}
      </div>
      {rightSlot
        ? <div className='flex-shrink-0'>{rightSlot}</div>
        : actionLabel && (
            onActionClick ? (
              <button
                type='button'
                onClick={onActionClick}
                className='cursor-pointer inline-flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors whitespace-nowrap flex-shrink-0'>
                {actionLabel}
                <ChevronRight size={14} className='sm:w-4 sm:h-4 md:w-5 md:h-5' />
              </button>
            ) : (
              <Link
                href='/products'
                className='inline-flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-[#1F3B29] hover:text-[#C8A15B] transition-colors whitespace-nowrap flex-shrink-0'>
                {actionLabel}
                <ChevronRight size={14} className='sm:w-4 sm:h-4 md:w-5 md:h-5' />
              </Link>
            )
          )}
    </div>
  );
};




