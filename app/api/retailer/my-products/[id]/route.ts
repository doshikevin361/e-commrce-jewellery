import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { findRetailerCommissionFromRows } from '@/lib/retailer-commission';
import { requireSubscriptionOr403 } from '@/lib/subscription-access';

/** Return name for a given id from a collection, or the original value if not an id / not found. */
async function resolveIdToName(
  db: { collection: (n: string) => { findOne: (q: object) => Promise<{ name?: string } | null> } },
  collection: string,
  value: unknown
): Promise<string> {
  if (value == null) return '';
  const str = value instanceof ObjectId ? value.toString() : String(value).trim();
  if (str === '') return '';
  if (!ObjectId.isValid(str) || str.length !== 24) return str;
  try {
    const doc = await db.collection(collection).findOne({ _id: new ObjectId(str) });
    return (doc?.name as string) ?? str;
  } catch {
    return str;
  }
}

function trimStr(v: unknown): string {
  return (v != null ? String(v) : '').trim();
}

/**
 * GET - Fetch single retailer product for edit page.
 * Resolves category, designType, goldPurity, silverPurity, metalColour from id to name when stored as id.
 * When product_type or category is missing (e.g. older retailer_products), enriches from source product
 * so dropdowns on the edit form show the correct selection.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    const product = await db.collection('retailer_products').findOne({
      _id: new ObjectId(id),
      retailerId: new ObjectId(retailer.id),
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not yours' }, { status: 404 });
    }

    const p = product as Record<string, unknown> & { retailerId?: ObjectId; _id: ObjectId; sourceProductId?: ObjectId; category?: string };
    const retailerIdObj = new ObjectId(retailer.id);

    let product_type = trimStr(p.product_type);
    let categoryRaw: unknown = p.category;
    let designTypeRaw: unknown = p.designType;
    let goldPurityRaw: unknown = p.goldPurity;
    let silverPurityRaw: unknown = p.silverPurity;
    let metalColourRaw: unknown = p.metalColour;

    let weightOut: number = typeof p.weight === 'number' && p.weight > 0 ? p.weight : 0;
    if (p.sourceProductId) {
      const sourceId = p.sourceProductId instanceof ObjectId ? p.sourceProductId : new ObjectId(String(p.sourceProductId));
      const source = await db.collection('products').findOne(
        { _id: sourceId },
        { projection: { product_type: 1, category: 1, designType: 1, goldPurity: 1, silverPurity: 1, metalColour: 1, weight: 1, goldWeight: 1, netGoldWeight: 1 } }
      );
      if (source) {
        const src = source as Record<string, unknown>;
        if (!product_type) product_type = trimStr(src.product_type);
        if (categoryRaw == null || trimStr(categoryRaw) === '') categoryRaw = src.category;
        if (designTypeRaw == null || trimStr(designTypeRaw) === '') designTypeRaw = src.designType;
        if (goldPurityRaw == null || trimStr(goldPurityRaw) === '') goldPurityRaw = src.goldPurity;
        if (silverPurityRaw == null || trimStr(silverPurityRaw) === '') silverPurityRaw = src.silverPurity;
        if (metalColourRaw == null || trimStr(metalColourRaw) === '') metalColourRaw = src.metalColour;
        if (weightOut <= 0) {
          const srcWeight = Number(src.weight ?? src.goldWeight ?? src.netGoldWeight ?? 0);
          if (srcWeight > 0) weightOut = srcWeight;
        }
      }
    }

    const currentCategory = trimStr(categoryRaw);

    const looksLikeObjectId = (s: string) => /^[a-fA-F0-9]{24}$/.test(String(s).trim());

    let designTypeOut = trimStr(designTypeRaw);
    if (designTypeOut && looksLikeObjectId(designTypeOut)) {
      try {
        const dt = await db.collection('design_types').findOne(
          { _id: new ObjectId(designTypeOut) },
          { projection: { name: 1 } }
        );
        if (dt && (dt as Record<string, unknown>).name) designTypeOut = (dt as Record<string, string>).name;
      } catch (_) {}
    }

    let goldPurityOut = trimStr(goldPurityRaw);
    if (goldPurityOut && looksLikeObjectId(goldPurityOut)) {
      try {
        const k = await db.collection('karats').findOne({ _id: new ObjectId(goldPurityOut) }, { projection: { name: 1 } });
        if (k && (k as Record<string, unknown>).name) goldPurityOut = (k as Record<string, string>).name;
      } catch (_) {}
    }

    let silverPurityOut = trimStr(silverPurityRaw);
    if (silverPurityOut && looksLikeObjectId(silverPurityOut)) {
      try {
        const pr = await db.collection('purities').findOne({ _id: new ObjectId(silverPurityOut) }, { projection: { name: 1 } });
        if (pr && (pr as Record<string, unknown>).name) silverPurityOut = (pr as Record<string, string>).name;
      } catch (_) {}
    }

    let metalColourOut = trimStr(metalColourRaw);
    if (metalColourOut && looksLikeObjectId(metalColourOut)) {
      try {
        const mc = await db.collection('metal_colors').findOne(
          { _id: new ObjectId(metalColourOut) },
          { projection: { name: 1 } }
        );
        if (mc && (mc as Record<string, unknown>).name) metalColourOut = (mc as Record<string, string>).name;
      } catch (_) {}
    }

    let categoryOut = currentCategory;
    if (categoryOut && looksLikeObjectId(categoryOut)) {
      try {
        const cat = await db.collection('categories').findOne({ _id: new ObjectId(categoryOut) }, { projection: { name: 1 } });
        if (cat && (cat as Record<string, unknown>).name) categoryOut = (cat as Record<string, string>).name;
      } catch (_) {}
    }

    const rawGender = Array.isArray(p.gender) ? p.gender : [];
    const genderMap: Record<string, string> = { Female: 'Women', Male: 'Man', Women: 'Women', Man: 'Man', Unisex: 'Unisex' };
    const allowedGender = new Set(['Man', 'Women', 'Unisex']);
    const genderOut = rawGender
      .map((g: unknown) => genderMap[String(g).trim()] || String(g).trim())
      .filter((g: string) => allowedGender.has(g));

    const storedRelatedIds: string[] = [];
    if (Array.isArray(p.relatedProducts)) {
      for (const x of p.relatedProducts as unknown[]) {
        const str = typeof x === 'string' ? x : x instanceof ObjectId ? x.toString() : null;
        if (str && ObjectId.isValid(str)) storedRelatedIds.push(str);
      }
    }
    let relatedList: Array<Record<string, unknown>> = [];
    try {
      const statusOr = [{ status: 'active' }, { status: { $exists: false } }];
      if (storedRelatedIds.length > 0) {
        const ids = storedRelatedIds.map((x) => new ObjectId(x));
        const resolved = await db
          .collection('retailer_products')
          .find({ _id: { $in: ids }, retailerId: retailerIdObj, $or: statusOr })
          .project({ _id: 1, name: 1, mainImage: 1, sellingPrice: 1, quantity: 1, category: 1 })
          .toArray();
        relatedList = (resolved || []).map((r: Record<string, unknown>) => ({
          _id: r._id instanceof ObjectId ? r._id.toString() : String(r._id ?? ''),
          name: r.name ?? '',
          mainImage: r.mainImage ?? '',
          sellingPrice: r.sellingPrice ?? 0,
          quantity: r.quantity ?? 0,
          category: r.category ?? '',
        }));
      } else if (currentCategory) {
        const sameCategory = await db
          .collection('retailer_products')
          .find({
            retailerId: retailerIdObj,
            _id: { $ne: new ObjectId(id) },
            $or: statusOr,
            category: currentCategory,
          })
          .project({ _id: 1, name: 1, mainImage: 1, sellingPrice: 1, quantity: 1, category: 1 })
          .limit(8)
          .toArray();
        relatedList = (sameCategory || []).map((r: Record<string, unknown>) => ({
          _id: r._id instanceof ObjectId ? r._id.toString() : String(r._id ?? ''),
          name: r.name ?? '',
          mainImage: r.mainImage ?? '',
          sellingPrice: r.sellingPrice ?? 0,
          quantity: r.quantity ?? 0,
          category: r.category ?? '',
        }));
      }
    } catch (_relatedErr) {
      relatedList = [];
    }

    const mainImageVal = trimStr(p.mainImage);
    const metalTypeVal = product_type || trimStr(p.metalType);

    const sellingPriceOut: number = typeof p.sellingPrice === 'number' && p.sellingPrice >= 0 ? p.sellingPrice : 0;

    const retailerDoc = await db.collection('retailers').findOne(
      { _id: retailerIdObj },
      { projection: { retailerCommissionRows: 1 } }
    );
    const commissionRows = Array.isArray((retailerDoc as { retailerCommissionRows?: unknown[] })?.retailerCommissionRows)
      ? (retailerDoc as { retailerCommissionRows: { productType?: string; category?: string; designType?: string; metal?: string; purityKarat?: string; retailerCommission?: number }[] }).retailerCommissionRows
      : [];
    const metalForMatch = product_type === 'Gold' || product_type === 'Silver' || product_type === 'Platinum' ? product_type : '';
    const purityForMatch = goldPurityOut || silverPurityOut || '';
    const fromRules = findRetailerCommissionFromRows(
      commissionRows,
      product_type,
      categoryOut || '',
      designTypeOut,
      metalForMatch,
      purityForMatch
    );
    const storedRate = typeof p.retailerCommissionRate === 'number' ? p.retailerCommissionRate : null;
    const effectiveCommissionRate = fromRules > 0 ? fromRules : (storedRate !== null ? storedRate : 0);

    const out: Record<string, unknown> = {
      _id: (p._id as ObjectId).toString(),
      name: trimStr(p.name),
      mainImage: mainImageVal,
      shortDescription: trimStr(p.shortDescription),
      description: trimStr(p.description) || trimStr(p.shortDescription),
      shopName: trimStr(p.shopName),
      sellingPrice: sellingPriceOut,
      quantity: p.quantity ?? 0,
      status: p.status ?? 'active',
      retailerCommissionRate: effectiveCommissionRate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: categoryOut,
      product_type: product_type,
      designType: designTypeOut,
      metalType: metalTypeVal,
      goldPurity: goldPurityOut,
      silverPurity: silverPurityOut,
      metalColour: metalColourOut,
      weight: weightOut,
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
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('[Retailer My Products] GET error:', err.message, err.stack);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: process.env.NODE_ENV === 'development' ? err.message : undefined },
      { status: 500 }
    );
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
    const subErr = await requireSubscriptionOr403(request, 'retailer');
    if (subErr) return subErr;

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
