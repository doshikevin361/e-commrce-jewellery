/**
 * Calculate product price from jewelry components or use direct price
 * @param product - Product object from database
 * @returns Object with calculated sellingPrice and regularPrice
 */
export function calculateProductPrice(product: any): {
  sellingPrice: number;
  regularPrice: number;
  mrp: number;
} {
  // Prefer stored total (saved by vendor on submit: total including commission).
  // These are set when the product is saved from the form.
  const storedPrice = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0;
  const savedTotal =
    storedPrice(product.sellingPrice) ||
    storedPrice(product.price) ||
    storedPrice(product.subTotal) ||
    storedPrice(product.totalAmount) ||
    0;

  if (savedTotal > 0) {
    const regularPrice = storedPrice(product.regularPrice) || savedTotal;
    const mrp = storedPrice(product.mrp) || regularPrice;
    return {
      sellingPrice: savedTotal,
      regularPrice: regularPrice || savedTotal,
      mrp: mrp || savedTotal,
    };
  }

  // Fallback: live calculation from components when no stored total
  if (product.livePriceEnabled && (product.metalCost || product.makingChargeAmount || product.gstAmount)) {
    const metalCost = typeof product.metalCost === 'number' ? product.metalCost : 0;
    const makingCharge = typeof product.makingChargeAmount === 'number' ? product.makingChargeAmount : 0;
    const gst = typeof product.gstAmount === 'number' ? product.gstAmount : 0;
    const calculatedPrice = metalCost + makingCharge + gst;
    if (calculatedPrice > 0) {
      return {
        sellingPrice: calculatedPrice,
        regularPrice: calculatedPrice,
        mrp: product.mrp && product.mrp > calculatedPrice ? product.mrp : calculatedPrice,
      };
    }
  }

  const actualPrice = storedPrice(product.price) || storedPrice(product.subTotal) || storedPrice(product.totalAmount) || 0;
  const sellingPrice = storedPrice(product.sellingPrice) || storedPrice(product.regularPrice) || actualPrice;
  const regularPrice = storedPrice(product.regularPrice) || actualPrice || sellingPrice;
  const mrp = storedPrice(product.mrp) || regularPrice;

  return {
    sellingPrice,
    regularPrice,
    mrp,
  };
}

/**
 * Format product for API response with calculated prices
 * @param product - Product object from database
 * @returns Formatted product with displayPrice, originalPrice, etc.
 */
export function formatProductPrice(product: any) {
  const { sellingPrice, regularPrice, mrp } = calculateProductPrice(product);
  
  // Get base original price
  const baseOriginalPrice = mrp || regularPrice || sellingPrice || 0;
  
  // Get discount percentage
  const discountPercent = typeof product.discount === 'number' && product.discount > 0 && product.discount <= 100
    ? product.discount
    : 0;
  
  // Calculate discounted price if discount exists
  const discountedPrice = discountPercent > 0 && baseOriginalPrice > 0
    ? Math.max(0, Math.round(baseOriginalPrice * (1 - discountPercent / 100)))
    : (sellingPrice || baseOriginalPrice);
  
  // Original price is the base price before discount
  const finalOriginalPrice = baseOriginalPrice;
  
  // Display price is the discounted price
  const finalDisplayPrice = discountedPrice;
  
  // Check if there's a discount
  const hasDiscount = discountPercent > 0 && finalOriginalPrice > finalDisplayPrice;
  
  return {
    displayPrice: finalDisplayPrice,
    originalPrice: finalOriginalPrice,
    sellingPrice: finalDisplayPrice,
    regularPrice: finalOriginalPrice,
    mrp: finalOriginalPrice,
    hasDiscount,
    discountPercent,
  };
}

