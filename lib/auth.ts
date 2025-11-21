import jwt from 'jsonwebtoken';
import { AdminUser } from './models/admin';
import { User } from './models/user';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'grocify-admin-secret-key-production-change-this';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export function generateToken(admin: Partial<AdminUser> | { _id?: string; email: string; role: string }) {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
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
    { expiresIn: '24h' }
  );
}

export function getUserFromRequest(request: NextRequest): DecodedToken | null {
  try {
    // Try to get token from cookie first
    const tokenFromCookie = request.cookies.get('adminToken')?.value;
    
    // Fallback to Authorization header
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = tokenFromCookie || tokenFromHeader;
    
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

export function isVendor(user: DecodedToken | null): boolean {
  return user?.role === 'vendor';
}

export function isAdmin(user: DecodedToken | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin';
}
