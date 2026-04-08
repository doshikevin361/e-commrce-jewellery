import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getRetailerFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { formatProductPrice } from '@/lib/utils/price-calculator';
import {
  buildCommissionDisplay,
  productNetWeightGrams,
  type CommissionComboRow,
  type VendorCommissionRow,
} from '@/lib/commission-display';

const PRODUCT_TYPES = ['Gold', 'Silver', 'Platinum', 'Diamonds', 'Gemstone', 'Imitation'];

function getRetailerCommissionAndPrice(
  vendor: { b2bProductTypeCommissions?: Record<string, number>; b2bCommissionRows?: Array<{ productType: string; category: string; designType: string; metal: string; purityKarat: string; vendorCommission: number }> } | null,
  product: { product_type?: string; category?: unknown; designType?: string; goldPurity?: string; silverPurity?: string },
  categoryName: string | null
): { percent: number; retailerPrice: number } {
  const priceData = formatProductPrice(product);
  const basePrice = Number(priceData.displayPrice) || Number(priceData.sellingPrice) || Number(priceData.regularPrice) || 0;
  if (!vendor) return { percent: 0, retailerPrice: basePrice };
  const productType = (product.product_type || '').trim();
  const ptCommissions = vendor.b2bProductTypeCommissions;
  const rows = vendor.b2bCommissionRows;
  let percent = 0;
  if (Array.isArray(rows) && rows.length > 0) {
    const designType = (product.designType || '').trim();
    const metal = productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
    const purity = (product.goldPurity || product.silverPurity || '').trim();
    const catMatch = categoryName ? categoryName.trim() : '';
    const norm = (s: string) => s.toLowerCase().trim();
    for (const row of rows) {
      const ptMatch = norm(row.productType) === norm(productType);
      const catOk = !row.category || norm(String(row.category)) === norm(catMatch);
      const designOk = !row.designType || norm(row.designType) === norm(designType);
      const metalOk = !row.metal || norm(row.metal) === norm(metal);
      const purityOk = !row.purityKarat || norm(row.purityKarat) === norm(purity);
      if (ptMatch && catOk && designOk && metalOk && purityOk && typeof row.vendorCommission === 'number') {
        percent = Math.max(0, Math.min(100, row.vendorCommission));
        break;
      }
    }
  }
  if (percent === 0 && ptCommissions && productType && typeof ptCommissions[productType] === 'number') {
    percent = Math.max(0, Math.min(100, ptCommissions[productType]));
  }
  const retailerPrice = percent > 0 && basePrice > 0 ? Math.round(basePrice * (1 - percent / 100)) : basePrice;
  return { percent, retailerPrice };
}

function resolveLookupName(
  raw: unknown,
  mapById: Map<string, string>
): string {
  if (raw == null || raw === '') return '';
  const id = raw instanceof ObjectId ? raw.toString() : String(raw);
  const fromMap = mapById.get(id);
  if (fromMap) return fromMap;
  return id;
}

function normalizeCategoryId(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return (value as { _id: ObjectId })._id.toString();
  return null;
}

