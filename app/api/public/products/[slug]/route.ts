import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { formatProductPrice } from "@/lib/utils/price-calculator";

// Cache for 60 seconds, revalidate in background
export const revalidate = 60;
export const dynamic = 'force-dynamic';

// Only fields needed for customer display
const PRODUCT_PROJECTION = {
  _id: 1,
  name: 1,
  shortDescription: 1,
  longDescription: 1,
  category: 1,
  brand: 1,
  mainImage: 1,
  galleryImages: 1,
  images: 1,
  regularPrice: 1,
  sellingPrice: 1,
  price: 1,
  subTotal: 1,
  totalAmount: 1,
  mrp: 1,
  discount: 1,
  taxRate: 1,
  gstRate: 1,
  rating: 1,
  reviewCount: 1,
  stock: 1,
  featured: 1,
  trending: 1,
  tags: 1,
  urlSlug: 1,
  relatedProducts: 1,
  // Metal fields
  hasGold: 1,
  hasSilver: 1,
  goldWeight: 1,
  goldPurity: 1,
  goldRatePerGram: 1,
  silverWeight: 1,
  silverPurity: 1,
  silverRatePerGram: 1,
  metalType: 1,
  metalPurity: 1,
  metalWeight: 1,
  // Diamond fields
  hasDiamond: 1,
  diamonds: 1,
  diamondCarat: 1,
  numberOfStones: 1,
  diamondShape: 1,
  stoneClarity: 1,
  stoneColor: 1,
  diamondCut: 1,
  // Making charges
  makingCharges: 1,
  makingChargePerGram: 1,
  // Other charges
  shippingCharges: 1,
  hallMarkingCharges: 1,
  insuranceCharges: 1,
  packingCharges: 1,
  // Gemstone fields
  gemstoneName: 1,
  gemstonePrice: 1,
  gemstoneColour: 1,
  gemstoneShape: 1,
  gemstoneWeight: 1,
  ratti: 1,
  specificGravity: 1,
  hardness: 1,
  refractiveIndex: 1,
  magnification: 1,
  remarks: 1,
  gemstoneDescription: 1,
  reportNo: 1,
  gemstoneCertificateLab: 1,
  hallmarked: 1,
  bis_hallmark: 1,
  certificationNumber: 1,
  gender: 1,
  // Other product details
  occasion: 1,
  dimension: 1,
  collection: 1,
  designType: 1,
  size: 1,
  thickness: 1,
  // Specifications
  specifications: 1,
  variants: 1,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { db } = await connectToDatabase();
    
    // Try to find product by slug first with projection
    let product = await db.collection("products").findOne(
      {
        urlSlug: slug,
        status: "active", // Only show active products
      },
      { projection: PRODUCT_PROJECTION }
    );

    // If not found by slug, try to find by ID (for backward compatibility)
    if (!product && ObjectId.isValid(slug)) {
      product = await db.collection("products").findOne(
        {
          _id: new ObjectId(slug),
          status: "active",
        },
        { projection: PRODUCT_PROJECTION }
      );
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = product._id;

    // Fetch category name if category is an ObjectId
    let categoryName = product.category;
    if (product.category && ObjectId.isValid(product.category)) {
      const categoryDoc = await db.collection("categories").findOne({
        _id: new ObjectId(product.category)
      });
      if (categoryDoc) {
        categoryName = categoryDoc.name;
      }
    }

    // Fetch design type name if designType is an ObjectId
    let designTypeName = product.designType;
    if (product.designType && ObjectId.isValid(product.designType)) {
      const designTypeDoc = await db.collection("design_types").findOne({
        _id: new ObjectId(product.designType)
      });
      if (designTypeDoc) {
        designTypeName = designTypeDoc.name;
      }
    }

    // Increment view count for trending calculation
    await db.collection("products").updateOne(
      { _id: productId },
      { $inc: { views: 1 } }
    );

    // Fetch related products - prioritize manually selected related products
    let relatedProducts = [];
    
    // First, try to fetch manually selected related products
    if (product.relatedProducts && Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0) {
      // Convert all valid IDs to ObjectId format for comparison
      const relatedProductIds = product.relatedProducts
        .filter((id: any) => id && ObjectId.isValid(id))
        .map((id: any) => {
          try {
            return typeof id === 'string' ? new ObjectId(id) : id;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as ObjectId[];
      
      if (relatedProductIds.length > 0) {
        // Fetch ALL manually selected related products without limit
        // Include both active and inactive products for manually selected items (admin's choice)
        const fetchedProducts = await db
          .collection("products")
          .find({
            _id: { $in: relatedProductIds },
          })
          .project({
            _id: 1,
            name: 1,
            mainImage: 1,
            sellingPrice: 1,
            regularPrice: 1,
            price: 1,
            subTotal: 1,
            discount: 1,
            rating: 1,
            reviewCount: 1,
            urlSlug: 1,
            category: 1,
            status: 1,
          })
          .toArray();
        
        // Create a map for faster lookup
        const productMap = new Map(
          fetchedProducts.map(p => [p._id.toString(), p])
        );
        
        // Maintain the order of selected products as they appear in the admin panel
        // Filter to only include active products for display
        relatedProducts = relatedProductIds
          .map(id => {
            const product = productMap.get(id.toString());
            // Only include active products
            return product && product.status === 'active' ? product : null;
          })
          .filter(Boolean) as any[];
      }
    }
    
    // Only fill with category products if NO manually selected products exist
    if (relatedProducts.length === 0) {
      const additionalProducts = await db
        .collection("products")
        .find({
          category: product.category,
          _id: { $ne: productId },
          status: "active",
          stock: { $gt: 0 },
        })
        .limit(8)
        .project({
          _id: 1,
          name: 1,
          mainImage: 1,
          sellingPrice: 1,
          regularPrice: 1,
          price: 1,
          subTotal: 1,
          rating: 1,
          reviewCount: 1,
          urlSlug: 1,
          category: 1,
        })
        .toArray();
      
      relatedProducts = additionalProducts;
    }

    // Calculate prices using the price calculator
    const priceData = formatProductPrice(product);

    // Handle both images and galleryImages fields for backward compatibility
    const galleryImages = Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? product.galleryImages
      : (Array.isArray(product.images) && product.images.length > 0 ? product.images : []);

    // Only return fields needed for customer display
    const productData = {
      _id: product._id.toString(),
      name: product.name,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      category: product.category,
      categoryName: categoryName,
      brand: product.brand,
      mainImage: product.mainImage,
      galleryImages: galleryImages,
      // Pricing
      displayPrice: priceData.displayPrice,
      originalPrice: priceData.originalPrice,
      sellingPrice: priceData.sellingPrice,
      regularPrice: priceData.regularPrice,
      mrp: priceData.mrp,
      hasDiscount: priceData.hasDiscount,
      discountPercent: priceData.discountPercent,
      discount: product.discount || 0,
      price: product.price,
      subTotal: product.subTotal,
      totalAmount: product.totalAmount,
      taxRate: product.taxRate || product.gstRate || 3,
      // Ratings
      rating: product.rating,
      reviewCount: product.reviewCount,
      // Stock
      stock: product.stock,
      // Flags
      featured: product.featured,
      trending: product.trending,
      // Tags
      tags: Array.isArray(product.tags) ? product.tags : [],
      // URL
      urlSlug: product.urlSlug,
      // Metal details (only if exists)
      ...(product.hasGold && {
        hasGold: product.hasGold,
        goldWeight: product.goldWeight,
        goldPurity: product.goldPurity,
        goldRatePerGram: product.goldRatePerGram,
      }),
      ...(product.hasSilver && {
        hasSilver: product.hasSilver,
        silverWeight: product.silverWeight,
        silverPurity: product.silverPurity,
        silverRatePerGram: product.silverRatePerGram,
      }),
      ...(product.metalType && {
        metalType: product.metalType,
        metalPurity: product.metalPurity,
        metalWeight: product.metalWeight,
      }),
      // Diamond details (only if exists)
      ...(product.hasDiamond && {
        hasDiamond: product.hasDiamond,
        diamonds: product.diamonds,
        diamondCarat: product.diamondCarat,
        numberOfStones: product.numberOfStones,
        diamondShape: product.diamondShape,
        stoneClarity: product.stoneClarity,
        stoneColor: product.stoneColor,
        diamondCut: product.diamondCut,
      }),
      // Making charges (only if exists)
      ...(product.makingCharges && { makingCharges: product.makingCharges }),
      ...(product.makingChargePerGram && { makingChargePerGram: product.makingChargePerGram }),
      // Other charges (only if exists)
      ...(product.shippingCharges && { shippingCharges: product.shippingCharges }),
      ...(product.hallMarkingCharges && { hallMarkingCharges: product.hallMarkingCharges }),
      ...(product.insuranceCharges && { insuranceCharges: product.insuranceCharges }),
      ...(product.packingCharges && { packingCharges: product.packingCharges }),
      // Gemstone fields (include all if any gemstone field exists)
      ...((product.gemstoneName || product.gemstoneColour || product.gemstoneShape || product.gemstoneWeight || product.gemstonePrice || product.ratti) && {
        ...(product.gemstoneName && { gemstoneName: product.gemstoneName }),
        ...(product.gemstonePrice && product.gemstonePrice > 0 && { gemstonePrice: product.gemstonePrice }),
        ...(product.gemstoneColour && { gemstoneColour: product.gemstoneColour }),
        ...(product.gemstoneShape && { gemstoneShape: product.gemstoneShape }),
        ...(product.gemstoneWeight && product.gemstoneWeight > 0 && { gemstoneWeight: product.gemstoneWeight }),
        ...(product.ratti && product.ratti > 0 && { ratti: product.ratti }),
        ...(product.specificGravity && product.specificGravity > 0 && { specificGravity: product.specificGravity }),
        ...(product.hardness && product.hardness > 0 && { hardness: product.hardness }),
        ...(product.refractiveIndex && product.refractiveIndex > 0 && { refractiveIndex: product.refractiveIndex }),
        ...(product.magnification && product.magnification > 0 && { magnification: product.magnification }),
        ...(product.remarks && product.remarks.trim().length > 0 && { remarks: product.remarks }),
        ...(product.gemstoneDescription && product.gemstoneDescription.trim().length > 0 && { gemstoneDescription: product.gemstoneDescription }),
        ...(product.reportNo && product.reportNo.trim().length > 0 && { reportNo: product.reportNo }),
        ...(product.gemstoneCertificateLab && product.gemstoneCertificateLab.trim().length > 0 && { gemstoneCertificateLab: product.gemstoneCertificateLab }),
      }),
      ...(product.hallmarked && { hallmarked: product.hallmarked }),
      ...(product.bis_hallmark && { bis_hallmark: product.bis_hallmark }),
      ...(product.certificationNumber && { certificationNumber: product.certificationNumber }),
      // Gender - only include if it's a non-empty array or non-empty string
      ...(product.gender && 
        ((Array.isArray(product.gender) && product.gender.length > 0) || 
         (typeof product.gender === 'string' && product.gender.trim().length > 0)) && 
        { gender: product.gender }),
      // Other product details (only if exists)
      ...(product.occasion && (typeof product.occasion === 'string' ? product.occasion.trim().length > 0 : true) && { occasion: product.occasion }),
      ...(product.dimension && (typeof product.dimension === 'string' ? product.dimension.trim().length > 0 : true) && { dimension: product.dimension }),
      ...(product.collection && (typeof product.collection === 'string' ? product.collection.trim().length > 0 : true) && { collection: product.collection }),
      ...(designTypeName && (typeof designTypeName === 'string' ? designTypeName.trim().length > 0 : true) && { designType: designTypeName }),
      ...(product.size && ((typeof product.size === 'string' && product.size.trim().length > 0) || (typeof product.size === 'number' && product.size > 0)) && { size: product.size }),
      ...(product.thickness && ((typeof product.thickness === 'number' && product.thickness > 0) || (typeof product.thickness === 'string' && product.thickness.trim().length > 0)) && { thickness: product.thickness }),
      // Specifications - include if it's a valid array with at least one entry
      ...(Array.isArray(product.specifications) && product.specifications.length > 0 && {
        specifications: product.specifications.filter((spec: any) => spec && (spec.key || spec.value))
      }),
      // Variants
      variants: Array.isArray(product.variants) ? product.variants.map((v: any) => ({
        id: v.id,
        type: v.type,
        options: Array.isArray(v.options) ? v.options.map((opt: any) => ({
          name: opt.name,
          sku: opt.sku,
          price: opt.price,
          stock: opt.stock,
          image: opt.image,
        })) : [],
      })) : [],
      // Related products
      relatedProducts: relatedProducts.map(rp => {
        const rpPriceData = formatProductPrice(rp);
        return {
          id: rp._id.toString(),
          _id: rp._id.toString(),
          title: rp.name || 'Untitled Product',
          category: rp.category || product.category || 'Jewellery',
          price: `₹${rpPriceData.displayPrice.toLocaleString()}`,
          originalPrice: rpPriceData.hasDiscount && rpPriceData.originalPrice > rpPriceData.displayPrice
            ? `₹${rpPriceData.originalPrice.toLocaleString()}` 
            : undefined,
          rating: rp.rating || 4.5,
          reviews: rp.reviewCount || 0,
          image: rp.mainImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
          displayPrice: rpPriceData.displayPrice,
          originalPriceValue: rpPriceData.originalPrice,
          urlSlug: rp.urlSlug || rp._id.toString(),
        };
      }),
    };

    const response = NextResponse.json(productData);
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error("[v0] Failed to fetch public product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

