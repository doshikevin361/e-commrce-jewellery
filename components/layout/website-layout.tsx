'use client';

import { usePathname } from 'next/navigation';
import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';

export function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show header/footer for admin routes, login, or vendor routes
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/vendors');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-white'>
      <HomeHeader />
      <main className='w-full overflow-x-hidden pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

