'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WishlistContextType {
  wishlistCount: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const fetchWishlist = useCallback(async (showLoading: boolean = true) => {
    if (!isLoggedIn) {
      setWishlistCount(0);
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await fetch('/api/customer/wishlist');
      
      if (response.ok) {
        const data = await response.json();
        const products = data.products || [];
        setWishlistCount(products.length);
      } else if (response.status === 401) {
        // Not logged in
        setWishlistCount(0);
      } else {
        console.error('Failed to fetch wishlist');
        setWishlistCount(0);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistCount(0);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn]);

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setWishlistCount(0);
      setIsLoading(false);
    }
  }, [isLoggedIn, fetchWishlist]);

  // Listen for wishlist changes (when items are added/removed)
  useEffect(() => {
    const handleWishlistChange = () => {
      fetchWishlist(false); // Refresh without showing loader
    };
    window.addEventListener('wishlistChange', handleWishlistChange);
    return () => window.removeEventListener('wishlistChange', handleWishlistChange);
  }, [fetchWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        isLoading,
        fetchWishlist,
      }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}


