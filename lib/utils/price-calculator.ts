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
  // If product has livePriceEnabled and jewelry components, calculate from them
  if (product.livePriceEnabled && (product.metalCost || product.makingChargeAmount || product.gstAmount)) {
    const metalCost = typeof product.metalCost === 'number' ? product.metalCost : 0;
    const makingCharge = typeof product.makingChargeAmount === 'number' ? product.makingChargeAmount : 0;
    const gst = typeof product.gstAmount === 'number' ? product.gstAmount : 0;
    
    // Calculate total price from jewelry components
    const calculatedPrice = metalCost + makingCharge + gst;
    
    // If calculated price is valid, use it
    if (calculatedPrice > 0) {
      return {
        sellingPrice: calculatedPrice,
        regularPrice: calculatedPrice,
        mrp: product.mrp && product.mrp > calculatedPrice ? product.mrp : calculatedPrice,
      };
    }
  }
  
  // Fallback to direct prices if available
  // Check price/subTotal/totalAmount fields (these are where actual prices are stored)
  const actualPrice = typeof product.price === 'number' && product.price > 0
    ? product.price
    : typeof product.subTotal === 'number' && product.subTotal > 0
    ? product.subTotal
    : typeof product.totalAmount === 'number' && product.totalAmount > 0
    ? product.totalAmount
    : 0;
  
  const sellingPrice = typeof product.sellingPrice === 'number' && product.sellingPrice > 0 
    ? product.sellingPrice 
    : typeof product.regularPrice === 'number' && product.regularPrice > 0
    ? product.regularPrice
    : actualPrice; // Use actualPrice if sellingPrice/regularPrice are 0
    
  const regularPrice = typeof product.regularPrice === 'number' && product.regularPrice > 0
    ? product.regularPrice
    : actualPrice > 0 ? actualPrice : sellingPrice; // Use actualPrice if regularPrice is 0
    
  const mrp = typeof product.mrp === 'number' && product.mrp > 0
    ? product.mrp
    : regularPrice;
  
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
  
  return {
    displayPrice: sellingPrice || regularPrice || 0,
    originalPrice: mrp || regularPrice || 0,
    sellingPrice,
    regularPrice,
    mrp,
    hasDiscount: (mrp || regularPrice) > (sellingPrice || regularPrice),
    discountPercent: product.discount || 0,
  };
}

