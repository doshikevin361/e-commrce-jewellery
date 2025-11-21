import { NextRequest, NextResponse } from 'next/server';
import { getAdminByEmail, verifyPassword, createDefaultAdmin } from '@/lib/models/admin';
import { getVendorByEmail, verifyVendorPassword } from '@/lib/models/vendor';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Login request received');

    // Ensure default admin exists
    try {
      await createDefaultAdmin();
      console.log('[v0] Default admin ensured');
    } catch (adminError) {
      console.error('[v0] Failed to create default admin:', adminError);
      return NextResponse.json(
        { error: 'Database initialization failed', details: String(adminError) },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    console.log('[v0] Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user is an admin
    const admin = await getAdminByEmail(email);
    if (admin) {
      console.log('[v0] Admin found, checking status and password');
      
      if (admin.status === 'inactive') {
        console.log('[v0] Inactive admin attempted login:', email);
        return NextResponse.json(
          { error: 'Your account is inactive. Please contact administrator.' },
          { status: 401 }
        );
      }

      const passwordMatch = await verifyPassword(password, admin.password);
      if (!passwordMatch) {
        console.log('[v0] Password mismatch for admin:', email);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      console.log('[v0] Admin authentication successful for:', email);
      const token = generateToken({
        _id: admin._id?.toString(),
        email: admin.email,
        role: admin.role,
      });

      const response = NextResponse.json({
        success: true,
        token,
        admin: { email: admin.email, name: admin.name, role: admin.role },
      });

      response.cookies.set('adminToken', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });

      console.log('[v0] Admin token set in cookie, returning response');
      return response;
    }

    // Check if user is a vendor
    const vendor = await getVendorByEmail(email);
    if (vendor) {
      console.log('[v0] Vendor found, checking status and password');
      
      if (vendor.status === 'suspended' || vendor.status === 'rejected') {
        console.log('[v0] Inactive vendor attempted login:', email);
        return NextResponse.json(
          { error: `Your account is ${vendor.status}. Please contact administrator.` },
          { status: 401 }
        );
      }

      if (vendor.status === 'pending') {
        console.log('[v0] Pending vendor attempted login:', email);
        return NextResponse.json(
          { error: 'Your account is pending approval. Please wait for admin approval.' },
          { status: 401 }
        );
      }

      const passwordMatch = await verifyVendorPassword(password, vendor.password);
      if (!passwordMatch) {
        console.log('[v0] Password mismatch for vendor:', email);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      console.log('[v0] Vendor authentication successful for:', email);
      const token = generateToken({
        _id: vendor._id?.toString(),
        email: vendor.email,
        role: 'vendor',
      });

      const response = NextResponse.json({
        success: true,
        token,
        admin: { email: vendor.email, name: vendor.ownerName, role: 'vendor', storeName: vendor.storeName },
      });

      response.cookies.set('adminToken', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });

      console.log('[v0] Vendor token set in cookie, returning response');
      return response;
    }

    // No admin or vendor found
    console.log('[v0] No admin or vendor found for email:', email);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
