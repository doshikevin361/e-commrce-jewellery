import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin, isAdminOrVendor } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { calculateAdminProductPrice } from '@/lib/utils/admin-price-calculator';

const DEFAULT_SETTINGS = {
  siteName: 'Grocify Admin',
  siteTitle: 'Grocify – Admin Panel',
  tagline: '',
  primaryColor: '#16a34a',
  accentColor: '#0f172a',
  logo: '',
  favicon: '',
  productType: true,
  productTypeCommissions: {
    Gold: 5,
    Silver: 4,
    Platinum: 6,
    Gemstone: 8,
    Diamonds: 10,
    Imitation: 3,
  },
};

function normalizeSettings(doc: any = {}) {
  return {
    siteName: doc.siteName ?? DEFAULT_SETTINGS.siteName,
    siteTitle: doc.siteTitle ?? DEFAULT_SETTINGS.siteTitle,
    tagline: doc.tagline ?? DEFAULT_SETTINGS.tagline,
    primaryColor: doc.primaryColor ?? DEFAULT_SETTINGS.primaryColor,
    accentColor: doc.accentColor ?? DEFAULT_SETTINGS.accentColor,
    logo: doc.logo ?? DEFAULT_SETTINGS.logo,
    favicon: doc.favicon ?? DEFAULT_SETTINGS.favicon,
    productType: doc.productType ?? DEFAULT_SETTINGS.productType,
    productTypeCommissions: doc.productTypeCommissions ?? DEFAULT_SETTINGS.productTypeCommissions,
    updatedAt: doc.updatedAt ?? null,
    createdAt: doc.createdAt ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdminOrVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});

    return NextResponse.json(normalizeSettings(settings));
  } catch (error) {
    console.error('[v0] Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const existingSettings = await db.collection('settings').findOne({});
    const body = await request.json();

    const siteName = (body.siteName || '').trim();
    const siteTitle = (body.siteTitle || '').trim();
    const tagline = (body.tagline || '').trim();
    const primaryColor = (body.primaryColor || DEFAULT_SETTINGS.primaryColor).trim();
    const accentColor = (body.accentColor || DEFAULT_SETTINGS.accentColor).trim();
    const logo = body.logo || '';
    const favicon = body.favicon || '';
    const productType = body.productType ?? DEFAULT_SETTINGS.productType;
    const incomingCommissions =
      body.productTypeCommissions ?? DEFAULT_SETTINGS.productTypeCommissions;
    const productTypeCommissions = {
      ...DEFAULT_SETTINGS.productTypeCommissions,
      ...incomingCommissions,
    };

    if (!siteName) {
      return NextResponse.json({ error: 'Website name is required' }, { status: 400 });
    }
    if (!siteTitle) {
      return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
    }

    const now = new Date();

    const result = await db.collection('settings').findOneAndUpdate(
      {},
      {
        $set: {
          siteName,
          siteTitle,
          tagline,
          primaryColor,
          accentColor,
          logo,
          favicon,
          productType,
          productTypeCommissions,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    const previousCommissions = {
      ...DEFAULT_SETTINGS.productTypeCommissions,
      ...(existingSettings?.productTypeCommissions ?? {}),
    };
    const commissionKeys = Object.keys(DEFAULT_SETTINGS.productTypeCommissions);
    const changedTypes = commissionKeys.filter(
      (key) => previousCommissions[key] !== productTypeCommissions[key]
    );

    if (changedTypes.length > 0) {
      const changedTypeVariants = Array.from(
        new Set([
          ...changedTypes,
          ...changedTypes.map((type) => type.toLowerCase()),
        ])
      );
      const products = await db
        .collection('products')
        .find({
          $or: [
            { productType: { $in: changedTypeVariants } },
            { product_type: { $in: changedTypeVariants } },
          ],
        })
        .toArray();

      const updatePromises = products.map(async (product: any) => {
        const rawProductType = product.productType || product.product_type;
        const normalizedType =
          typeof rawProductType === 'string'
            ? rawProductType.charAt(0).toUpperCase() +
              rawProductType.slice(1).toLowerCase()
            : rawProductType;
        if (
          !normalizedType ||
          productTypeCommissions[normalizedType] === undefined
        ) {
          return;
        }

        const platformCommissionRate =
          productTypeCommissions[normalizedType] ?? 0;
        const newPrice = calculateAdminProductPrice(product, {
          platformCommissionRate,
        });

        await db.collection('products').updateOne(
          { _id: product._id },
          {
            $set: {
              platformCommissionRate,
              price: newPrice,
              subTotal: newPrice,
              totalAmount: newPrice,
              updatedAt: new Date(),
            },
          }
        );
      });

      await Promise.all(updatePromises);

      try {
        revalidatePath('/');
        revalidatePath('/api/public/homepage');
        revalidateTag('products', 'max');
        revalidateTag('homepage', 'max');
        console.log('[v0] Cache revalidated for commission update');
      } catch (error) {
        console.error('[v0] Failed to revalidate cache:', error);
      }
    }

    // If result.value is null (shouldn't happen with upsert, but just in case),
    // fetch the document again to ensure we return the updated data
    let updatedDoc = result?.value;
    if (!updatedDoc) {
      updatedDoc = await db.collection('settings').findOne({});
    }

    return NextResponse.json(normalizeSettings(updatedDoc || {}));
  } catch (error) {
    console.error('[v0] Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

