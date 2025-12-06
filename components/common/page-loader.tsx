interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message = 'Loading...', className = '' }: PageLoaderProps) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 py-20 text-center ${className}`}>
      <div className='animate-spin rounded-full h-16 w-16 border-4 border-[#E6D3C2] border-t-[#C8A15B] mx-auto mb-6'></div>
      <div className='text-[#4F3A2E] text-lg font-medium'>{message}</div>
    </div>
  );
}

