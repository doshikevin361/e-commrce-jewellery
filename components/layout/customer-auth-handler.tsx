'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Client component that handles automatic logout for customer API unauthorized errors
 * This intercepts all fetch calls and logs out customers on 401/403 errors
 */
export function CustomerAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store original fetch (before any other interceptors)
    const originalFetch = window.fetch;

    // Override fetch to intercept responses
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      
      // Check for unauthorized errors (401 or 403) on customer API calls
      if (response.status === 401 || response.status === 403) {
        const url = args[0];
        const urlString = typeof url === 'string' ? url : url instanceof Request ? url.url : String(url);
        
        // Only handle logout for customer API calls (not admin)
        if (
          (urlString.includes('/api/customer/') || urlString.includes('/api/auth/customer/')) &&
          !urlString.includes('/api/admin/')
        ) {
          console.warn('[CustomerAuthHandler] Unauthorized access detected, logging out customer...');
          
          // Clear customer tokens
          localStorage.removeItem('customerToken');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userToken');
          
          // Clear cart and wishlist data
          localStorage.removeItem('cart');
          localStorage.removeItem('wishlist');
          
          // Redirect to home page
          window.location.href = '/';
        }
      }
      
      return response;
    };

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  return null; // This component doesn't render anything
}

