'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSetup, setIsCheckingSetup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    let isCancelled = false;

    const checkCommissionAndSubscription = async () => {
      const adminData = localStorage.getItem('adminUser');
      if (!adminData) return;

      try {
        const admin = JSON.parse(adminData);
        if (admin?.role !== 'vendor') return;

        setIsCheckingSetup(true);
        const commissionResponse = await fetch('/api/vendor/commission-settings', {
          cache: 'no-store',
        });

        if (!commissionResponse.ok) {
          return;
        }

        const commissionData = await commissionResponse.json();
        const setupCompleted = Boolean(commissionData?.setupCompleted);
        const setupPath = '/admin/vendor-commission-setup';
        const subscriptionPath = '/admin/subscription';

        if (!setupCompleted && pathname !== setupPath) {
          router.push(setupPath);
          return;
        }
        if (setupCompleted && pathname === setupPath) {
          router.push('/admin');
          return;
        }

        const statusRes = await fetch('/api/subscription/status', { cache: 'no-store' });
        if (!statusRes.ok) return;
        const statusData = await statusRes.json();
        if (statusData?.subscriptionEnabled && !statusData?.hasActiveSubscription && pathname !== subscriptionPath) {
          router.push(subscriptionPath);
        }
      } catch (error) {
        console.error('[AdminLayout] Commission/subscription check failed:', error);
      } finally {
        if (!isCancelled) {
          setIsCheckingSetup(false);
        }
      }
    };

    checkCommissionAndSubscription();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, pathname, router]);

  // Global fetch interceptor to handle unauthorized errors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store the current fetch (might already be wrapped by CustomerAuthHandler)
    const currentFetch = window.fetch;

    // Override fetch to intercept responses
    window.fetch = async function (...args) {
      const response = await currentFetch.apply(this, args);
      
      // Check for unauthorized errors (401 or 403) on admin API calls
      if (response.status === 401 || response.status === 403) {
        const url = args[0];
        const urlString = typeof url === 'string' ? url : url instanceof Request ? url.url : String(url);
        
        // Only handle logout for admin API calls
        if (urlString.includes('/api/admin/') || (urlString.includes('/api/auth/') && !urlString.includes('/api/auth/customer/'))) {
          console.warn('[AdminLayout] Unauthorized access detected, logging out...');
          
          // Clear admin tokens
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          
          // Clear customer tokens (if any)
          localStorage.removeItem('customerToken');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userToken');
          
          // Use window.location.href for immediate redirect (works even if response is being processed)
          window.location.href = '/login';
        }
      }
      
      return response;
    };

    // Cleanup: restore previous fetch on unmount
    return () => {
      window.fetch = currentFetch;
    };
  }, [router]);

  if (isLoading || isCheckingSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto mb-4"></div>
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
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
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
