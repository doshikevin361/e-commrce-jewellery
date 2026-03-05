import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

type CommissionRow = {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  retailerCommission: number;
};

/** GET - Fetch retailer's commission rows (combination-based, same logic as admin). */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const doc = await db.collection('retailers').findOne(
      { _id: new ObjectId(retailer.id) },
      { projection: { retailerCommissionRows: 1 } }
    );
    const rows = Array.isArray(doc?.retailerCommissionRows) ? doc.retailerCommissionRows : [];

    return NextResponse.json({
      commissionRows: rows.map((r: CommissionRow) => ({
        productType: r.productType ?? '',
        category: r.category ?? '',
        designType: r.designType ?? '',
        metal: r.metal ?? '',
        purityKarat: r.purityKarat ?? '',
        retailerCommission: typeof r.retailerCommission === 'number' ? r.retailerCommission : 0,
      })),
    });
  } catch (e) {
    console.error('[Retailer Commission] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch commission settings' }, { status: 500 });
  }
}

/** PUT - Save retailer's commission rows. */
export async function PUT(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const raw = Array.isArray(body.commissionRows) ? body.commissionRows : [];
    const retailerCommissionRows = raw.map((r: any) => ({
      productType: String(r?.productType ?? '').trim(),
      category: String(r?.category ?? '').trim(),
      designType: String(r?.designType ?? '').trim(),
      metal: String(r?.metal ?? '').trim(),
      purityKarat: String(r?.purityKarat ?? '').trim(),
      retailerCommission: typeof r?.retailerCommission === 'number' && Number.isFinite(r.retailerCommission) ? Math.max(0, Math.min(100, r.retailerCommission)) : 0,
    }));

    const { db } = await connectToDatabase();
    await db.collection('retailers').updateOne(
      { _id: new ObjectId(retailer.id) },
      { $set: { retailerCommissionRows, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      commissionRows: retailerCommissionRows,
    });
  } catch (e) {
    console.error('[Retailer Commission] PUT error:', e);
    return NextResponse.json({ error: 'Failed to save commission settings' }, { status: 500 });
  }
}
