/**
 * Retailer commission: same combination logic as admin.
 * Used when showing retailer products to customers on the website:
 * customer price = sellingPrice + (sellingPrice * retailerCommission% / 100).
 */

export type RetailerCommissionRow = {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  retailerCommission: number;
};

function norm(s: string): string {
  return (s || '').trim().toLowerCase();
}

/**
 * Find retailer commission % from rows by combination match.
 * (productType, category, designType, metal, purityKarat).
 * Empty string in a row field acts as wildcard (matches any value).
 * Returns 0 if no match.
 */
export function findRetailerCommissionFromRows(
  rows: RetailerCommissionRow[],
  productType: string,
  categoryName: string,
  designType: string,
  metal: string,
  purity: string
): number {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const nPt = norm(productType);
  const nCat = norm(categoryName);
  const nDes = norm(designType);
  const nMet = norm(metal);
  const nPur = norm(purity);
  for (const row of rows) {
    if (norm(row.productType) !== '' && norm(row.productType) !== nPt) continue;
    if (norm(row.category) !== '' && norm(row.category) !== nCat) continue;
    if (norm(row.designType) !== '' && norm(row.designType) !== nDes) continue;
    if (norm(row.metal) !== '' && norm(row.metal) !== nMet) continue;
    if (norm(row.purityKarat) !== '' && norm(row.purityKarat) !== nPur) continue;
    const pct = typeof row.retailerCommission === 'number' && Number.isFinite(row.retailerCommission) ? row.retailerCommission : 0;
    return Math.max(0, Math.min(100, pct));
  }
  return 0;
}

/** Customer price = selling price + retailer commission on top. */
export function getCustomerPriceFromRetailer(sellingPrice: number, retailerCommissionPercent: number): number {
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) return sellingPrice;
  const pct = Math.max(0, Math.min(100, retailerCommissionPercent || 0));
  return Math.round(sellingPrice * (1 + pct / 100));
}
