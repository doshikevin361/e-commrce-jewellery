/**
 * Admin + vendor commission % and labels for product cards (retailer B2B, etc.).
 * Combination rules match lib/retailer-commission.ts (empty row field = wildcard).
 */

import { parsePurityPercent } from '@/lib/utils/admin-price-calculator';

function norm(s: string): string {
  return (s || '').trim().toLowerCase();
}

export type CommissionComboRow = {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  platformCommission?: number;
  vendorCommission?: number;
};

export type VendorCommissionRow = {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  vendorCommission: number;
};

/** e.g. 22KT → 92 */
export function purityToDisplayNumber(purity: string | undefined): number | null {
  if (!purity || !String(purity).trim()) return null;
  const fine = parsePurityPercent(String(purity));
  return Math.round(fine * 100);
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(/\.0$/, '');
}

/** First matching row (wildcard). Admin settings rows use platformCommission. */
export function findPlatformCommissionPercent(
  rows: CommissionComboRow[] | undefined,
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
    const v = row.platformCommission;
    if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.min(100, v));
  }
  return 0;
}

/** Vendor selling commission from commissionRows, then productTypeCommissions fallback. */
export function findVendorSellingCommissionPercent(
  rows: VendorCommissionRow[] | undefined,
  productTypeCommissions: Record<string, number> | undefined,
  productType: string,
  categoryName: string,
  designType: string,
  metal: string,
  purity: string
): number {
  if (Array.isArray(rows) && rows.length > 0) {
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
      const v = row.vendorCommission;
      if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.min(100, v));
    }
  }
  const pt = (productType || '').trim();
  if (productTypeCommissions && pt && typeof productTypeCommissions[pt] === 'number') {
    return Math.max(0, Math.min(100, productTypeCommissions[pt]));
  }
  return 0;
}

export type CommissionDisplayResult = {
  purityDisplay: number | null;
  adminCommissionPercent: number;
  vendorCommissionPercent: number;
  /** e.g. (92+2+3) */
  commissionLabelFull: string | null;
  /** e.g. (92+5) — admin+vendor summed */
  commissionLabelCompact: string | null;
};

export function buildCommissionDisplay(
  purityRaw: string | undefined,
  adminRows: CommissionComboRow[] | undefined,
  vendorRows: VendorCommissionRow[] | undefined,
  vendorProductTypeCommissions: Record<string, number> | undefined,
  productType: string,
  categoryName: string,
  designType: string,
  metal: string,
  purity: string
): CommissionDisplayResult {
  const purityDisplay = purityToDisplayNumber(purityRaw);
  const adminCommissionPercent = findPlatformCommissionPercent(
    adminRows,
    productType,
    categoryName,
    designType,
    metal,
    purity
  );
  const vendorCommissionPercent = findVendorSellingCommissionPercent(
    vendorRows,
    vendorProductTypeCommissions,
    productType,
    categoryName,
    designType,
    metal,
    purity
  );

  const hasAnyCommission = adminCommissionPercent > 0 || vendorCommissionPercent > 0;
  if (purityDisplay == null && !hasAnyCommission) {
    return {
      purityDisplay: null,
      adminCommissionPercent: 0,
      vendorCommissionPercent: 0,
      commissionLabelFull: null,
      commissionLabelCompact: null,
    };
  }

  const p = purityDisplay ?? 0;
  const a = adminCommissionPercent;
  const v = vendorCommissionPercent;
  const sum = a + v;

  let commissionLabelFull: string | null = null;
  if (purityDisplay != null) {
    if (a > 0 && v > 0) {
      commissionLabelFull = `(${fmtPct(p)}+${fmtPct(a)}+${fmtPct(v)})`;
    } else if (a > 0) {
      commissionLabelFull = `(${fmtPct(p)}+${fmtPct(a)})`;
    } else if (v > 0) {
      commissionLabelFull = `(${fmtPct(p)}+${fmtPct(v)})`;
    } else {
      commissionLabelFull = `(${fmtPct(p)})`;
    }
  } else if (hasAnyCommission) {
    if (a > 0 && v > 0) commissionLabelFull = `(${fmtPct(a)}+${fmtPct(v)})`;
    else if (a > 0) commissionLabelFull = `(${fmtPct(a)})`;
    else commissionLabelFull = `(${fmtPct(v)})`;
  }

  let commissionLabelCompact: string | null = null;
  if (purityDisplay != null && sum > 0) {
    commissionLabelCompact = `(${fmtPct(p)}+${fmtPct(sum)})`;
  } else if (purityDisplay != null) {
    commissionLabelCompact = `(${fmtPct(p)})`;
  } else if (sum > 0) {
    commissionLabelCompact = `(${fmtPct(sum)})`;
  }

  return {
    purityDisplay,
    adminCommissionPercent: a,
    vendorCommissionPercent: v,
    commissionLabelFull,
    commissionLabelCompact,
  };
}

/** Net metal / jewellery weight for display (grams). */
export function productNetWeightGrams(product: {
  jewelleryWeight?: number;
  metalWeight?: number;
  goldWeight?: number;
  silverWeight?: number;
  hasGold?: boolean;
  hasSilver?: boolean;
}): number | null {
  const j = typeof product.jewelleryWeight === 'number' ? product.jewelleryWeight : 0;
  if (j > 0) return j;
  const m = typeof product.metalWeight === 'number' ? product.metalWeight : 0;
  if (m > 0) return m;
  const g = product.hasGold && typeof product.goldWeight === 'number' ? product.goldWeight : 0;
  const s = product.hasSilver && typeof product.silverWeight === 'number' ? product.silverWeight : 0;
  const sum = g + s;
  return sum > 0 ? sum : null;
}
