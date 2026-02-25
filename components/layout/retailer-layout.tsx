'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RetailerSidebar } from './retailer-sidebar';
import { RetailerTopBar } from './retailer-top-bar';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function RetailerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('retailerToken') : null;
    if (!token) {
      router.push('/retailer/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentFetch = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const response = await currentFetch.apply(this, args);
      if (response.status === 401 || response.status === 403) {
        const url = args[0];
        const urlString = typeof url === 'string' ? url : url instanceof Request ? url.url : String(url);
        if (urlString.includes('/api/retailer') || urlString.includes('/api/retailer-auth/')) {
          localStorage.removeItem('retailerToken');
          localStorage.removeItem('retailerUser');
          window.location.href = '/retailer/login';
        }
      }
      return response;
    };
    return () => {
      window.fetch = currentFetch;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex h-screen">
        <RetailerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <RetailerTopBar />
          <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-background p-6">{children}</main>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />
    </ThemeProvider>
  );
}
