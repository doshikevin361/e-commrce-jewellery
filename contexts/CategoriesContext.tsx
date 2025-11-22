'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CategoriesContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileCategoriesOpen: boolean;
  setMobileCategoriesOpen: (open: boolean) => void;
}

export const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  return (
    <CategoriesContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        mobileCategoriesOpen,
        setMobileCategoriesOpen,
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

