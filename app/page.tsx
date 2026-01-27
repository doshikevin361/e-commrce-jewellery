import { Suspense } from 'react';
import { HomePage } from '@/components/home/dynamic-home-page';
import { PageLoader } from '@/components/common/page-loader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Jewellery Collection | Home',
  description: 'Discover our exquisite collection of premium jewellery including gold, silver, diamonds, and gemstones.',
};

// Enable ISR with revalidation
export const revalidate = 60;

export default function Home() {
  return (
    <Suspense fallback={<PageLoader message="Loading..." className="min-h-screen" />}>
      <>
        <HomePage />
        <a
          href="https://wa.me/910000000000"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-7 w-7 fill-current"
          >
            <path d="M20.52 3.48A11.82 11.82 0 0 0 12.02 0C5.43 0 .1 5.33.1 11.9c0 2.08.54 4.12 1.58 5.92L0 24l6.36-1.66a11.86 11.86 0 0 0 5.66 1.44h.01c6.59 0 11.95-5.33 11.95-11.9 0-3.18-1.23-6.17-3.46-8.4Zm-8.5 18.32h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.78.99 1.01-3.68-.24-.38a9.88 9.88 0 0 1-1.52-5.23c0-5.46 4.46-9.9 9.93-9.9 2.65 0 5.14 1.03 7.01 2.9a9.8 9.8 0 0 1 2.9 6.99c0 5.46-4.46 9.9-9.91 9.9Zm5.44-7.4c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15s-.78.97-.96 1.17c-.18.2-.36.23-.66.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.47.13-.62.14-.14.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.63-.93-2.24-.24-.58-.49-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.41.25-.69.25-1.29.17-1.41-.08-.12-.28-.2-.58-.35Z" />
          </svg>
        </a>
      </>
    </Suspense>
  );
}
