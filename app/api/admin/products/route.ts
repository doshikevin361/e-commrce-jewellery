import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isVendor } from '@/lib/auth';

const normalizeProductPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  return {
    ...payload,
    wholesalePriceType: payload.wholesalePriceType || 'Fixed',
    sizeChartImage: payload.sizeChartImage ?? '',
    jewelleryWeight: typeof payload.jewelleryWeight === 'number' ? payload.jewelleryWeight : 0,
    jewelleryPurity: payload.jewelleryPurity ?? '',
    jewelleryMakingCharges:
      typeof payload.jewelleryMakingCharges === 'number' ? payload.jewelleryMakingCharges : 0,
    jewelleryStoneDetails: payload.jewelleryStoneDetails ?? '',
    jewelleryCertification: payload.jewelleryCertification ?? '',
  };
};

const validateJewelleryPayload = (payload: any) => {
  // All product types are jewellery (Gold, Silver, Platinum)
  const isJewellery = ['Gold', 'Silver', 'Platinum'].includes(payload.product_type);
  if (!payload || !isJewellery) {
    return null;
  }

  const errors: string[] = [];
  if (!(typeof payload.jewelleryWeight === 'number' && payload.jewelleryWeight > 0)) {
    errors.push('weight (grams)');
  }
  if (!payload.jewelleryPurity) {
    errors.push('purity');
  }
  if (!(typeof payload.jewelleryMakingCharges === 'number' && payload.jewelleryMakingCharges > 0)) {
    errors.push('making charges');
  }

  if (errors.length) {
    return `Jewellery products require: ${errors.join(', ')}`;
  }

  return null;
};

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Get current user from token
    const currentUser = getUserFromRequest(request);
    
    // Build query based on user role
    const query: any = {};
    if (currentUser && isVendor(currentUser)) {
      // Vendors only see their own products
      query.vendorId = currentUser.id;
    }
    
    const products = await db.collection('products').find(query).sort({ createdAt: -1, _id: -1 }).toArray();
    
    const serializedProducts = products.map(p => ({
      ...p,
      _id: p._id?.toString(),
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error('[v0] Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const rawBody = await request.json();
    const body = normalizeProductPayload(rawBody);

    const jewelleryValidationError = validateJewelleryPayload(body);
    if (jewelleryValidationError) {
      return NextResponse.json({ error: jewelleryValidationError }, { status: 400 });
    }
    
    // Get current user from token
    const currentUser = getUserFromRequest(request);
    
    // If vendor, automatically set vendorId
    if (currentUser && isVendor(currentUser)) {
      body.vendorId = currentUser.id;
    }

    const productToCreate = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('products').insertOne(productToCreate);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...productToCreate },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
