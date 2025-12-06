import { Suspense } from 'react';
import { CategoriesPage } from '@/components/categories/categories-page';
import { PageLoader } from '@/components/common/page-loader';

export default function Categories() {
  return (
    <Suspense fallback={<PageLoader message="Loading categories..." className="min-h-screen" />}>
      <CategoriesPage />
    </Suspense>
  );
}

