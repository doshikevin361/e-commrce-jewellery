import { NextRequest, NextResponse } from 'next/server';
import type { DecodedToken } from '@/lib/auth';
import { staffCanAccessApiPath } from '@/lib/admin-modules';

export type AdminAccessMode = 'admin-only' | 'admin-or-vendor';

/**
 * Returns a NextResponse to return from the route handler, or null if access is allowed.
 */
export function rejectIfNoAdminAccess(
  request: NextRequest,
  user: DecodedToken | null,
  mode: AdminAccessMode,
): NextResponse | null {
  const path = request.nextUrl.pathname;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role === 'superadmin' || user.role === 'admin') {
    return null;
  }
  if (user.role === 'vendor') {
    return mode === 'admin-or-vendor'
      ? null
      : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role === 'staff') {
    const perms = user.permissions ?? [];
    return staffCanAccessApiPath(perms, path)
      ? null
      : NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function isSuperAdminOrAdmin(user: DecodedToken | null): boolean {
  return user?.role === 'superadmin' || user?.role === 'admin';
}
