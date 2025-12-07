import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen w-full bg-white ${className}`}>
      {/* Removed overflow-x-hidden from wrapper - can break position: sticky on child elements */}
      <HomeHeader />
      <main className='w-full pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        {/* Removed overflow-x-hidden from main - can break position: sticky */}
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

