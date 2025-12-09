import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Customer {
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orders: number;
  spent: number;
  status: 'active' | 'blocked';
  registrationDate: string;
  lastLogin?: string;
  notes?: string;
  // Email verification fields
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  lastVerificationEmailSent?: Date;
  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Password hashing
export async function hashCustomerPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error('[Customer] Error hashing password:', error);
    throw error;
  }
}

// Password verification
export async function verifyCustomerPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('[Customer] Error verifying password:', error);
    throw error;
  }
}

// Get customer by email
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  try {
    const { db } = await connectToDatabase();
    const customer = await db.collection('customers').findOne({ email: email.toLowerCase() });
    return customer as Customer | null;
  } catch (error) {
    console.error('[Customer] Error fetching customer by email:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const customer = await db.collection('customers').findOne({ _id: new ObjectId(id) });
    return customer as Customer | null;
  } catch (error) {
    console.error('[Customer] Error fetching customer by ID:', error);
    throw error;
  }
}

// Get customer by verification token
export async function getCustomerByVerificationToken(token: string): Promise<Customer | null> {
  try {
    const { db } = await connectToDatabase();
    
    // First, try to find customer with the token (without expiration check to see if token exists)
    const customer = await db.collection('customers').findOne({ 
      emailVerificationToken: token
    });
    
    if (!customer) {
      console.log('[Customer] No customer found with verification token:', token.substring(0, 10) + '...');
      return null;
    }
    
    // Check if token has expired
    if (customer.emailVerificationExpires) {
      const expiresDate = new Date(customer.emailVerificationExpires);
      const now = new Date();
      
      // Add 5 minutes buffer to account for timezone differences
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (expiresDate.getTime() + bufferTime < now.getTime()) {
        console.log('[Customer] Verification token expired. Expires:', expiresDate, 'Now:', now);
        return null;
      }
    }
    
    return customer as Customer | null;
  } catch (error) {
    console.error('[Customer] Error fetching customer by verification token:', error);
    throw error;
  }
}

// Get customer by password reset token
export async function getCustomerByResetToken(token: string): Promise<Customer | null> {
  try {
    const { db } = await connectToDatabase();
    const customer = await db.collection('customers').findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    return customer as Customer | null;
  } catch (error) {
    console.error('[Customer] Error fetching customer by reset token:', error);
    throw error;
  }
}

// Update customer
export async function updateCustomer(id: string, data: Partial<Customer>): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    if (!ObjectId.isValid(id)) {
      return false;
    }
    await db.collection('customers').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...data, 
          updatedAt: new Date() 
        } 
      }
    );
    return true;
  } catch (error) {
    console.error('[Customer] Error updating customer:', error);
    throw error;
  }
}

// Create customer
export async function createCustomer(customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const { db } = await connectToDatabase();
    const newCustomer = {
      ...customerData,
      email: customerData.email.toLowerCase(),
      orders: 0,
      spent: 0,
      status: 'active',
      registrationDate: new Date().toISOString().split('T')[0],
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('customers').insertOne(newCustomer);
    return result.insertedId.toString();
  } catch (error) {
    console.error('[Customer] Error creating customer:', error);
    throw error;
  }
}
