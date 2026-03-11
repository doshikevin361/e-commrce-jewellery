import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET - Fetch single retailer product for edit page.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const product = await db.collection('retailer_products').findOne({
      _id: new ObjectId(id),
      retailerId: new ObjectId(retailer.id),
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
    }

    const p = product as Record<string, unknown> & { retailerId?: ObjectId; _id: ObjectId; category?: string };
    const retailerIdObj = new ObjectId(retailer.id);
    const currentCategory = (p.category as string) || '';

    const looksLikeObjectId = (s: string) => /^[a-fA-F0-9]{24}$/.test(String(s).trim());

    let designTypeOut = (p.designType as string) ?? '';
    if (designTypeOut && looksLikeObjectId(designTypeOut)) {
      try {
        const dt = await db.collection('design_types').findOne(
          { _id: new ObjectId(designTypeOut) },
          { projection: { name: 1 } }
        );
        if (dt && (dt as Record<string, unknown>).name) designTypeOut = (dt as Record<string, string>).name;
      } catch (_) {}
    }

    let metalColourOut = (p.metalColour as string) ?? '';
    if (metalColourOut && looksLikeObjectId(metalColourOut)) {
      try {
        const mc = await db.collection('metal_colors').findOne(
          { _id: new ObjectId(metalColourOut) },
          { projection: { name: 1 } }
        );
        if (mc && (mc as Record<string, unknown>).name) metalColourOut = (mc as Record<string, string>).name;
      } catch (_) {}
    }

    const rawGender = Array.isArray(p.gender) ? p.gender : [];
    const genderMap: Record<string, string> = { Female: 'Women', Male: 'Man', Women: 'Women', Man: 'Man', Unisex: 'Unisex' };
    const allowedGender = new Set(['Man', 'Women', 'Unisex']);
    const genderOut = rawGender
      .map((g: unknown) => genderMap[String(g).trim()] || String(g).trim())
      .filter((g: string) => allowedGender.has(g));

    const storedRelatedIds = Array.isArray(p.relatedProducts)
      ? (p.relatedProducts as string[]).filter((x: unknown) => typeof x === 'string' && ObjectId.isValid(x))
      : [];
    let relatedList: Array<Record<string, unknown>> = [];
    if (storedRelatedIds.length > 0) {
      const ids = storedRelatedIds.map((x: string) => new ObjectId(x));
      const resolved = await db
        .collection('retailer_products')
        .find({ _id: { $in: ids }, retailerId: retailerIdObj, status: 'active' })
        .project({ _id: 1, name: 1, mainImage: 1, sellingPrice: 1, quantity: 1, category: 1 })
        .toArray();
      relatedList = resolved.map((r: Record<string, unknown>) => ({
        _id: (r._id as ObjectId)?.toString(),
        name: r.name,
        mainImage: r.mainImage,
        sellingPrice: r.sellingPrice,
        quantity: r.quantity,
        category: r.category,
      }));
    } else if (currentCategory) {
      const sameCategory = await db
        .collection('retailer_products')
        .find({
          retailerId: retailerIdObj,
          _id: { $ne: new ObjectId(id) },
          status: 'active',
          category: currentCategory,
        })
        .project({ _id: 1, name: 1, mainImage: 1, sellingPrice: 1, quantity: 1, category: 1 })
        .limit(8)
        .toArray();
      relatedList = sameCategory.map((r: Record<string, unknown>) => ({
        _id: (r._id as ObjectId)?.toString(),
        name: r.name,
        mainImage: r.mainImage,
        sellingPrice: r.sellingPrice,
        quantity: r.quantity,
        category: r.category,
      }));
    }

    const out: Record<string, unknown> = {
      _id: (p._id as ObjectId).toString(),
      name: p.name ?? '',
      mainImage: p.mainImage ?? '',
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? p.shortDescription ?? '',
      shopName: p.shopName ?? '',
      sellingPrice: p.sellingPrice ?? 0,
      quantity: p.quantity ?? 0,
      status: p.status ?? 'active',
      retailerCommissionRate: typeof p.retailerCommissionRate === 'number' ? p.retailerCommissionRate : 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: p.category ?? '',
      product_type: p.product_type ?? '',
      designType: designTypeOut,
      metalType: p.metalType ?? '',
      goldPurity: p.goldPurity ?? '',
      silverPurity: p.silverPurity ?? '',
      metalColour: metalColourOut,
      weight: p.weight ?? 0,
      size: p.size ?? '',
      gender: genderOut,
      sku: p.sku ?? '',
      hsnCode: p.hsnCode ?? '',
      tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? (p.tags ? p.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []) : []),
      specifications: Array.isArray(p.specifications) ? p.specifications : [{ key: '', value: '' }],
      images: Array.isArray(p.images) ? p.images : [],
      seoTitle: p.seoTitle ?? '',
      seoDescription: p.seoDescription ?? '',
      seoTags: p.seoTags ?? '',
      urlSlug: p.urlSlug ?? '',
      relatedProducts: relatedList,
    };
    return NextResponse.json(out);
  } catch (e) {
    console.error('[Retailer My Products] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

/**
 * PATCH - Update retailer's portal product. Full edit like vendor: name, mainImage, description, sellingPrice, quantity, status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    const num = (v: unknown, def: number) => (typeof v === 'number' && Number.isFinite(v) ? v : def);
    if (body.name !== undefined) updates.name = str(body.name).trim() || undefined;
    if (body.mainImage !== undefined) updates.mainImage = str(body.mainImage);
    if (body.shortDescription !== undefined) updates.shortDescription = str(body.shortDescription);
    if (body.description !== undefined) updates.description = str(body.description);
    if (body.sellingPrice !== undefined) updates.sellingPrice = num(body.sellingPrice, 0);
    if (body.quantity !== undefined) updates.quantity = Math.max(0, Math.floor(num(body.quantity, 0)));
    if (body.status === 'active' || body.status === 'inactive') updates.status = body.status;
    if (body.retailerCommissionRate !== undefined) updates.retailerCommissionRate = Math.max(0, Math.min(100, num(body.retailerCommissionRate, 0)));
    if (body.category !== undefined) updates.category = str(body.category);
    if (body.product_type !== undefined) updates.product_type = str(body.product_type);
    if (body.designType !== undefined) updates.designType = str(body.designType);
    if (body.metalType !== undefined) updates.metalType = str(body.metalType);
    if (body.goldPurity !== undefined) updates.goldPurity = str(body.goldPurity);
    if (body.silverPurity !== undefined) updates.silverPurity = str(body.silverPurity);
    if (body.metalColour !== undefined) updates.metalColour = str(body.metalColour);
    if (body.weight !== undefined) updates.weight = num(body.weight, 0);
    if (body.size !== undefined) updates.size = str(body.size);
    if (body.gender !== undefined) updates.gender = Array.isArray(body.gender) ? body.gender : [];
    if (body.relatedProducts !== undefined) updates.relatedProducts = Array.isArray(body.relatedProducts) ? body.relatedProducts : [];
    if (body.sku !== undefined) updates.sku = str(body.sku);
    if (body.hsnCode !== undefined) updates.hsnCode = str(body.hsnCode);
    if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    if (body.specifications !== undefined) updates.specifications = Array.isArray(body.specifications) ? body.specifications : [];
    if (body.images !== undefined) updates.images = Array.isArray(body.images) ? body.images : [];
    if (body.seoTitle !== undefined) updates.seoTitle = str(body.seoTitle);
    if (body.seoDescription !== undefined) updates.seoDescription = str(body.seoDescription);
    if (body.seoTags !== undefined) updates.seoTags = str(body.seoTags);
    if (body.urlSlug !== undefined) updates.urlSlug = str(body.urlSlug);

    const cleanUpdates: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(updates)) {
      if (k === 'updatedAt' || v !== undefined) cleanUpdates[k] = v;
    }
    if (Object.keys(cleanUpdates).length <= 1) {
      return NextResponse.json({ error: 'Provide at least one field to update' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const retailerId = new ObjectId(retailer.id);
    const productId = new ObjectId(id);

    const result = await db.collection('retailer_products').findOneAndUpdate(
      { _id: productId, retailerId },
      { $set: cleanUpdates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
    }

    const p = result as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      product: {
        _id: (p._id as ObjectId)?.toString(),
        name: p.name,
        mainImage: p.mainImage,
        shortDescription: p.shortDescription,
        sellingPrice: p.sellingPrice,
        quantity: p.quantity,
        status: p.status,
        updatedAt: p.updatedAt,
      },
    });
  } catch (e) {
    console.error('[Retailer My Products] PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
