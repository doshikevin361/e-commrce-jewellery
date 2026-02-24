import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export type RetailerStatus = 'pending' | 'approved' | 'blocked';

export interface Retailer {
  _id?: ObjectId;
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  gstNumber: string;
  contactNumber: string;
  businessAddress: string;
  trustedVendorIds: string[];
  status: RetailerStatus;
  approvalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  approvedAt?: Date;
}

export async function getRetailerByEmail(email: string) {
  const { db } = await connectToDatabase();
  return db.collection('retailers').findOne({ email: email.trim().toLowerCase() }) as Promise<Retailer | null>;
}

export async function getRetailerById(id: string) {
  const { db } = await connectToDatabase();
  return db.collection('retailers').findOne({ _id: new ObjectId(id) }) as Promise<Retailer | null>;
}

export async function hashRetailerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyRetailerPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createRetailer(data: Omit<Retailer, '_id'>) {
  const { db } = await connectToDatabase();
  const doc = {
    ...data,
    email: data.email.trim().toLowerCase(),
    trustedVendorIds: Array.isArray(data.trustedVendorIds) ? data.trustedVendorIds : [],
    status: 'pending' as RetailerStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection('retailers').insertOne(doc);
  return result.insertedId;
}

export async function updateRetailer(id: string, data: Partial<Retailer>) {
  const { db } = await connectToDatabase();
  await db.collection('retailers').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
}
