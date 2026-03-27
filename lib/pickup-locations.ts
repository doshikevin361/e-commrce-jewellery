import type { Db } from 'mongodb';
import type { DecodedToken } from '@/lib/auth';

export const PICKUP_LOCATIONS_COLLECTION = 'shiprocket_pickup_locations';

/** Admin / staff / vendor: vendor sees admin defaults + own. */
export function mongoFilterPickupListAdminVendor(user: DecodedToken): Record<string, unknown> {
  if (user.role === 'vendor') {
    return { $or: [{ ownerType: 'admin' }, { ownerType: 'vendor', ownerId: user.id }] };
  }
  return {};
}

export function mongoFilterPickupListRetailer(retailerId: string): Record<string, unknown> {
  return { $or: [{ ownerType: 'admin' }, { ownerType: 'retailer', ownerId: retailerId }] };
}

export function canVendorOrAdminUsePickup(
  user: DecodedToken,
  doc: { ownerType: string; ownerId: string }
): boolean {
  if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'staff') return true;
  if (user.role === 'vendor') {
    return doc.ownerType === 'admin' || (doc.ownerType === 'vendor' && doc.ownerId === user.id);
  }
  return false;
}

/** Delete: admins remove any; vendors only their own (not admin defaults). */
export function canDeletePickupRecord(
  user: DecodedToken,
  doc: { ownerType: string; ownerId: string }
): boolean {
  if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'staff') return true;
  if (user.role === 'vendor') {
    return doc.ownerType === 'vendor' && doc.ownerId === user.id;
  }
  return false;
}

export function canRetailerUsePickup(
  retailerId: string,
  doc: { ownerType: string; ownerId: string }
): boolean {
  return doc.ownerType === 'admin' || (doc.ownerType === 'retailer' && doc.ownerId === retailerId);
}

/** Resolve saved pickup (Mongo) for admin/vendor when marking order shipped. */
export async function findPickupLocationForOrderShip(
  db: Db,
  user: DecodedToken,
  pickupNickname: string
): Promise<Record<string, unknown> | null> {
  const pl = pickupNickname.trim();
  if (!pl) return null;
  if (user.role === 'vendor') {
    return db.collection(PICKUP_LOCATIONS_COLLECTION).findOne({
      pickupLocation: pl,
      $or: [{ ownerType: 'admin' }, { ownerType: 'vendor', ownerId: user.id }],
    });
  }
  return db.collection(PICKUP_LOCATIONS_COLLECTION).findOne({ pickupLocation: pl });
}
