import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export interface CommissionRow {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  vendorCommission: number;
}

export interface VendorCommissionSummary {
  _id: string;
  storeName: string;
  ownerName?: string;
  email: string;
  status?: string;
  commissionSetupCompleted?: boolean;
  commissionRows: CommissionRow[];
  productTypeCommissions?: Record<string, number>;
  allowedProductTypes?: string[];
  allowedCategories?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const vendors = await db
      .collection('vendors')
      .find({})
      .sort({ storeName: 1, createdAt: -1 })
      .project({
        password: 0,
      })
      .toArray();

    const list: VendorCommissionSummary[] = vendors.map((v: any) => {
      const commissionRows = Array.isArray(v.commissionRows)
        ? v.commissionRows.map((r: any) => ({
            productType: String(r?.productType ?? ''),
            category: String(r?.category ?? ''),
            designType: String(r?.designType ?? ''),
            metal: String(r?.metal ?? ''),
            purityKarat: String(r?.purityKarat ?? ''),
            vendorCommission: typeof r?.vendorCommission === 'number' ? r.vendorCommission : 0,
          }))
        : [];
      return {
        _id: v._id?.toString(),
        storeName: v.storeName ?? '',
        ownerName: v.ownerName,
        email: v.email ?? '',
        status: v.status,
        commissionSetupCompleted: Boolean(v.commissionSetupCompleted),
        commissionRows,
        productTypeCommissions: v.productTypeCommissions,
        allowedProductTypes: Array.isArray(v.allowedProductTypes) ? v.allowedProductTypes : [],
        allowedCategories: Array.isArray(v.allowedCategories) ? v.allowedCategories : [],
      };
    });

    return NextResponse.json({ vendors: list, total: list.length });
  } catch (error) {
    console.error('[admin] vendor-commissions fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor commission details' },
      { status: 500 }
    );
  }
}
