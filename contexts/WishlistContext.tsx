'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface WishlistContextType {
  wishlistCount: number;
  wishlistProductIds: Set<string>; // Store product IDs for quick lookup
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  isProductInWishlist: (productId: string) => boolean; // Method to check if product is in wishlist
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
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
      setWishlistProductIds(new Set());
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
        // Store product IDs in a Set for O(1) lookup
        const productIds = new Set(
          products.map((p: any) => (p._id || p.id).toString())
        );
        setWishlistProductIds(productIds);
      } else if (response.status === 401) {
        // Not logged in
        setWishlistCount(0);
        setWishlistProductIds(new Set());
      } else {
        console.error('Failed to fetch wishlist');
        setWishlistCount(0);
        setWishlistProductIds(new Set());
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistCount(0);
      setWishlistProductIds(new Set());
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn]);

  // Method to check if a product is in the wishlist
  const isProductInWishlist = useCallback((productId: string): boolean => {
    if (!productId || !isLoggedIn) return false;
    return wishlistProductIds.has(productId.toString());
  }, [wishlistProductIds, isLoggedIn]);

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setWishlistCount(0);
      setWishlistProductIds(new Set());
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
        wishlistProductIds,
        isLoading,
        fetchWishlist,
        isProductInWishlist,
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


