'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, Store, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/page-loader';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

type RetailerProduct = {
  _id: string;
  name: string;
  mainImage?: string;
  shopName?: string;
  sellingPrice: number;
  /** Customer-facing price = sellingPrice + retailer commission (when set). */
  customerPrice?: number;
  quantity: number;
  retailerId: string;
  description?: string;
};

export default function RetailerProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [product, setProduct] = useState<RetailerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public/retailer-products/${id}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setProduct(data);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || adding) return;
    setAdding(true);
    try {
      await addToCart(product._id, 1, { retailerProductId: product._id, retailerId: product.retailerId });
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return <PageLoader message="Loading product..." className="min-h-screen" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <Button variant="outline" onClick={() => router.push('/products')}>
            Back to products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link href="/products" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          {product.mainImage ? (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Store className="w-24 h-24" />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <Store className="w-4 h-4" />
            {product.shopName ? `Sold by ${product.shopName}` : 'Partner Store'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-gray-900 mb-6">{formatPrice(product.customerPrice ?? product.sellingPrice)}</p>
          {product.description && (
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">{product.description}</p>
          )}
          <p className="text-sm text-gray-500 mb-6">In stock: {product.quantity}</p>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={product.quantity <= 0 || adding}
            onClick={handleAddToCart}
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
