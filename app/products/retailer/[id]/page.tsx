'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageLoader } from '@/components/common/page-loader';

/** Redirect /products/retailer/[id] to /products/[id] so all product details use the same path. */
export default function RetailerProductRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      router.replace('/products');
      return;
    }
    router.replace(`/products/${id}`);
  }, [id, router]);

  return <PageLoader message="Loading product..." className="min-h-screen" />;
}
