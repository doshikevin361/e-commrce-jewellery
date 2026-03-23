import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromRequest, isVendor } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { requireSubscriptionOr403 } from '@/lib/subscription-access';

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
    // New product detail fields
    size: payload.size ?? '',
    gender: Array.isArray(payload.gender) ? payload.gender : [],
    itemsPair: payload.itemsPair ?? '',
    huidHallmarkNo: payload.huidHallmarkNo ?? '',
    lessStoneWeight: typeof payload.lessStoneWeight === 'number' ? payload.lessStoneWeight : 0,
    // Backward compatibility for old field names
    metalWeight: typeof payload.metalWeight === 'number' ? payload.metalWeight : (payload.hasGold ? payload.goldWeight : (payload.hasSilver ? payload.silverWeight : 0)),
    metalPurity: payload.metalPurity ?? (payload.hasGold ? payload.goldPurity : (payload.hasSilver ? payload.silverPurity : '')),
    jewelleryWeight: typeof payload.jewelleryWeight === 'number' ? payload.jewelleryWeight : (typeof payload.metalWeight === 'number' ? payload.metalWeight : 0),
    jewelleryPurity: payload.jewelleryPurity ?? payload.metalPurity ?? '',
    jewelleryMakingCharges: typeof payload.jewelleryMakingCharges === 'number' ? payload.jewelleryMakingCharges : (typeof payload.makingCharges === 'number' ? payload.makingCharges : 0),
    jewelleryCertification: payload.jewelleryCertification ?? payload.certification ?? '',
    stoneWeight: typeof payload.stoneWeight === 'number' ? payload.stoneWeight : (payload.hasDiamond ? payload.diamondCarat : 0),
    // Map images to galleryImages for consistency
    galleryImages: Array.isArray(payload.galleryImages) ? payload.galleryImages : (Array.isArray(payload.images) ? payload.images : []),
  };
};

