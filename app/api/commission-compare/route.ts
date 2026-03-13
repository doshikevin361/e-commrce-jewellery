import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, getRetailerFromRequest, isAdminOrVendor } from '@/lib/auth';
import { ObjectId } from 'mongodb';

const norm = (s: string) => (s ?? '').trim().toLowerCase();
const key = (r: { productType?: string; category?: string; designType?: string; metal?: string; purityKarat?: string }) =>
  `${norm(r.productType ?? '')}|${norm(r.category ?? '')}|${norm(r.designType ?? '')}|${norm(r.metal ?? '')}|${norm(r.purityKarat ?? '')}`;

/**
 * GET - Commission comparison (no price).
 * Vendor: other vendors' commission by combination (category wise).
 * Retailer: vendor commission by combination + all retailers' commission by combination (category wise).
 */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    const adminUser = getUserFromRequest(request);
    const isRetailer = !!retailer;
    const isVendor = !!(adminUser && adminUser.role === 'vendor');
    if (!isRetailer && !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category')?.trim()?.toLowerCase() || '';
    const productTypeFilter = searchParams.get('product_type')?.trim()?.toLowerCase() || '';

    const categories = await db.collection('categories').find({}).project({ _id: 1, name: 1 }).toArray();
    const categoryNames = (categories as { name: string }[]).map(c => c.name).filter(Boolean);
    const allProductTypes = ['Gold', 'Silver', 'Platinum', 'Gemstone', 'Diamonds', 'Imitation'];

    if (isVendor) {
      const vendors = await db
        .collection('vendors')
        .find({})
        .project({ _id: 1, commissionRows: 1 })
        .toArray();
      const currentVendorId = adminUser?.id ?? '';

      type VendorEntry = { vendorId: string; vendorCode: string; commissionPercent: number; isOwn: boolean };
      const mapByCombo = new Map<string, VendorEntry[]>();

      for (const v of vendors as any[]) {
        const vendorIdStr = (v._id as ObjectId).toString();
        const vendorCode = `V-${vendorIdStr.slice(-6).toUpperCase()}`;
        const rows = Array.isArray(v.commissionRows) ? v.commissionRows : [];
        for (const r of rows) {
          const k = key(r);
          if (categoryFilter && norm(r.category ?? '') !== categoryFilter) continue;
          if (productTypeFilter && norm(r.productType ?? '') !== productTypeFilter) continue;
          const pct = typeof r.vendorCommission === 'number' ? r.vendorCommission : 0;
          const list = mapByCombo.get(k) ?? [];
          list.push({
            vendorId: vendorIdStr,
            vendorCode,
            commissionPercent: pct,
            isOwn: vendorIdStr === currentVendorId,
          });
          mapByCombo.set(k, list);
        }
      }

      const rows = Array.from(mapByCombo.entries()).map(([comboKey, entries]) => {
        const [productType, category, designType, metal, purityKarat] = comboKey.split('|');
        return {
          productType,
          category,
          designType,
          metal,
          purityKarat,
          vendors: entries,
        };
      }).filter(r => r.vendors.length > 0);

      return NextResponse.json({
        viewType: 'vendor',
        currentUserId: currentVendorId,
        categories: categoryNames,
        productTypes: allProductTypes,
        rows,
      });
    }

    if (isRetailer) {
      const currentRetailerId = retailer?.id ?? '';

      const vendors = await db
        .collection('vendors')
        .find({})
        .project({ _id: 1, commissionRows: 1 })
        .toArray();
      type VendorEntry = { vendorId: string; vendorCode: string; commissionPercent: number };
      const vendorMapByCombo = new Map<string, VendorEntry[]>();
      for (const v of vendors as any[]) {
        const vendorIdStr = (v._id as ObjectId).toString();
        const vendorCode = `V-${vendorIdStr.slice(-6).toUpperCase()}`;
        const rows = Array.isArray(v.commissionRows) ? v.commissionRows : [];
        for (const r of rows) {
          const k = key(r);
          if (categoryFilter && norm(r.category ?? '') !== categoryFilter) continue;
          if (productTypeFilter && norm(r.productType ?? '') !== productTypeFilter) continue;
          const pct = typeof r.vendorCommission === 'number' ? r.vendorCommission : 0;
          const list = vendorMapByCombo.get(k) ?? [];
          list.push({ vendorId: vendorIdStr, vendorCode, commissionPercent: pct });
          vendorMapByCombo.set(k, list);
        }
      }

      const retailers = await db
        .collection('retailers')
        .find({})
        .project({ _id: 1, retailerCommissionRows: 1 })
        .toArray();
      type RetailerEntry = { retailerId: string; retailerCode: string; commissionPercent: number; isOwn: boolean };
      const retailerMapByCombo = new Map<string, RetailerEntry[]>();
      for (const r of retailers as any[]) {
        const retailerIdStr = (r._id as ObjectId).toString();
        const retailerCode = `R-${retailerIdStr.slice(-6).toUpperCase()}`;
        const rows = Array.isArray(r.retailerCommissionRows) ? r.retailerCommissionRows : [];
        for (const row of rows) {
          const k = key(row);
          if (categoryFilter && norm(row.category ?? '') !== categoryFilter) continue;
          if (productTypeFilter && norm(row.productType ?? '') !== productTypeFilter) continue;
          const pct = typeof row.retailerCommission === 'number' ? row.retailerCommission : 0;
          const list = retailerMapByCombo.get(k) ?? [];
          list.push({
            retailerId: retailerIdStr,
            retailerCode,
            commissionPercent: pct,
            isOwn: retailerIdStr === currentRetailerId,
          });
          retailerMapByCombo.set(k, list);
        }
      }

      const vendorCommissionRows = Array.from(vendorMapByCombo.entries())
        .map(([comboKey, entries]) => {
          const [productType, category, designType, metal, purityKarat] = comboKey.split('|');
          return { productType, category, designType, metal, purityKarat, vendors: entries };
        })
        .filter(r => r.vendors.length > 0);

      const retailerCommissionRows = Array.from(retailerMapByCombo.entries())
        .map(([comboKey, entries]) => {
          const [productType, category, designType, metal, purityKarat] = comboKey.split('|');
          return { productType, category, designType, metal, purityKarat, retailers: entries };
        })
        .filter(r => r.retailers.length > 0);

      return NextResponse.json({
        viewType: 'retailer',
        currentUserId: currentRetailerId,
        categories: categoryNames,
        productTypes: allProductTypes,
        vendorCommissionRows,
        retailerCommissionRows,
      });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (e) {
    console.error('[Commission Compare] Error:', e);
    return NextResponse.json({ error: 'Failed to load commission comparison' }, { status: 500 });
  }
}
