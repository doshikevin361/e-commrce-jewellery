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
    // Material selection flags
    hasGold: payload.hasGold === true,
    hasSilver: payload.hasSilver === true,
    hasDiamond: payload.hasDiamond === true,
    // Gold fields
    goldWeight: typeof payload.goldWeight === 'number' ? payload.goldWeight : 0,
    goldPurity: payload.goldPurity ?? '',
    goldRatePerGram: typeof payload.goldRatePerGram === 'number' ? payload.goldRatePerGram : 0,
    // Silver fields
    silverWeight: typeof payload.silverWeight === 'number' ? payload.silverWeight : 0,
    silverPurity: payload.silverPurity ?? '',
    silverRatePerGram: typeof payload.silverRatePerGram === 'number' ? payload.silverRatePerGram : 0,
    // Diamond fields
    diamondCarat: typeof payload.diamondCarat === 'number' ? payload.diamondCarat : 0,
    diamondRatePerCarat: typeof payload.diamondRatePerCarat === 'number' ? payload.diamondRatePerCarat : 0,
    numberOfStones: typeof payload.numberOfStones === 'number' ? payload.numberOfStones : 0,
    // Making charges
    makingCharges: typeof payload.makingCharges === 'number' ? payload.makingCharges : 0,
    certification: payload.certification ?? '',
    // Backward compatibility for old field names
    metalWeight: typeof payload.metalWeight === 'number' ? payload.metalWeight : (payload.hasGold ? payload.goldWeight : (payload.hasSilver ? payload.silverWeight : 0)),
    metalPurity: payload.metalPurity ?? (payload.hasGold ? payload.goldPurity : (payload.hasSilver ? payload.silverPurity : '')),
    jewelleryWeight: typeof payload.jewelleryWeight === 'number' ? payload.jewelleryWeight : (typeof payload.metalWeight === 'number' ? payload.metalWeight : 0),
    jewelleryPurity: payload.jewelleryPurity ?? payload.metalPurity ?? '',
    jewelleryMakingCharges: typeof payload.jewelleryMakingCharges === 'number' ? payload.jewelleryMakingCharges : (typeof payload.makingCharges === 'number' ? payload.makingCharges : 0),
    jewelleryCertification: payload.jewelleryCertification ?? payload.certification ?? '',
    stoneWeight: typeof payload.stoneWeight === 'number' ? payload.stoneWeight : (payload.hasDiamond ? payload.diamondCarat : 0),
  };
};

const validateJewelleryPayload = (payload: any) => {
  // All product types are jewellery (Gold, Silver, Platinum, Diamond, Gemstone)
  const isJewellery = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'].includes(payload.product_type);
  if (!payload || !isJewellery) {
    return null;
  }

  const errors: string[] = [];
  
  // Check if at least one material is selected
  const hasGold = payload.hasGold === true;
  const hasSilver = payload.hasSilver === true;
  const hasDiamond = payload.hasDiamond === true;
  
  if (!hasGold && !hasSilver && !hasDiamond) {
    errors.push('at least one material (Gold, Silver, or Diamond) must be selected');
  }
  
  // Validate Gold fields if Gold is selected
  if (hasGold) {
    if (!(typeof payload.goldWeight === 'number' && payload.goldWeight > 0)) {
      errors.push('gold weight (grams)');
    }
    if (!payload.goldPurity) {
      errors.push('gold purity');
    }
    if (!(typeof payload.goldRatePerGram === 'number' && payload.goldRatePerGram > 0)) {
      errors.push('gold rate per gram');
    }
  }
  
  // Validate Silver fields if Silver is selected
  if (hasSilver) {
    if (!(typeof payload.silverWeight === 'number' && payload.silverWeight > 0)) {
      errors.push('silver weight (grams)');
    }
    if (!payload.silverPurity) {
      errors.push('silver purity');
    }
    if (!(typeof payload.silverRatePerGram === 'number' && payload.silverRatePerGram > 0)) {
      errors.push('silver rate per gram');
    }
  }
  
  // Validate Diamond fields if Diamond is selected
  if (hasDiamond) {
    if (!(typeof payload.diamondCarat === 'number' && payload.diamondCarat > 0)) {
      errors.push('diamond carat');
    }
    if (!(typeof payload.numberOfStones === 'number' && payload.numberOfStones > 0)) {
      errors.push('number of stones');
    }
    if (!(typeof payload.diamondRatePerCarat === 'number' && payload.diamondRatePerCarat > 0)) {
      errors.push('diamond rate per carat');
    }
  }
  
  // Check for making charges (use new field name first, fallback to old)
  const makingCharges = payload.makingCharges || payload.jewelleryMakingCharges;
  if (!(typeof makingCharges === 'number' && makingCharges > 0)) {
    errors.push('making charges');
  }

  // Basic required fields - only essential ones
  if (!payload.name || !payload.sku || !payload.shortDescription || !payload.category) {
    const missingBasic = [];
    if (!payload.name) missingBasic.push('product name');
    if (!payload.sku) missingBasic.push('SKU');
    if (!payload.shortDescription) missingBasic.push('short description');
    if (!payload.category) missingBasic.push('category');
    errors.push(...missingBasic);
  }
  
  // Note: longDescription, brand, vendor are handled by frontend validation
  // but not enforced at API level for flexibility

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
