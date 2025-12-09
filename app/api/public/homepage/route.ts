import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getActiveHomepageFeatures } from '@/lib/constants/features';
import { getAbsoluteImageUrl } from '@/lib/utils';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80';
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80';
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85';

const PRODUCT_PROJECTION = {
  name: 1,
  shortDescription: 1,
  category: 1,
  brand: 1,
  mainImage: 1,
  regularPrice: 1,
  sellingPrice: 1,
  mrp: 1,
  discount: 1,
  rating: 1,
  reviewCount: 1,
  stock: 1,
  featured: 1,
  trending: 1,
  tags: 1,
  createdAt: 1,
  views: 1,
  urlSlug: 1,
  metalType: 1,
  metalPurity: 1,
  livePriceEnabled: 1,
  metalCost: 1,
  makingChargeAmount: 1,
  gstAmount: 1,
};

const serializeProduct = (product: any, fallbackIndex = 0, requestUrl?: string) => {
  const id = product?._id?.toString() ?? `product-${fallbackIndex}`;
  const sellingPrice = typeof product?.sellingPrice === 'number'
    ? product.sellingPrice
    : typeof product?.regularPrice === 'number'
      ? product.regularPrice
      : 0;
  const regularPrice = typeof product?.regularPrice === 'number'
    ? product.regularPrice
    : sellingPrice;

  return {
    _id: id,
    name: product?.name ?? 'Untitled Product',
    category: product?.category ?? 'Jewellery',
    sellingPrice,
    regularPrice,
    mainImage: getAbsoluteImageUrl(product?.mainImage || DEFAULT_IMAGE, requestUrl),
    featured: !!product?.featured,
    trending: !!product?.trending,
    badge: product?.featured ? 'Featured' : product?.trending ? 'Trending' : undefined,
    urlSlug: product?.urlSlug || id,
  };
};

const serializeBanner = (banner: any, index: number, requestUrl?: string) => ({
  _id: banner?._id?.toString() ?? `banner-${index}`,
  title: banner?.title ?? 'Discover Timeless Pieces',
  subtitle: banner?.subtitle ?? '',
  description: banner?.description ?? '',
  buttonText: banner?.buttonText ?? 'Shop Now',
  image: getAbsoluteImageUrl(banner?.image || DEFAULT_BANNER_IMAGE, requestUrl),
  link: banner?.link || '/products',
  backgroundColor: banner?.backgroundColor || '#000000',
  type: banner?.type || 'main',
  displayOrder: typeof banner?.displayOrder === 'number' ? banner.displayOrder : index,
});

const serializeCategory = (category: any, index: number, requestUrl?: string) => ({
  _id: category?._id?.toString() ?? `category-${index}`,
  name: category?.name ?? 'Jewellery',
  slug: category?.slug ?? '',
  image: getAbsoluteImageUrl(category?.image || DEFAULT_CATEGORY_IMAGE, requestUrl),
  featured: !!category?.featured,
  productCount: category?.productCount ?? 0,
});

const safeQuery = async <T>(promise: Promise<T>, label: string, fallback: T) => {
  try {
    return await promise;
  } catch (error) {
    console.error(`[v0] Failed to fetch ${label}:`, error);
    return fallback;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const requestUrl = request.url;

    const bannersPromise = db
      .collection('homepage_banners')
      .find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(10)
      .toArray();

    const categoriesPromise = db
      .collection('categories')
      .aggregate([
        { $match: { status: 'active' } },
        {
          $lookup: {
            from: 'products',
            localField: 'name',
            foreignField: 'category',
            pipeline: [{ $match: { status: 'active' } }],
            as: 'products',
          },
        },
        { $addFields: { productCount: { $size: '$products' } } },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            description: 1,
            image: 1,
            featured: 1,
            productCount: 1,
            createdAt: 1,
          },
        },
        { $sort: { featured: -1, createdAt: -1 } },
        { $limit: 20 },
      ])
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
      .toArray();

    const galleryPromise = db
      .collection('homepage_gallery')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(20)
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
      .findOne({});

    const newArrivalsCardsPromise = db
      .collection('homepage_new_arrivals_cards')
      .find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(10)
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

    const serializeDazzleCard = (card: any, index: number) => ({
      _id: card?._id?.toString() ?? `dazzle-${index}`,
      title: card?.title || '',
      subtitle: card?.subtitle || '',
      description: card?.description || '',
      buttonText: card?.buttonText || 'Explore More',
      buttonLink: card?.buttonLink || '/products',
      image: getAbsoluteImageUrl(card?.image || '', requestUrl),
    });

    const serializeGalleryItem = (item: any, index: number) => ({
      _id: item?._id?.toString() ?? `gallery-${index}`,
      image: getAbsoluteImageUrl(item?.image || '', requestUrl),
    });

    const serializeNewsItem = (item: any, index: number) => ({
      _id: item?._id?.toString() ?? `news-${index}`,
      title: item?.title || 'Untitled',
      excerpt: item?.excerpt || '',
      image: getAbsoluteImageUrl(item?.featuredImage || '', requestUrl),
      publishDate: item?.publishedAt ? new Date(item.publishedAt).toISOString() : item?.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      slug: item?.slug || '',
    });

    const serializeNewArrivalsBanner = (banner: any) => {
      if (!banner) return null;
      return {
        title: banner.title || 'New Arrivals',
        subtitle: banner.subtitle || banner.badgeText || '💎 500+ New Items',
        description: banner.description || '',
        backgroundImage: getAbsoluteImageUrl(banner.backgroundImage || '', requestUrl),
      };
    };

    const serializeNewArrivalsCard = (card: any, index: number) => ({
      _id: card?._id?.toString() ?? `new-arrivals-card-${index}`,
      title: card?.title || '',
      image: getAbsoluteImageUrl(card?.image || '', requestUrl),
      type: card?.type || 'card',
    });

    const sections = [
      {
        type: 'hero',
        order: 1,
        data: {
          banners: rawBanners.map((banner, index) => ({
            _id: banner._id.toString(),
            title: banner.title || 'Discover Timeless Pieces',
            subtitle: banner.subtitle || '',
            description: banner.description || '',
            image: getAbsoluteImageUrl(banner.image || DEFAULT_BANNER_IMAGE, requestUrl),
            link: banner.link || '/products',
            buttonText: banner.buttonText || 'Shop Now',
            backgroundColor: banner.backgroundColor || '#f5f5f5',
            displayOrder: banner.displayOrder ?? index,
          })),
        },
      },
      {
        type: 'categories',
        order: 2,
        data: {
          categories: rawCategories.map((cat, idx) => serializeCategory(cat, idx, requestUrl)),
        },
      },
      {
        type: 'newProducts',
        order: 3,
        data: {
          products: rawNew.map((prod, idx) => serializeProduct(prod, idx, requestUrl)),
        },
      },
      {
        type: 'featuredProducts',
        order: 4,
        data: {
          products: rawFeatured.map((product, index) => ({
            ...serializeProduct(product, index, requestUrl),
            badge: 'Featured',
          })),
        },
      },
      {
        type: 'trendingProducts',
        order: 5,
        data: {
          products: rawTrending.map((product, index) => ({
            ...serializeProduct(product, index, requestUrl),
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

    return NextResponse.json({
      sections,
      fetchedAt: new Date().toISOString(),
    });
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

