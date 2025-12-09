'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
  _id: string;
  id: string;
  name: string;
  title: string;
  category: string;
  price: string;
  image: string;
  quantity: number;
  urlSlug?: string;
  displayPrice: number;
  originalPriceNum?: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  const fetchCart = useCallback(async (showLoading: boolean = true) => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await fetch('/api/customer/cart');
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      } else if (response.status === 401) {
        // Not logged in
        setCartItems([]);
      } else {
        console.error('Failed to fetch cart');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn]);

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCartItems([]);
      setIsLoading(false);
    }
  }, [isLoggedIn, fetchCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isLoggedIn) {
      // Dispatch event to open login modal
      window.dispatchEvent(new Event('openLoginModal'));
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyInCart) {
          toast('This item already exists in cart', {
            icon: '⚠️',
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
            },
          });
        } else {
          toast.success('Product added to cart successfully');
          await fetchCart(true); // Refresh cart with loader
        }
      } else {
        toast.error(data.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isLoggedIn) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/cart?productId=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item removed from cart', { icon: '🗑️' });
        await fetchCart(true); // Refresh cart with loader
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isLoggedIn) {
      return;
    }

    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    // Optimistically update the cart items locally
    const previousItems = [...cartItems];
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId || item.id === productId
          ? { ...item, quantity }
          : item
      )
    );

    try {
      const response = await fetch('/api/customer/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        // Silently refresh cart in background to ensure sync, but don't show loader
        fetchCart(false).catch(err => console.error('Background cart refresh failed:', err));
      } else {
        // Revert on error
        setCartItems(previousItems);
        const data = await response.json();
        toast.error(data.error || 'Failed to update quantity');
      }
    } catch (error) {
      // Revert on error
      setCartItems(previousItems);
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

