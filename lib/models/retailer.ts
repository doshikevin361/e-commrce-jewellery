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
  /** Legacy / full-line address from registration */
  businessAddress: string;
  /** Structured address (same idea as vendor profile) */
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  businessType?: 'individual' | 'company' | 'partnership';
  panNumber?: string;
  businessRegistrationNumber?: string;
  description?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  trustedVendorIds: string[];
  status: RetailerStatus;
  /** Set when signup completed OTP (same idea as vendor `emailVerified`) */
  emailVerified?: boolean;
  approvalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  approvedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
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

export async function getRetailerByResetToken(token: string): Promise<Retailer | null> {
  const { db } = await connectToDatabase();
  const doc = await db.collection('retailers').findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });
  return doc as Retailer | null;
}
