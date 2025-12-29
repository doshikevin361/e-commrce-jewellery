'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Diamond } from 'lucide-react';
import Link from 'next/link';
import { useCategories, Category } from '@/contexts/CategoriesContext';
import Image from 'next/image';

interface CategoriesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'center';
  className?: string;
}

export function CategoriesDropdown({ isOpen, onClose, position = 'left', className = '' }: CategoriesDropdownProps) {
  const { categories, isLoadingCategories } = useCategories();

  const handleCategoryClick = (category: Category) => {
    onClose();
  };

  // Animation variants for smooth fade + slide
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1], // ease-out
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.2,
      },
    }),
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className={`absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 ${positionClasses[position]} ${className}`}
          onClick={(e) => e.stopPropagation()}>
          {isLoadingCategories ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">No categories available</div>
          ) : (
            <ul className="space-y-1">
              {categories.map((category, index) => (
                <motion.li
                  key={category._id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                    onClick={() => handleCategoryClick(category)}
                    className="block px-4 py-2.5 text-sm text-[#1F3B29] hover:bg-[#F5EEE5]/60 transition-colors duration-200 font-medium flex items-center gap-2 group">
                    {category.icon ? (
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={18}
                        height={18}
                        className="object-contain flex-shrink-0"
                      />
                    ) : (
                      <span className="text-[#3F5C45] group-hover:text-[#1F3B29] transition-colors">
                        <Diamond size={18} />
                      </span>
                    )}
                    <span className="flex-1">{category.name}</span>
                    {category.productCount !== undefined && category.productCount > 0 && (
                      <span className="text-xs text-gray-400">({category.productCount})</span>
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

