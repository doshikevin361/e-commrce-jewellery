import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen w-full overflow-x-hidden bg-white ${className}`}>
      <HomeHeader />
      <main className='w-full overflow-x-hidden pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

