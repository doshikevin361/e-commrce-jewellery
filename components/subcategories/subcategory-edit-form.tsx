'use client';

import { useEffect, useState } from 'react';
import { SubcategoryForm } from './subcategory-form';
import { Spinner } from '@/components/ui/spinner';

interface SubcategoryEditFormProps {
  subcategoryId: string;
}

export function SubcategoryEditForm({ subcategoryId }: SubcategoryEditFormProps) {
  const [subcategory, setSubcategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubcategory();
  }, [subcategoryId]);

  const fetchSubcategory = async () => {
    try {
      console.log('Fetching subcategory:', subcategoryId);
      const response = await fetch(`/api/admin/subcategories/${subcategoryId}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched subcategory data:', data);
        setSubcategory(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch subcategory:', errorData);
      }
    } catch (error) {
      console.error('Failed to fetch subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Spinner />
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <p className='text-red-500'>Failed to load subcategory</p>
      </div>
    );
  }

  return <SubcategoryForm subcategory={subcategory} isEdit={true} />;
}
