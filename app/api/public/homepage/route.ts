import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getActiveHomepageFeatures } from '@/lib/constants/features';
import { calculateProductPrice } from '@/lib/utils/price-calculator';
import { ObjectId } from 'mongodb';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80';
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80';
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85';

// Only essential fields for customer display
const PRODUCT_PROJECTION = {
  _id: 1,
  name: 1,
  category: 1,
  mainImage: 1,
  regularPrice: 1,
  sellingPrice: 1,
  price: 1,
  subTotal: 1,
  totalAmount: 1,
  discount: 1, // Discount percentage
  featured: 1,
  trending: 1,
  urlSlug: 1,
  rating: 1,
  reviewCount: 1,
};

const serializeProduct = (product: any, fallbackIndex = 0, categoryMap?: Map<string, string>) => {
  const id = product?._id?.toString() ?? `product-${fallbackIndex}`;
  const { sellingPrice, regularPrice } = calculateProductPrice(product);

  // Resolve category name if category is an ObjectId
  let categoryName = product?.category ?? 'Jewellery';
  if (product?.category) {
    // Check if category is an ObjectId (string or ObjectId instance)
    const categoryValue = product.category;
    const categoryIdStr = typeof categoryValue === 'string' ? categoryValue : categoryValue?.toString();
    
    if (categoryIdStr && ObjectId.isValid(categoryIdStr)) {
      // It's an ObjectId, look up the category name
      categoryName = categoryMap?.get(categoryIdStr) || categoryName;
    } else if (typeof categoryValue === 'string') {
      // It's already a string (category name), use it directly
      categoryName = categoryValue;
    }
  }

  // Get base price from various fields
  const basePrice = product?.price > 0 
    ? product.price 
    : (product?.subTotal > 0 ? product.subTotal : (product?.totalAmount > 0 ? product.totalAmount : 0));
  
  // Determine original price (regularPrice or basePrice)
  const originalPrice = regularPrice > 0 
    ? regularPrice 
    : (sellingPrice > 0 ? sellingPrice : basePrice);

  // Apply discount if discount percentage is set
  const discountPercent = typeof product?.discount === 'number' && product.discount > 0 && product.discount <= 100
    ? product.discount
    : 0;
  
  // Calculate final prices: regularPrice is original, sellingPrice is after discount
  const finalRegularPrice = originalPrice;
  const finalSellingPrice = discountPercent > 0 && originalPrice > 0
    ? Math.max(0, Math.round(originalPrice * (1 - discountPercent / 100)))
    : (sellingPrice > 0 ? sellingPrice : originalPrice);

  // Only return fields needed for customer display
  return {
    _id: id,
    name: product?.name || product?.title || 'Untitled Product',
    category: categoryName,
    sellingPrice: finalSellingPrice,
    regularPrice: finalRegularPrice,
    discount: discountPercent,
    mainImage: product?.mainImage || DEFAULT_IMAGE,
    badge: product?.featured ? 'Featured' : product?.trending ? 'Trending' : undefined,
    urlSlug: product?.urlSlug || id,
    rating: product?.rating,
    reviewCount: product?.reviewCount,
  };
};

const serializeBanner = (banner: any, index: number) => ({
  _id: banner?._id?.toString() ?? `banner-${index}`,
  title: banner?.title ?? 'Discover Timeless Pieces',
  subtitle: banner?.subtitle ?? '',
  description: banner?.description ?? '',
  buttonText: banner?.buttonText ?? 'Shop Now',
  image: banner?.image || DEFAULT_BANNER_IMAGE,
  link: banner?.link || '/products',
  backgroundColor: banner?.backgroundColor || '#000000',
  displayOrder: typeof banner?.displayOrder === 'number' ? banner.displayOrder : index,
});

const serializeCategory = (category: any, index: number) => ({
  _id: category?._id?.toString() ?? `category-${index}`,
  name: category?.name ?? 'Jewellery',
  slug: category?.slug ?? '',
  image: category?.image || DEFAULT_CATEGORY_IMAGE,
});

const safeQuery = async <T>(promise: Promise<T>, label: string, fallback: T) => {
  try {
    return await promise;
  } catch (error) {
    console.error(`[v0] Failed to fetch ${label}:`, error);
    return fallback;
  }
};

