import jwt from 'jsonwebtoken';
import { AdminUser } from './models/admin';
import { User } from './models/user';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'grocify-admin-secret-key-production-change-this';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  /** Module keys for role === 'staff' (see lib/admin-modules.ts) */
  permissions?: string[];
}

type TokenPayload = {
  _id?: string;
  email: string;
  role: string;
  permissions?: string[];
};

export function generateToken(admin: Partial<AdminUser> | TokenPayload) {
  const payload: Record<string, unknown> = {
    id: admin._id,
    email: admin.email,
    role: admin.role,
  };
  if (admin.role === 'staff' && Array.isArray(admin.permissions) && admin.permissions.length > 0) {
    payload.permissions = admin.permissions;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('[v0] Token verified successfully');
    return decoded;
  } catch (error) {
    console.log('[v0] Token verification failed:', error);
    return null;
  }
}

export function generateUserToken(user: Partial<User>) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function getUserFromRequest(request: NextRequest): DecodedToken | null {
  try {
    // Try to get token from cookies (admin or customer)
    const adminToken = request.cookies.get('adminToken')?.value;
    const customerToken = request.cookies.get('customerToken')?.value;
    
    // Fallback to Authorization header
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = adminToken || customerToken || tokenFromHeader;
    
    if (!token) {
      console.log('[v0] No token found in request');
      return null;
    }
    
    return verifyToken(token);
  } catch (error) {
    console.error('[v0] Error extracting user from request:', error);
    return null;
  }
}

export function getCustomerFromRequest(request: NextRequest): DecodedToken | null {
  try {
    // Get customer token from cookie
    const customerToken = request.cookies.get('customerToken')?.value;
    
    // Fallback to Authorization header
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = customerToken || tokenFromHeader;
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token);
    // Only return if it's a customer token
    if (decoded && decoded.role === 'customer') {
      return decoded;
    }
    
    return null;
  } catch (error) {
    console.error('[Customer Auth] Error extracting customer from request:', error);
    return null;
  }
}

export function isVendor(user: DecodedToken | null): boolean {
  return user?.role === 'vendor';
}

export function isAdmin(user: DecodedToken | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin';
}

export function isStaff(user: DecodedToken | null): boolean {
  return user?.role === 'staff';
}

export function isAdminOrVendor(user: DecodedToken | null): boolean {
  return isAdmin(user) || isVendor(user);
}

export function isRetailer(user: DecodedToken | null): boolean {
  return user?.role === 'retailer';
}

export function getRetailerFromRequest(request: NextRequest): DecodedToken | null {
  try {
    const retailerToken = request.cookies.get('retailerToken')?.value;
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = retailerToken || tokenFromHeader;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (decoded && decoded.role === 'retailer') return decoded;
    return null;
  } catch {
    return null;
  }
}