/** GET: List active products for B2B retailer catalog. No vendor identity. Category/type filters, pagination, retailer price (B2B discount). */
export async function GET(request: NextRequest) {
  try {
    const retailer = getRetailerFromRequest(request);
    if (!retailer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim() || '';
    const type = searchParams.get('type')?.trim() || '';
    const designType = searchParams.get('designType')?.trim() || '';
    const metalColour = searchParams.get('metalColour')?.trim() || '';
    const gender = searchParams.get('gender')?.trim() || '';
    const karat = searchParams.get('karat')?.trim() || '';
    const search = searchParams.get('search')?.trim() || '';
    const limit = Math.min(100, Math.max(8, parseInt(searchParams.get('limit') || '24', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { status: 'active' };

    if (category && category !== 'all') {
      if (ObjectId.isValid(category)) {
        query.$or = [{ category: new ObjectId(category) }, { category }];
      } else {
        query.category = category;
      }
    }

    if (type && type !== 'all' && PRODUCT_TYPES.includes(type)) {
      query.product_type = type;
    }

    if (designType && designType !== 'all') {
      if (ObjectId.isValid(designType)) {
        query.$and = query.$and || [];
        (query.$and as unknown[]).push({ $or: [{ designType: new ObjectId(designType) }, { designType }] });
      } else {
        query.designType = designType;
      }
    }

    if (metalColour && metalColour !== 'all') {
      if (ObjectId.isValid(metalColour)) {
        query.$and = query.$and || [];
        (query.$and as unknown[]).push({ $or: [{ metalColour: new ObjectId(metalColour) }, { metalColour }] });
      } else {
        query.metalColour = metalColour;
      }
    }

    if (gender && gender !== 'all') {
      query.$and = query.$and || [];
      (query.$and as unknown[]).push({
        $or: [{ gender: gender }, { gender: { $in: [gender] } }],
      });
    }

    if (karat && karat !== 'all') {
      query.$and = query.$and || [];
      const karatConditions = [{ goldPurity: karat }, { silverPurity: karat }];
      if (ObjectId.isValid(karat)) {
        karatConditions.push({ goldPurity: new ObjectId(karat) }, { silverPurity: new ObjectId(karat) });
      }
      (query.$and as unknown[]).push({ $or: karatConditions });
    }

    if (search) {
      query.$and = query.$and || [];
      (query.$and as unknown[]).push({
        $or: [
          { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
          { sku: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        ],
      });
    }

    const [products, total, designTypes, metalColors, karats] = await Promise.all([
      db.collection('products').find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('products').countDocuments(query),
      db.collection('design_types').find({}).sort({ displayOrder: 1, name: 1 }).project({ _id: 1, name: 1 }).toArray(),
      db.collection('metal_colors').find({}).sort({ displayOrder: 1, name: 1 }).project({ _id: 1, name: 1 }).toArray(),
      db.collection('karats').find({}).sort({ displayOrder: 1, name: 1 }).project({ _id: 1, name: 1 }).toArray(),
    ]);

    const categoryIds = [...new Set(products.map((p: { category?: unknown }) => normalizeCategoryId(p.category)).filter(Boolean))] as string[];
    const vendorIds = [...new Set(products.map((p: { vendorId?: unknown }) => (p.vendorId instanceof ObjectId ? p.vendorId.toString() : p.vendorId)).filter(Boolean))] as string[];

    const [categories, vendorsList, settingsDoc] = await Promise.all([
      categoryIds.length > 0
        ? db.collection('categories').find({ _id: { $in: categoryIds.map((id) => new ObjectId(id)) } }).project({ name: 1 }).toArray()
        : [],
      vendorIds.length > 0
        ? db
            .collection('vendors')
            .find({ _id: { $in: vendorIds.map((id) => new ObjectId(id)) } })
            .project({
              _id: 1,
              b2bProductTypeCommissions: 1,
              b2bCommissionRows: 1,
              commissionRows: 1,
              productTypeCommissions: 1,
            })
            .toArray()
        : [],
      db.collection('settings').findOne({}, { projection: { commissionRows: 1 } }),
    ]);

    const categoryMap = new Map(categories.map((c: { _id: ObjectId; name: string }) => [c._id.toString(), c.name]));
    const vendorMap = new Map(vendorsList.map((v: { _id: ObjectId }) => [v._id.toString(), v]));
    const adminCommissionRows = Array.isArray(settingsDoc?.commissionRows) ? settingsDoc.commissionRows : [];

    const designTypeMap = new Map(designTypes.map((d: { _id: ObjectId; name: string }) => [d._id.toString(), d.name || '']));
    const metalColourMap = new Map(metalColors.map((m: { _id: ObjectId; name: string }) => [m._id.toString(), m.name || '']));

    const list = products.map((product: Record<string, unknown> & { vendorId?: ObjectId; product_type?: string; designType?: string; goldPurity?: string; silverPurity?: string }) => {
      const priceData = formatProductPrice(product);
      const categoryId = normalizeCategoryId(product.category);
      const categoryName = categoryId ? categoryMap.get(categoryId) : null;
      const vendor = product.vendorId ? vendorMap.get((product.vendorId instanceof ObjectId ? product.vendorId : product.vendorId).toString()) : null;
      const { percent, retailerPrice } = getRetailerCommissionAndPrice(vendor ?? null, product, categoryName ?? null);
      const basePrice = Number(priceData.displayPrice) || Number(priceData.sellingPrice) || Number(priceData.regularPrice) || 0;

      const productType = String(product.product_type || '');
      const designTypeResolved = resolveLookupName(product.designType, designTypeMap);
      const metalColourResolved = resolveLookupName(
        (product as { metalColour?: unknown }).metalColour,
        metalColourMap
      );
      const purityForCommission = String(product.goldPurity || product.silverPurity || '').trim();
      const metal =
        productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
      const vendorRows = vendor && Array.isArray((vendor as { commissionRows?: VendorCommissionRow[] }).commissionRows)
        ? (vendor as { commissionRows: VendorCommissionRow[] }).commissionRows
        : undefined;
      const vendorPtComm = (vendor as { productTypeCommissions?: Record<string, number> } | null)?.productTypeCommissions;

      const commission = buildCommissionDisplay(
        purityForCommission || undefined,
        adminCommissionRows as CommissionComboRow[],
        vendorRows,
        vendorPtComm,
        productType,
        categoryName ?? '',
        designTypeResolved,
        metal,
        purityForCommission
      );

      const weightG = productNetWeightGrams(
        product as {
          jewelleryWeight?: number;
          metalWeight?: number;
          goldWeight?: number;
          silverWeight?: number;
          hasGold?: boolean;
          hasSilver?: boolean;
        }
      );

      return {
        _id: (product._id as ObjectId).toString(),
        name: product.name,
        sku: product.sku,
        categoryId: categoryId || product.category,
        categoryName: categoryName ?? categoryId ?? product.category,
        product_type: product.product_type,
        designType: designTypeResolved || product.designType || '',
        metalColour: metalColourResolved || String((product as { metalColour?: string }).metalColour || ''),
        purityLabel: purityForCommission,
        weightGrams: weightG,
        size: (product.size as string) || '',
        retailerPrice,
        originalPrice: basePrice,
        retailerDiscountPercent: percent,
        stock: product.stock ?? 0,
        status: product.status,
        mainImage: product.mainImage || product.image || '',
        urlSlug: product.urlSlug,
        commissionLabelFull: commission.commissionLabelFull,
        commissionLabelCompact: commission.commissionLabelCompact,
        adminCommissionPercent: commission.adminCommissionPercent,
        vendorCommissionPercent: commission.vendorCommissionPercent,
        purityDisplay: commission.purityDisplay,
      };
    });

    const GENDERS = ['Women', 'Man', 'Unisex'];
    return NextResponse.json({
      products: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      productTypes: PRODUCT_TYPES,
      filterOptions: {
        designTypes: designTypes.map((d: { _id: ObjectId; name: string }) => ({ _id: d._id.toString(), name: d.name || '' })),
        metalColors: metalColors.map((m: { _id: ObjectId; name: string }) => ({ _id: m._id.toString(), name: m.name || '' })),
        genders: GENDERS,
        karats: karats.map((k: { _id: ObjectId; name: string }) => ({ _id: k._id.toString(), name: k.name || '' })),
      },
    });
  } catch (error) {
    console.error('[Retailer] Products list error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
