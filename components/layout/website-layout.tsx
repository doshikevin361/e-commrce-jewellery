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
    <div className='min-h-screen w-full bg-white'>
      {/* Removed overflow-x-hidden from wrapper - can break position: sticky on child elements */}
      <HomeHeader />
      <main className='w-full'>
        {/* Removed overflow-x-hidden from main - can break position: sticky */}
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