// Cache for 60 seconds, revalidate in background
export const revalidate = 60;
export const dynamic = 'force-dynamic'; // Allow dynamic rendering with caching

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const requestUrl = request.url;

    const bannersPromise = db
      .collection('homepage_banners')
      .find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(10)
      .project({
        _id: 1,
        title: 1,
        subtitle: 1,
        description: 1,
        image: 1,
        link: 1,
        buttonText: 1,
        backgroundColor: 1,
        displayOrder: 1,
      })
      .toArray();

    // Optimized categories query - removed expensive lookup, count separately if needed
    const categoriesPromise = db
      .collection('categories')
      .find({ status: 'active' })
      .sort({ featured: -1, createdAt: -1 })
      .limit(20)
      .project({
            _id: 1,
            name: 1,
            slug: 1,
            image: 1,
            featured: 1,
      })
      .toArray();

    const productsCollection = db.collection('products');
    const baseProductFilter = { status: 'active', stock: { $gt: 0 } };

    const featuredProductsPromise = productsCollection
      .find({ ...baseProductFilter, featured: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .project(PRODUCT_PROJECTION)
      .toArray();

    const trendingProductsPromise = productsCollection
      .find({ ...baseProductFilter, trending: true })
      .sort({ trending: -1, views: -1, createdAt: -1 })
      .limit(12)
      .project(PRODUCT_PROJECTION)
      .toArray();

    const newProductsPromise = productsCollection
      .find(baseProductFilter)
      .sort({ createdAt: -1 })
      .limit(12)
      .project(PRODUCT_PROJECTION)
      .toArray();

    const dazzlePromise = db
      .collection('homepage_dazzle')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(10)
      .project({
        _id: 1,
        title: 1,
        subtitle: 1,
        description: 1,
        buttonText: 1,
        buttonLink: 1,
        image: 1,
      })
      .toArray();

    const galleryPromise = db
      .collection('homepage_gallery')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(20)
      .project({
        _id: 1,
        image: 1,
      })
      .toArray();

    const newsPromise = db
      .collection('blog_posts')
      .find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .project({
        _id: 1,
        title: 1,
        excerpt: 1,
        featuredImage: 1,
        publishedAt: 1,
        createdAt: 1,
        slug: 1,
      })
      .toArray();

    const newArrivalsBannerPromise = db
      .collection('homepage_new_arrivals_banner')
      .findOne(
        {},
        {
          projection: {
            title: 1,
            subtitle: 1,
            badgeText: 1,
            description: 1,
            backgroundImage: 1,
          },
        }
      );

    const newArrivalsCardsPromise = db
      .collection('homepage_new_arrivals_cards')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(10)
      .project({
        _id: 1,
        title: 1,
        image: 1,
        type: 1,
      })
      .toArray();

    const [rawBanners, rawCategories, rawFeatured, rawTrending, rawNew, rawDazzle, rawGallery, rawNews, rawNewArrivalsBanner, rawNewArrivalsCards] = await Promise.all([
      safeQuery(bannersPromise, 'homepage banners', [] as any[]),
      safeQuery(categoriesPromise, 'homepage categories', [] as any[]),
      safeQuery(featuredProductsPromise, 'featured products', [] as any[]),
      safeQuery(trendingProductsPromise, 'trending products', [] as any[]),
      safeQuery(newProductsPromise, 'new products', [] as any[]),
      safeQuery(dazzlePromise, 'dazzle section', [] as any[]),
      safeQuery(galleryPromise, 'gallery items', [] as any[]),
      safeQuery(newsPromise, 'news items', [] as any[]),
      safeQuery(newArrivalsBannerPromise, 'new arrivals banner', null),
      safeQuery(newArrivalsCardsPromise, 'new arrivals cards', [] as any[]),
    ]);

    // Build category map for resolving category IDs to names
    const categoryMap = new Map<string, string>();
    rawCategories.forEach((cat: any) => {
      const catId = cat._id?.toString();
      if (catId && cat.name) {
        categoryMap.set(catId, cat.name);
      }
    });

    // Also fetch all categories by ID to handle cases where products reference categories by ObjectId
    const allProductCategories = [
      ...rawFeatured.map((p: any) => p?.category).filter(Boolean),
      ...rawTrending.map((p: any) => p?.category).filter(Boolean),
      ...rawNew.map((p: any) => p?.category).filter(Boolean),
    ];
    
    // Extract unique category IDs that are ObjectIds
    const categoryIds = new Set<string>();
    allProductCategories.forEach((cat: any) => {
      const catIdStr = typeof cat === 'string' ? cat : cat?.toString();
      if (catIdStr && ObjectId.isValid(catIdStr)) {
        categoryIds.add(catIdStr);
      }
    });

    // Fetch categories by ID if we have any ObjectId references
    if (categoryIds.size > 0) {
      const categoryObjectIds = Array.from(categoryIds).map(id => new ObjectId(id));
      const categoriesById = await safeQuery(
        db.collection('categories')
          .find({ _id: { $in: categoryObjectIds } })
          .project({ _id: 1, name: 1 })
          .toArray(),
        'categories by ID',
        [] as any[]
      );
      
      categoriesById.forEach((cat: any) => {
        const catId = cat._id?.toString();
        if (catId && cat.name) {
          categoryMap.set(catId, cat.name);
        }
      });
    }

    const serializeDazzleCard = (card: any, index: number) => ({
      _id: card?._id?.toString() ?? `dazzle-${index}`,
      title: card?.title || '',
      subtitle: card?.subtitle || '',
      description: card?.description || '',
      buttonText: card?.buttonText || 'Explore More',
      buttonLink: card?.buttonLink || '/products',
      image: card?.image || '',
    });

    const serializeGalleryItem = (item: any, index: number) => ({
      _id: item?._id?.toString() ?? `gallery-${index}`,
      image: item?.image || '',
    });

    const serializeNewsItem = (item: any, index: number) => ({
      _id: item?._id?.toString() ?? `news-${index}`,
      title: item?.title || 'Untitled',
      excerpt: item?.excerpt || '',
      image: item?.featuredImage || '',
      publishDate: item?.publishedAt ? new Date(item.publishedAt).toISOString() : item?.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      slug: item?.slug || '',
    });

    const serializeNewArrivalsBanner = (banner: any) => {
      if (!banner) return null;
      return {
        title: banner.title || 'New Arrivals',
        subtitle: banner.subtitle || banner.badgeText || '💎 500+ New Items',
        description: banner.description || '',
        backgroundImage: banner.backgroundImage || '',
      };
    };

    const serializeNewArrivalsCard = (card: any, index: number) => ({
      _id: card?._id?.toString() ?? `new-arrivals-card-${index}`,
      title: card?.title || '',
      image: card?.image || '',
      type: card?.type || 'card',
    });

    const sections = [
      {
        type: 'hero',
        order: 1,
        data: {
          banners: rawBanners.map((banner, index) => serializeBanner(banner, index)),
        },
      },
      {
        type: 'categories',
        order: 2,
        data: {
          categories: rawCategories.map(serializeCategory),
        },
      },
      {
        type: 'newProducts',
        order: 3,
        data: {
          products: rawNew.map((product, index) => serializeProduct(product, index, categoryMap)),
        },
      },
      {
        type: 'featuredProducts',
        order: 4,
        data: {
          products: rawFeatured.map((product, index) => ({
            ...serializeProduct(product, index, categoryMap),
            badge: 'Featured',
          })),
        },
      },
      {
        type: 'trendingProducts',
        order: 5,
        data: {
          products: rawTrending.map((product, index) => ({
            ...serializeProduct(product, index, categoryMap),
            badge: 'Trending',
          })),
        },
      },
      {
        type: 'dazzle',
        order: 6,
        data: {
          cards: Array.isArray(rawDazzle) ? rawDazzle.map(serializeDazzleCard) : [],
        },
      },
      {
        type: 'gallery',
        order: 7,
        data: {
          items: Array.isArray(rawGallery) ? rawGallery.map(serializeGalleryItem) : [],
        },
      },
      {
        type: 'news',
        order: 8,
        data: {
          items: Array.isArray(rawNews) ? rawNews.map(serializeNewsItem) : [],
        },
      },
      {
        type: 'newArrivals',
        order: 9,
        data: {
          banner: serializeNewArrivalsBanner(rawNewArrivalsBanner),
          cards: Array.isArray(rawNewArrivalsCards) ? rawNewArrivalsCards.map(serializeNewArrivalsCard) : [],
        },
      },
      {
        type: 'features',
        order: 10,
        data: {
          features: getActiveHomepageFeatures(),
        },
      },
    ];

    const response = NextResponse.json({
      sections,
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('[v0] Failed to fetch homepage data:', error);
    return NextResponse.json(
      {
        sections: [],
        error: 'Failed to fetch homepage data',
      },
      { status: 500 }
    );
  }
}

