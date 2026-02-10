import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET: Fetch vendor's commission settings
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const vendor = await db.collection('vendors').findOne({ 
      _id: new ObjectId(user.id) 
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Default commission rates if not set
    const defaultCommissions = {
      Gold: 0,
      Silver: 0,
      Platinum: 0,
      Gemstone: 0,
      Diamonds: 0,
      Imitation: 0,
    };

    const commissions = vendor.productTypeCommissions || defaultCommissions;
    const productTypes = Array.isArray(vendor.allowedProductTypes)
      ? vendor.allowedProductTypes
      : [];
    const categories = Array.isArray(vendor.allowedCategories)
      ? vendor.allowedCategories
      : [];
    const commissionRows = Array.isArray(vendor.commissionRows)
      ? vendor.commissionRows.map((r: any) => ({
          productType: String(r?.productType ?? ''),
          category: String(r?.category ?? ''),
          designType: String(r?.designType ?? ''),
          metal: String(r?.metal ?? ''),
          purityKarat: String(r?.purityKarat ?? ''),
          vendorCommission: typeof r?.vendorCommission === 'number' ? r.vendorCommission : 0,
        }))
      : [];
    const setupCompleted = Boolean(
      vendor.commissionSetupCompleted ?? vendor.productTypeCommissions
    );

    return NextResponse.json({ 
      commissions,
      productTypes,
      categories,
      commissionRows,
      vendorId: vendor._id.toString(),
      setupCompleted,
    });
  } catch (error) {
    console.error('[v0] Failed to fetch vendor commission settings:', error);
    return NextResponse.json({ error: 'Failed to fetch commission settings' }, { status: 500 });
  }
}

// PUT: Update vendor's commission settings
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    const { commissions } = body;
    const productTypesInput = Array.isArray(body?.productTypes) ? body.productTypes : [];
    const categoriesInput = Array.isArray(body?.categories) ? body.categories : [];
    const commissionRowsInput = Array.isArray(body?.commissionRows) ? body.commissionRows : [];
    const strict = Boolean(body?.strict);
    const markSetupComplete = Boolean(body?.markSetupComplete);

    if (!commissions || typeof commissions !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request. commissions object is required.' },
        { status: 400 }
      );
    }

    // Validate commission rates (0-100)
    const validCommissions: Record<string, number> = {};
    const productTypes = ['Gold', 'Silver', 'Platinum', 'Gemstone', 'Diamonds', 'Imitation'];
    
    for (const productType of productTypes) {
      const rate = commissions[productType];
      if (typeof rate === 'number' && Number.isFinite(rate) && rate >= 0 && rate <= 100) {
        validCommissions[productType] = rate;
      } else if (strict) {
        return NextResponse.json(
          { error: `Invalid commission rate for ${productType}` },
          { status: 400 }
        );
      } else {
        // Use default if invalid
        const defaults: Record<string, number> = {
          Gold: 0,
          Silver: 0,
          Platinum: 0,
          Gemstone: 0,
          Diamonds: 0,
          Imitation: 0,
        };
        validCommissions[productType] = defaults[productType];
      }
    }

    const safeCommissionRows = commissionRowsInput
      .filter((r: any) => r && (typeof r.productType === 'string' || typeof r.category === 'string'))
      .map((r: any) => ({
        productType: String(r?.productType ?? '').trim(),
        category: String(r?.category ?? '').trim(),
        designType: String(r?.designType ?? '').trim(),
        metal: String(r?.metal ?? '').trim(),
        purityKarat: String(r?.purityKarat ?? '').trim(),
        vendorCommission: typeof r?.vendorCommission === 'number' && Number.isFinite(r.vendorCommission) ? r.vendorCommission : 0,
      }));

    const result = await db.collection('vendors').updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          productTypeCommissions: validCommissions,
          allowedProductTypes: productTypesInput.filter(
            (item: unknown) => typeof item === 'string' && item.trim().length > 0
          ),
          allowedCategories: categoriesInput.filter(
            (item: unknown) => typeof item === 'string' && item.trim().length > 0
          ),
          commissionRows: safeCommissionRows,
          ...(markSetupComplete
            ? {
                commissionSetupCompleted: true,
                commissionSetupCompletedAt: new Date(),
              }
            : {}),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Commission rates updated successfully',
      commissions: validCommissions,
      setupCompleted: markSetupComplete ? true : undefined,
    });
  } catch (error) {
    console.error('[v0] Failed to update vendor commission settings:', error);
    return NextResponse.json({ error: 'Failed to update commission settings' }, { status: 500 });
  }
}
