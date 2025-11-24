import { ReactNode } from 'react';
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
          <button
            type='button'
            onClick={onActionClick}
            className='cursor-pointer inline-flex items-center gap-1 rounded-full border border-[#1F3B29] px-5 py-2 text-xs font-semibold text-[#1F3B29]'>
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className='space-y-2'>
        {eyebrow && <p className='text-xs uppercase tracking-[0.3em] text-[#6B6B6B]'>{eyebrow}</p>}
        <h2 className='text-xl sm:text-2xl md:text-3xl font-semibold text-[#1F3B29]'>{title}</h2>
        {description && <p className='text-sm text-[#4F3A2E]'>{description}</p>}
      </div>
      {rightSlot
        ? rightSlot
        : actionLabel && (
            <button
              type='button'
              onClick={onActionClick}
              className='cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-[#1F3B29]'>
              {actionLabel}
              <ChevronRight size={16} />
            </button>
          )}
    </div>
  );
};


