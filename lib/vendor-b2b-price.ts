import { formatProductPrice } from '@/lib/utils/price-calculator';

export type VendorB2B = {
  b2bProductTypeCommissions?: Record<string, number>;
  b2bCommissionRows?: Array<{
    productType: string;
    category: string;
    designType: string;
    metal: string;
    purityKarat: string;
    vendorCommission: number;
  }>;
};

/**
 * Get the vendor's B2B commission % and the retailer cost price (base price with vendor B2B discount applied).
 * Used so retailer panel and sell-to-portal always reflect the vendor's current Commission Settings.
 * Formula: retailerCostPrice = basePrice * (1 - vendorB2BPercent / 100).
 */
export function getVendorB2BPrice(
  sourceProduct: Record<string, unknown> & {
    product_type?: string;
    category?: unknown;
    designType?: string;
    goldPurity?: string;
    silverPurity?: string;
  },
  vendor: VendorB2B | null,
  categoryName: string | null
): { vendorB2BPercent: number; retailerCostPrice: number } {
  const priceData = formatProductPrice(sourceProduct);
  const basePrice =
    Number(priceData.displayPrice) || Number(priceData.sellingPrice) || Number(priceData.regularPrice) || 0;
  if (!vendor) return { vendorB2BPercent: 0, retailerCostPrice: basePrice };

  const productType = (sourceProduct.product_type || '').trim();
  const ptCommissions = vendor.b2bProductTypeCommissions;
  const rows = vendor.b2bCommissionRows;
  let percent = 0;

  if (Array.isArray(rows) && rows.length > 0) {
    const designType = (sourceProduct.designType || '').trim();
    const metal =
      productType === 'Gold' || productType === 'Silver' || productType === 'Platinum' ? productType : '';
    const purity = (sourceProduct.goldPurity || sourceProduct.silverPurity || '').trim();
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

  const retailerCostPrice =
    percent > 0 && basePrice > 0 ? Math.round(basePrice * (1 - percent / 100)) : basePrice;
  return { vendorB2BPercent: percent, retailerCostPrice };
}