const validateJewelleryPayload = (payload: any) => {
  // All product types are jewellery (Gold, Silver, Platinum, Diamonds, Gemstone, Imitation)
  const isJewellery = ['Gold', 'Silver', 'Platinum', 'Diamonds', 'Gemstone', 'Imitation'].includes(payload.product_type);
  if (!payload || !isJewellery) {
    return null;
  }

  const errors: string[] = [];
  const productType = payload.product_type;
  const isDiamondsProductType = productType === 'Diamonds';
  const isSimpleProductType = productType === 'Gemstone' || productType === 'Imitation';
  
  // For Gemstone/Imitation, no material validation needed
  if (isSimpleProductType) {
    // No material validations for Gemstone/Imitation
  } else if (isDiamondsProductType) {
    // For Diamonds product type, metals are optional - no validation required
    // Only validate if metals are actually present
    const hasGold = payload.hasGold === true;
    const hasSilver = payload.hasSilver === true;
    
    // Validate Gold fields only if Gold is selected
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
    
    // Validate Silver fields only if Silver is selected
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
  } else {
    // For Gold/Silver/Platinum product types, material is required
    const hasGold = payload.hasGold === true;
    const hasSilver = payload.hasSilver === true;
    
    if (!hasGold && !hasSilver) {
      errors.push('at least one material (Gold or Silver) must be selected');
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
  }
  
  // Making charges are optional - don't validate (can be 0)
  // No validation needed for making charges

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
    
    let product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    let isRetailerProduct = false;

    if (!product) {
      const retailerProduct = await db.collection('retailer_products').findOne({ _id: new ObjectId(id) });
      if (!retailerProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      isRetailerProduct = true;
      const rp = retailerProduct as Record<string, unknown>;
      const sellingPrice = Number(rp.sellingPrice) || 0;
      const commissionRate = typeof rp.retailerCommissionRate === 'number' ? rp.retailerCommissionRate : 0;
      const finalPrice = commissionRate > 0 ? Math.round(sellingPrice * (1 + commissionRate / 100)) : sellingPrice;
      const mainImg = rp.mainImage ?? '';
      const gallery = Array.isArray(rp.images) && (rp.images as unknown[]).length > 0 ? (rp.images as string[]) : (mainImg ? [mainImg] : []);
      product = {
        _id: rp._id,
        name: rp.name ?? '',
        category: rp.category ?? '',
        vendor: `${(rp.shopName as string) ?? 'Retailer'} (Retailer)`,
        sellerType: 'retailer',
        sellingPrice: finalPrice,
        price: finalPrice,
        stock: Number(rp.quantity) ?? 0,
        status: (rp.status as string) ?? 'active',
        mainImage: mainImg,
        images: gallery,
        galleryImages: gallery,
        sku: rp.sku ?? '',
        product_type: rp.product_type ?? '',
        shortDescription: rp.shortDescription ?? '',
        description: rp.description ?? '',
        tags: Array.isArray(rp.tags) ? rp.tags : [],
        variants: [],
        relatedProducts: [],
      } as any;
    }

    // Check if vendor is trying to access another vendor's product
    if (currentUser && isVendor(currentUser) && product.vendorId !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle both images and galleryImages fields for backward compatibility
    const galleryImages = Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? product.galleryImages
      : (Array.isArray(product.images) && product.images.length > 0 ? product.images : []);

    const productData = {
      ...product,
      _id: product._id.toString(),
      sellerType: isRetailerProduct ? 'retailer' : undefined,
      tags: Array.isArray(product.tags) ? product.tags : [],
      galleryImages: galleryImages,
      variants: Array.isArray(product.variants) ? product.variants.map((v: any) => ({
        ...v,
        options: Array.isArray(v.options) ? v.options : []
      })) : [],
      relatedProducts: Array.isArray(product.relatedProducts) ? product.relatedProducts : [],
    };

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

    const currentUser = getUserFromRequest(request);
    if (currentUser && isVendor(currentUser)) {
      const subErr = await requireSubscriptionOr403(request, 'vendor');
      if (subErr) return subErr;
    }

    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });
    const existingRetailerProduct = existingProduct ? null : await db.collection('retailer_products').findOne({ _id: new ObjectId(id) });

    if (!existingProduct && !existingRetailerProduct) {
      console.log('[v0] Product not found with ID:', id);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existingProduct && currentUser && isVendor(currentUser) && existingProduct.vendorId !== currentUser.id) {
      console.log('[v0] Vendor trying to update another vendor\'s product');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (existingRetailerProduct) {
      if (!isStatusOnlyUpdate) {
        return NextResponse.json({ error: 'Retailer products can only have status updated from Admin list' }, { status: 400 });
      }
      const newStatus = (body.status === 'active' || body.status === 'inactive') ? body.status : 'active';
      await db.collection('retailer_products').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: newStatus, updatedAt: new Date() } }
      );
      const updated = await db.collection('retailer_products').findOne({ _id: new ObjectId(id) });
      return NextResponse.json({ _id: (updated! as any)._id.toString(), ...updated, status: newStatus });
    }

    console.log('[v0] Product found, updating...');

    const priceFields: Record<string, number> = {};
    if (typeof body.price === 'number' && body.price >= 0) priceFields.price = body.price;
    if (typeof body.sellingPrice === 'number' && body.sellingPrice >= 0) priceFields.sellingPrice = body.sellingPrice;
    if (typeof body.subTotal === 'number' && body.subTotal >= 0) priceFields.subTotal = body.subTotal;
    if (typeof body.totalAmount === 'number' && body.totalAmount >= 0) priceFields.totalAmount = body.totalAmount;
    if (typeof body.regularPrice === 'number' && body.regularPrice >= 0) priceFields.regularPrice = body.regularPrice;
    if (typeof body.mrp === 'number' && body.mrp >= 0) priceFields.mrp = body.mrp;

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...normalizedUpdateData, ...priceFields, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });

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
    const currentUser = getUserFromRequest(request);
    if (currentUser && isVendor(currentUser)) {
      const subErr = await requireSubscriptionOr403(request, 'vendor');
      if (subErr) return subErr;
    }

    const { id } = await params;
    const { db } = await connectToDatabase();
    
    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!existingProduct) {
      const retailerProduct = await db.collection('retailer_products').findOne({ _id: new ObjectId(id) });
      if (!retailerProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const deniedRet = rejectIfNoAdminAccess(request, currentUser, 'admin-only');
      if (deniedRet) return deniedRet;
      const result = await db.collection('retailer_products').deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      return NextResponse.json({ message: 'Product deleted' });
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
