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
    // New jewelry field names
    metalWeight: typeof payload.metalWeight === 'number' ? payload.metalWeight : 0,
    metalPurity: payload.metalPurity ?? '',
    makingCharges: typeof payload.makingCharges === 'number' ? payload.makingCharges : 0,
    certification: payload.certification ?? '',
    // Backward compatibility for old field names
    jewelleryWeight: typeof payload.jewelleryWeight === 'number' ? payload.jewelleryWeight : (typeof payload.metalWeight === 'number' ? payload.metalWeight : 0),
    jewelleryPurity: payload.jewelleryPurity ?? payload.metalPurity ?? '',
    jewelleryMakingCharges: typeof payload.jewelleryMakingCharges === 'number' ? payload.jewelleryMakingCharges : (typeof payload.makingCharges === 'number' ? payload.makingCharges : 0),
    jewelleryCertification: payload.jewelleryCertification ?? payload.certification ?? '',
  };
};

const validateJewelleryPayload = (payload: any) => {
  // All product types are jewellery (Gold, Silver, Platinum, Diamond, Gemstone)
  const isJewellery = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'].includes(payload.product_type);
  if (!payload || !isJewellery) {
    return null;
  }

  const errors: string[] = [];
  
  // Check for metal weight (use new field name first, fallback to old)
  const metalWeight = payload.metalWeight || payload.jewelleryWeight;
  if (!(typeof metalWeight === 'number' && metalWeight > 0)) {
    errors.push('metal weight (grams)');
  }
  
  // Check for metal purity (use new field name first, fallback to old)
  const metalPurity = payload.metalPurity || payload.jewelleryPurity;
  if (!metalPurity) {
    errors.push('metal purity');
  }
  
  // Check for making charges (use new field name first, fallback to old)
  const makingCharges = payload.makingCharges || payload.jewelleryMakingCharges;
  if (!(typeof makingCharges === 'number' && makingCharges > 0)) {
    errors.push('making charges');
  }

  // Basic required fields
  if (!payload.name || !payload.sku || !payload.shortDescription || !payload.category) {
    const missingBasic = [];
    if (!payload.name) missingBasic.push('product name');
    if (!payload.sku) missingBasic.push('SKU');
    if (!payload.shortDescription) missingBasic.push('short description');
    if (!payload.category) missingBasic.push('category');
    errors.push(...missingBasic);
  }

  if (errors.length) {
    return `Required fields missing: ${errors.join(', ')}`;
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
