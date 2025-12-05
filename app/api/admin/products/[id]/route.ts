import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    // Get current user from token
    const currentUser = getUserFromRequest(request);
    
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check if vendor is trying to access another vendor's product
    if (currentUser && isVendor(currentUser) && product.vendorId !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const productData = {
      ...product,
      _id: product._id.toString(),
      tags: Array.isArray(product.tags) ? product.tags : [],
      galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [],
      variants: Array.isArray(product.variants) ? product.variants.map((v: any) => ({
        ...v,
        options: Array.isArray(v.options) ? v.options : []
      })) : [],
      relatedProducts: Array.isArray(product.relatedProducts) ? product.relatedProducts : [],
    };
    
    console.log('[v0] Returning product data:', productData);

    return NextResponse.json(productData);
  } catch (error) {
    console.error('[v0] Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('[v0] PUT request for product ID:', id);
    
    if (!ObjectId.isValid(id)) {
      console.log('[v0] Invalid product ID format:', id);
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    
    console.log('[v0] Update data received:', body);

    const { _id, id: bodyId, createdAt, updatedAt, ...updateData } = body;
    
    // If only status is being updated, skip validation
    const isStatusOnlyUpdate = Object.keys(updateData).length === 1 && 'status' in updateData;
    const normalizedUpdateData = isStatusOnlyUpdate ? updateData : normalizeProductPayload(updateData);
    
    if (!isStatusOnlyUpdate) {
      // Only essential fields are required for update
      const requiredFields = ['name', 'sku', 'shortDescription', 'category'];
      const missingFields = requiredFields.filter(field => !normalizedUpdateData[field]);
      if (missingFields.length > 0) {
        console.log('[v0] Missing required fields:', missingFields);
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
      
      const jewelleryValidationError = validateJewelleryPayload(normalizedUpdateData);
      if (jewelleryValidationError) {
        return NextResponse.json({ error: jewelleryValidationError }, { status: 400 });
      }
    }

    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });
    
    if (!existingProduct) {
      console.log('[v0] Product not found with ID:', id);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Get current user and check vendor access
    const currentUser = getUserFromRequest(request);
    if (currentUser && isVendor(currentUser) && existingProduct.vendorId !== currentUser.id) {
      console.log('[v0] Vendor trying to update another vendor\'s product');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    console.log('[v0] Product found, updating...');

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...normalizedUpdateData, updatedAt: new Date() } }
    );

    console.log('[v0] Update result:', result);

    if (result.matchedCount === 0) {
      console.log('[v0] No product matched for update');
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });
    
    console.log('[v0] Successfully updated product');

    return NextResponse.json({ 
      _id: updatedProduct!._id.toString(), 
      ...updatedProduct 
    });
  } catch (error) {
    console.error('[v0] Error updating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();
    
    // Get current user and check vendor access
    const currentUser = getUserFromRequest(request);
    
    // Check if product exists and vendor owns it
    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    if (currentUser && isVendor(currentUser) && existingProduct.vendorId !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('[v0] Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
