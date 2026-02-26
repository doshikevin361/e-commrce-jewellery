'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/home/common/product-card';
import { PageLoader } from '@/components/common/page-loader';

type RetailerProduct = {
  _id: string;
  name: string;
  mainImage: string;
  shopName: string;
  sellingPrice: number;
  quantity: number;
  retailerId: string;
};

export default function PartnerStoresPage() {
  const [products, setProducts] = useState<RetailerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/retailer-products?limit=24')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return <PageLoader message="Loading partner products..." />;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EEE5]">
          <Store className="h-6 w-6 text-[#C8A15B]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3B29]">Partner Stores</h1>
          <p className="text-sm text-[#4F3A2E]">Products from our partner retailers. Sold and fulfilled by them.</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#F5EEE5] border border-[#E6D3C2]">
          <Store className="w-14 h-14 text-[#C8A15B] mx-auto mb-4 opacity-70" />
          <p className="text-[#1F3B29] font-medium">No partner products at the moment</p>
          <p className="text-sm text-[#4F3A2E] mt-2">Check back later or browse our main collection.</p>
          <Link
            href="/products"
            className="inline-block mt-6 rounded-full bg-[#1F3B29] px-6 py-3 text-white font-semibold hover:bg-[#2a4d3a] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={{
                id: p._id,
                _id: p._id,
                title: p.name,
                category: p.shopName ? `Sold by ${p.shopName}` : 'Partner Store',
                price: formatCurrency(p.sellingPrice),
                image: p.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
                rating: 4.5,
                reviews: 0,
              }}
              retailerProductId={p._id}
              retailerId={p.retailerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
