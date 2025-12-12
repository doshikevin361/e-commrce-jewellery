'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Function to generate menu items dynamically based on available product types
// All items are flat - no dropdowns, all shown separately
// Only main product types are shown, not jewelry type combinations
export const generateMenuItems = (
  availableProductTypes: string[],
  productTypesWithJewelry?: Array<{ productType: string; jewelryTypes: string[] }>
) => {
  // Generate flat menu items - only main product types, no jewelry type combinations
  const flatMenuItems: { name: string; href: string }[] = [];

  return [
    { name: 'Jewellery', href: '/jewellery' },
    { name: 'Custom Jewellery', href: '/custom-jewellery' },
    { name: 'Contact Us', href: '/contact' },
  ];
};

// Hook to fetch and manage menu items
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState(generateMenuItems([]));
  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        // Fetch actual product types from database with jewelry types
        const response = await fetch('/api/public/product-types');
        if (response.ok) {
          const data = await response.json();
          const productTypes = data.productTypes || [];
          const productTypesWithJewelry = data.productTypesWithJewelry || [];

          // Only show product types that actually exist in database
          if (productTypes.length > 0) {
            setMenuItems(generateMenuItems(productTypes, productTypesWithJewelry));
          } else {
            // If no product types found, show only base menu items (Home, Collections, etc.)
            setMenuItems(generateMenuItems([], []));
          }
        } else {
          // On error, show only base menu items
          setMenuItems(generateMenuItems([], []));
        }
      } catch (error) {
        console.error('Failed to fetch product types:', error);
        // On error, show only base menu items
        setMenuItems(generateMenuItems([], []));
      } finally {
        setMenuLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  return { menuItems, menuLoading };
};
