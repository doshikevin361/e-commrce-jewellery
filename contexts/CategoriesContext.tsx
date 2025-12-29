'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  featured?: boolean;
  status?: string;
  productCount?: number;
  children?: Category[];
}

interface CategoriesContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileCategoriesOpen: boolean;
  setMobileCategoriesOpen: (open: boolean) => void;
  categories: Category[];
  isLoadingCategories: boolean;
  fetchCategories: () => Promise<void>;
}

export const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch('/api/public/categories', {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedCategories = Array.isArray(data.categories) ? data.categories : [];
        setCategories(fetchedCategories);
      } else {
        console.error('[v0] Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('[v0] Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        mobileCategoriesOpen,
        setMobileCategoriesOpen,
        categories,
        isLoadingCategories,
        fetchCategories,
      }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}

