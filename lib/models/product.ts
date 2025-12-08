import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export type ProductType = 'Physical Product' | 'Digital Product' | 'External / Affiliate Product';

export interface Product {
  _id?: ObjectId;
  name: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[]; // Added tags field
  regularPrice: number;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  stock: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  barcode: string;
  weight: number;
  dimensions: string;
  shippingClass: string;
  processingTime: string;
  product_type: ProductType;
  free_shipping: boolean;
  allow_return: boolean;
  return_policy: string;
  metaTitle: string;
  metaDescription: string;
  urlSlug: string; // Added SEO fields
  focusKeyword: string;
  mainImage: string; // Added image and media fields
  galleryImages: string[];
  productVideo: string;
  variants: Array<{
    id: string;
    type: string;
    options: Array<{
      name: string;
      sku: string;
      price: number;
      stock: number;
      image: string;
    }>;
  }>; // Added variants field
  relatedProducts: string[]; // Added related products field
  status: string;
  featured: boolean;
  allowReviews: boolean;
  vendor: string;
  vendorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getAllProducts() {
  const { db } = await connectToDatabase();
  return db.collection('products').find({}).toArray();
}

export async function getProductById(id: string) {
  const { db } = await connectToDatabase();
  return db.collection('products').findOne({ _id: new ObjectId(id) });
}

export async function createProduct(product: Omit<Product, '_id'>) {
  const { db } = await connectToDatabase();
  const result = await db.collection('products').insertOne({
    ...product,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { db } = await connectToDatabase();
  return db.collection('products').findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...product,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );
}

export async function deleteProduct(id: string) {
  const { db } = await connectToDatabase();
  return db.collection('products').deleteOne({ _id: new ObjectId(id) });
}
