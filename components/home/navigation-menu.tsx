'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Common jewelry types for submenus
const jewelryTypes = ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Bangle', 'Chain', 'Mangalsutra', 'Pendant'];

// Function to generate menu items dynamically based on available product types
// All items are flat - no dropdowns, all shown separately
export const generateMenuItems = (availableProductTypes: string[]) => {
  const baseMenuItems = [
    { name: 'Home', href: '/' },
  ];

  // Generate flat menu items - each product type and jewelry type combination as separate items
  const flatMenuItems: { name: string; href: string }[] = [];
  
  availableProductTypes.forEach(productType => {
    const typeName = productType === 'Gold' ? 'Gold' : 
                     productType === 'Silver' ? 'Silver' : 
                     productType === 'Platinum' ? 'Platinum' : 
                     productType === 'Diamond' ? 'Diamond' : 
                     productType === 'Gemstone' ? 'Gemstone' : productType;
    
    // Add main product type link
    flatMenuItems.push({
      name: typeName,
      href: `/products?product_type=${productType}`,
    });
    
    // Add each jewelry type as separate menu item
    jewelryTypes.forEach(jType => {
      flatMenuItems.push({
        name: `${typeName} ${jType}s`,
        href: `/products?product_type=${productType}&jewelryType=${jType}`,
      });
    });
  });

  // Add collection items as separate menu items
  const collectionItems = [
    { name: 'New Arrivals', href: '/products?featured=true' },
    { name: 'Best Sellers', href: '/products?featured=true' },
    { name: 'Trending Now', href: '/products?trending=true' },
    { name: 'Limited Edition', href: '/products' },
  ];

  return [
    ...baseMenuItems,
    ...flatMenuItems,
    ...collectionItems,
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ];
};

// Hook to fetch and manage menu items
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState(generateMenuItems([]));
  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch('/api/public/product-types');
        if (response.ok) {
          const data = await response.json();
          const productTypes = data.productTypes || [];
          setMenuItems(generateMenuItems(productTypes));
        }
      } catch (error) {
        console.error('Failed to fetch product types:', error);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  return { menuItems, menuLoading };
};

