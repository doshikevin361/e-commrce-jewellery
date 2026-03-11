/**
 * Product price calculation – same formula as product form (add/edit).
 *
 * ADD FLOW (form):
 * 1. Metal value = netWeight × (rate × purityPercent)
 * 2. Making charges = netWeight × makingChargePerGram
 * 3. Diamond value = sum(diamondPrice) + diamondsPrice (if Diamonds type)
 * 4. Commission base = metal + making + diamonds (for %)
 * 5. Platform commission = commissionBase × (platformCommissionRate / 100)
 * 6. SubTotal = metal + making + diamonds + platform commission + otherCharges
 * 7. Vendor commission = commissionBase × (vendorCommissionRate / 100) [vendor product]
 * 8. Retailer commission = commissionBase × (retailerCommissionRate / 100) [retailer product]
 * 9. Total = subTotal + vendor commission + retailer commission
 *
 * UPDATE FLOW (metal-prices PUT): uses calculateFullProductPrice(product, { newRate })
 * so stored price = same as form would show with that rate.
 */
type RateOverrides = {
  goldRate?: number;
  silverRate?: number;
  platinumRate?: number;
  platformCommissionRate?: number;
};

// Normalize purity string for lookup (form may store "18 kt" or "18kt")
function normalizePurityKey(purity: string): string {
  return purity.toLowerCase().trim().replace(/\s+/g, '');
}

// Same PURITY_MAP and parse logic as product-form-page.tsx so add-time and update-time match
const PURITY_MAP: Record<string, number> = {
  '24kt': 1,
  '22kt': 0.92,
  '20kt': 0.84,
  '18kt': 0.75,
  '14kt': 0.583,
  '80%': 0.8,
  '100%': 1,
};

function parsePurityPercent(purity: string): number {
  if (!purity) return 1;
  const key = normalizePurityKey(purity);
  if (PURITY_MAP[key] !== undefined) return PURITY_MAP[key];
  const numeric = parseFloat(purity);
  if (isFinite(numeric)) {
    if (numeric > 24) return Math.min(numeric / 100, 1);
    if (numeric > 0 && numeric <= 24) return numeric / 24;
  }
  return 1;
}

// Helper function to calculate product price (same logic as in product-form-page.tsx)
export function calculateAdminProductPrice(
  product: any,
  overrides: RateOverrides = {}
): number {

  const productType = product.productType || product.product_type;
  const isSimpleProductType =
    productType === 'Gemstone' || productType === 'Imitation';
  const platformCommissionRate =
    overrides.platformCommissionRate ?? product.platformCommissionRate ?? 0;

  // For Gemstone/Imitation, return gemstone price
  if (isSimpleProductType) {
    const gemstoneValue = product.gemstonePrice || 0;
    const platformCommissionValue =
      platformCommissionRate > 0
        ? gemstoneValue * (platformCommissionRate / 100)
        : 0;
    return gemstoneValue + platformCommissionValue;
  }

  // For Diamonds without metals
  if (
    productType === 'Diamonds' &&
    !product.diamonds?.some((d: any) => d.metalType)
  ) {
    const diamondValueAuto =
      (product.diamonds || []).reduce(
        (sum: number, d: any) => sum + (d.diamondPrice || 0),
        0
      ) + (product.diamondsPrice || 0);
    const platformCommissionValue =
      platformCommissionRate > 0
        ? diamondValueAuto * (platformCommissionRate / 100)
        : 0;
    return diamondValueAuto + platformCommissionValue;
  }

  // For Diamonds with metals - calculate from diamonds array
  if (
    productType === 'Diamonds' &&
    product.diamonds?.some((d: any) => d.metalType)
  ) {
    const diamondsProductMetalValue = (product.diamonds || []).reduce(
      (sum: number, d: any) => {
        if (d.metalType) {
          const itemMetalRate =
            d.metalType === 'Silver'
              ? (overrides.silverRate ?? d.customMetalRate ?? 0)
              : d.metalType === 'Platinum'
              ? (overrides.platinumRate ?? d.customMetalRate ?? 0)
              : (overrides.goldRate ?? d.customMetalRate ?? 0);
          const itemPurityPercent = parsePurityPercent(d.metalPurity || '24kt');
          const itemPurityMetalRate = itemMetalRate * itemPurityPercent;
          const itemWeight = d.metalWeight || 0;
          const itemMakingCharges = d.makingCharges || 0;
          return sum + itemWeight * itemPurityMetalRate + itemWeight * itemMakingCharges;
        }
        return sum;
      },
      0
    );

    const diamondValueAuto =
      (product.diamonds || []).reduce(
        (sum: number, d: any) => sum + (d.diamondPrice || 0),
        0
      ) + (product.diamondsPrice || 0);
    const platformCommissionBase = diamondsProductMetalValue + diamondValueAuto;
    const platformCommissionValue =
      platformCommissionRate > 0
        ? platformCommissionBase * (platformCommissionRate / 100)
        : 0;
    return (
      diamondsProductMetalValue +
      diamondValueAuto +
      platformCommissionValue
    );
  }

  // For Gold/Silver/Platinum products
  const hasGold = product.hasGold || productType === 'Gold';
  const hasPlatinum = productType === 'Platinum';
  const hasSilver = product.hasSilver || productType === 'Silver';

  let goldValue = 0;
  let platinumValue = 0;
  let silverValue = 0;
  let makingChargesValue = 0;

  if (hasGold) {
    const goldWeight = product.goldWeight || product.weight || 0;
    const goldRatePerGram = overrides.goldRate ?? product.goldRatePerGram ?? 0;
    const goldPurity = product.goldPurity || '24kt';
    const purityPercent = parsePurityPercent(goldPurity);
    const purityMetalRate = goldRatePerGram * purityPercent;

    // Calculate net gold weight (subtract diamond weight if any)
    const totalDiamondWeightCt = (product.diamonds || []).reduce(
      (sum: number, d: any) => sum + (d.diamondWeight || 0),
      0
    );
    const netGoldWeight = Math.max(
      0,
      goldWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0)
    );

    goldValue = netGoldWeight * purityMetalRate;
    makingChargesValue =
      netGoldWeight * (product.makingChargePerGram || 0);
  }

  if (hasPlatinum) {
    const platinumWeight = product.goldWeight || product.weight || 0; // Platinum uses goldWeight field
    const platinumRatePerGram =
      overrides.platinumRate ?? product.goldRatePerGram ?? product.customMetalRate ?? 0; // Platinum uses goldRatePerGram/customMetalRate
    // Form uses silverPurity || goldPurity for Platinum (Platinum Purity %)
    const platinumPurity = product.silverPurity || product.goldPurity || '24kt';
    const purityPercent = parsePurityPercent(platinumPurity);
    const purityMetalRate = platinumRatePerGram * purityPercent;

    // Calculate net platinum weight (subtract diamond weight if any)
    const totalDiamondWeightCt = (product.diamonds || []).reduce(
      (sum: number, d: any) => sum + (d.diamondWeight || 0),
      0
    );
    const netPlatinumWeight = Math.max(
      0,
      platinumWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0)
    );

    platinumValue = netPlatinumWeight * purityMetalRate;
    makingChargesValue =
      netPlatinumWeight * (product.makingChargePerGram || 0);
  }

  if (hasSilver) {
    const silverWeight = product.silverWeight || product.weight || 0;
    const totalDiamondWeightCt = (product.diamonds || []).reduce(
      (sum: number, d: any) => sum + (d.diamondWeight || 0),
      0
    );
    const netSilverWeight = Math.max(
      0,
      silverWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0)
    );
    const silverRatePerGram =
      overrides.silverRate ?? product.silverRatePerGram ?? 0;
    const silverPurity = product.silverPurity || '24kt';
    const purityPercent = parsePurityPercent(silverPurity);
    const purityMetalRate = silverRatePerGram * purityPercent;

    silverValue = netSilverWeight * purityMetalRate;
    makingChargesValue =
      netSilverWeight * (product.makingChargePerGram || 0);
  }

  const diamondValueAuto = (product.diamonds || []).reduce(
    (sum: number, d: any) => sum + (d.diamondPrice || 0),
    0
  );
  const platformCommissionBase =
    goldValue + platinumValue + silverValue + makingChargesValue + diamondValueAuto;
  const platformCommissionValue =
    platformCommissionRate > 0
      ? platformCommissionBase * (platformCommissionRate / 100)
      : 0;
  const extraCharges = product.otherCharges || 0;

  return (
    goldValue +
    platinumValue +
    silverValue +
    makingChargesValue +
    diamondValueAuto +
    platformCommissionValue +
    extraCharges
  );
}

/** Commission base = metal + making + diamonds (form uses this for vendor/retailer commission %) */
function getCommissionBaseInternal(product: any, overrides: RateOverrides = {}): number {
  const productType = product.productType || product.product_type;
  const isSimpleProductType = productType === 'Gemstone' || productType === 'Imitation';
  if (isSimpleProductType) return product.gemstonePrice || 0;
  if (productType === 'Diamonds' && !product.diamonds?.some((d: any) => d.metalType)) {
    return (
      (product.diamonds || []).reduce((sum: number, d: any) => sum + (d.diamondPrice || 0), 0) +
      (product.diamondsPrice || 0)
    );
  }
  if (productType === 'Diamonds' && product.diamonds?.some((d: any) => d.metalType)) {
    const diamondsProductMetalValue = (product.diamonds || []).reduce((sum: number, d: any) => {
      if (!d.metalType) return sum;
      const itemMetalRate =
        d.metalType === 'Silver'
          ? (overrides.silverRate ?? d.customMetalRate ?? 0)
          : d.metalType === 'Platinum'
            ? (overrides.platinumRate ?? d.customMetalRate ?? 0)
            : (overrides.goldRate ?? d.customMetalRate ?? 0);
      const itemPurityPercent = parsePurityPercent(d.metalPurity || '24kt');
      const itemWeight = d.metalWeight || 0;
      const itemMakingCharges = d.makingCharges || 0;
      return sum + itemWeight * itemMetalRate * itemPurityPercent + itemWeight * itemMakingCharges;
    }, 0);
    const diamondValueAuto = (product.diamonds || []).reduce(
      (s: number, d: any) => s + (d.diamondPrice || 0),
      0
    ) + (product.diamondsPrice || 0);
    return diamondsProductMetalValue + diamondValueAuto;
  }
  // Gold/Silver/Platinum: same as form (commission base = metal + making + diamonds)
  const hasGold = product.hasGold || productType === 'Gold';
  const hasPlatinum = productType === 'Platinum';
  const hasSilver = product.hasSilver || productType === 'Silver';
  let g = 0, p = 0, s = 0, m = 0;
  const diamondValueAuto = (product.diamonds || []).reduce(
    (sum: number, d: any) => sum + (d.diamondPrice || 0),
    0
  );
  if (hasGold) {
    const goldWeight = product.goldWeight || product.weight || 0;
    const goldRatePerGram = overrides.goldRate ?? product.goldRatePerGram ?? 0;
    const purityPercent = parsePurityPercent(product.goldPurity || '24kt');
    const totalDiamondWeightCt = (product.diamonds || []).reduce(
      (sum: number, d: any) => sum + (d.diamondWeight || 0),
      0
    );
    const netGoldWeight = Math.max(
      0,
      goldWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0)
    );
    g = netGoldWeight * goldRatePerGram * purityPercent;
    m = netGoldWeight * (product.makingChargePerGram || 0);
  }
  if (hasPlatinum) {
    const platinumWeight = product.goldWeight || product.weight || 0;
    const platinumRatePerGram =
      overrides.platinumRate ?? product.goldRatePerGram ?? product.customMetalRate ?? 0;
    const platinumPurity = product.silverPurity || product.goldPurity || '24kt';
    const purityPercent = parsePurityPercent(platinumPurity);
    const totalDiamondWeightCt = (product.diamonds || []).reduce(
      (sum: number, d: any) => sum + (d.diamondWeight || 0),
      0
    );
    const netPlatinumWeight = Math.max(
      0,
      platinumWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0)
    );
    p = netPlatinumWeight * platinumRatePerGram * purityPercent;
    m = netPlatinumWeight * (product.makingChargePerGram || 0);
  }
  if (hasSilver) {
    const silverWeight = product.silverWeight || product.weight || 0;
    const totalDiamondWeightCt = (product.diamonds || []).reduce(
      (sum: number, d: any) => sum + (d.diamondWeight || 0),
      0
    );
    const netSilverWeight = Math.max(
      0,
      silverWeight - totalDiamondWeightCt - (product.lessStoneWeight || 0)
    );
    const silverRatePerGram = overrides.silverRate ?? product.silverRatePerGram ?? 0;
    const purityPercent = parsePurityPercent(product.silverPurity || '24kt');
    s = netSilverWeight * silverRatePerGram * purityPercent;
    m = netSilverWeight * (product.makingChargePerGram || 0);
  }
  return g + p + s + m + diamondValueAuto;
}

/**
 * Full price as in form: base (metal + making + diamonds + platform + other) + vendor commission (if vendor product) or retailer commission (if retailer product).
 * Use for metal-rate bulk update so stored price matches form live calculation.
 */
export function calculateFullProductPrice(
  product: any,
  overrides: RateOverrides & { vendorCommissionRate?: number; retailerCommissionRate?: number } = {}
): number {
  const { total } = getPriceBreakdown(product, overrides);
  return total;
}

/**
 * Returns breakdown for logging: base, commissionBase, vendorCommission, retailerCommission, total.
 * Use when metal price is updated to log how each product was calculated (terminal).
 */
export function getPriceBreakdown(
  product: any,
  overrides: RateOverrides & { vendorCommissionRate?: number; retailerCommissionRate?: number } = {}
): {
  base: number;
  commissionBase: number;
  vendorCommission: number;
  retailerCommission: number;
  total: number;
} {
  const base = calculateAdminProductPrice(product, overrides);
  const commissionBase = getCommissionBaseInternal(product, overrides);
  const vendorRate = overrides.vendorCommissionRate ?? product.vendorCommissionRate ?? 0;
  const retailerRate = overrides.retailerCommissionRate ?? product.retailerCommissionRate ?? 0;
  const vendorCommission = vendorRate > 0 ? commissionBase * (vendorRate / 100) : 0;
  const retailerCommission = retailerRate > 0 ? commissionBase * (retailerRate / 100) : 0;
  const total = Math.round((base + vendorCommission + retailerCommission) * 100) / 100;
  return { base, commissionBase, vendorCommission, retailerCommission, total };
}

/**
 * Full component breakdown for logging (e.g. when product name is "Ring").
 * Returns metalValue, makingCharges, diamondValue, platformCommission, otherCharges, vendorCommission, retailerCommission, total.
 */
export function getDetailedPriceBreakdown(
  product: any,
  overrides: RateOverrides & { vendorCommissionRate?: number; retailerCommissionRate?: number } = {}
): {
  metalValue: number;
  makingCharges: number;
  diamondValue: number;
  platformCommission: number;
  otherCharges: number;
  vendorCommission: number;
  retailerCommission: number;
  total: number;
} {
  const productType = product.productType || product.product_type;
  const platformCommissionRate = overrides.platformCommissionRate ?? product.platformCommissionRate ?? 0;
  let metalValue = 0;
  let makingCharges = 0;
  let diamondValue = (product.diamonds || []).reduce((s: number, d: any) => s + (d.diamondPrice || 0), 0);
  if (productType === 'Diamonds') diamondValue += product.diamondsPrice || 0;
  const otherCharges = product.otherCharges || 0;

  const hasGold = product.hasGold || productType === 'Gold';
  const hasPlatinum = productType === 'Platinum';
  const hasSilver = product.hasSilver || productType === 'Silver';
  const totalDiamondWeightCt = (product.diamonds || []).reduce((s: number, d: any) => s + (d.diamondWeight || 0), 0);
  const lessStone = product.lessStoneWeight || 0;

  if (hasGold) {
    const goldWeight = product.goldWeight || product.weight || 0;
    const goldRatePerGram = overrides.goldRate ?? product.goldRatePerGram ?? 0;
    const purityPercent = parsePurityPercent(product.goldPurity || '24kt');
    const netGoldWeight = Math.max(0, goldWeight - totalDiamondWeightCt - lessStone);
    metalValue += netGoldWeight * goldRatePerGram * purityPercent;
    makingCharges += netGoldWeight * (product.makingChargePerGram || 0);
  }
  if (hasPlatinum) {
    const platinumWeight = product.goldWeight || product.weight || 0;
    const platinumRatePerGram = overrides.platinumRate ?? product.goldRatePerGram ?? product.customMetalRate ?? 0;
    const platinumPurity = product.silverPurity || product.goldPurity || '24kt';
    const purityPercent = parsePurityPercent(platinumPurity);
    const netPlatinumWeight = Math.max(0, platinumWeight - totalDiamondWeightCt - lessStone);
    metalValue += netPlatinumWeight * platinumRatePerGram * purityPercent;
    makingCharges += netPlatinumWeight * (product.makingChargePerGram || 0);
  }
  if (hasSilver) {
    const silverWeight = product.silverWeight || product.weight || 0;
    const silverRatePerGram = overrides.silverRate ?? product.silverRatePerGram ?? 0;
    const purityPercent = parsePurityPercent(product.silverPurity || '24kt');
    const netSilverWeight = Math.max(0, silverWeight - totalDiamondWeightCt - lessStone);
    metalValue += netSilverWeight * silverRatePerGram * purityPercent;
    makingCharges += netSilverWeight * (product.makingChargePerGram || 0);
  }

  const commissionBase = metalValue + makingCharges + diamondValue;
  const platformCommission = platformCommissionRate > 0 ? commissionBase * (platformCommissionRate / 100) : 0;
  const base = metalValue + makingCharges + diamondValue + platformCommission + otherCharges;
  const vendorRate = overrides.vendorCommissionRate ?? product.vendorCommissionRate ?? 0;
  const retailerRate = overrides.retailerCommissionRate ?? product.retailerCommissionRate ?? 0;
  const vendorCommission = vendorRate > 0 ? commissionBase * (vendorRate / 100) : 0;
  const retailerCommission = retailerRate > 0 ? commissionBase * (retailerRate / 100) : 0;
  const total = Math.round((base + vendorCommission + retailerCommission) * 100) / 100;

  return {
    metalValue,
    makingCharges,
    diamondValue,
    platformCommission,
    otherCharges,
    vendorCommission,
    retailerCommission,
    total,
  };
}

function parsePurityPercentPublic(purity: string): number {
  return parsePurityPercent(purity);
}

/**
 * Metal value only (weight * purity * rate) for delta formula:
 * newPrice = currentPrice - getMetalValueForRate(product, oldRate, metalType) + getMetalValueForRate(product, newRate, metalType)
 */
export function getMetalValueForRate(
  product: any,
  rate: number,
  metalType: 'Gold' | 'Silver' | 'Platinum'
): number {
  if (!rate || rate <= 0) return 0;
  const productType = (product.productType || product.product_type || '').toString().toLowerCase();
  const totalDiamondWeightCt = (product.diamonds || []).reduce(
    (sum: number, d: any) => sum + (d.diamondWeight || 0),
    0
  );
  const lessStone = product.lessStoneWeight || 0;

  if (metalType === 'Platinum' && productType === 'platinum') {
    const platinumWeight = product.goldWeight || product.weight || 0;
    const netWeight = Math.max(0, platinumWeight - totalDiamondWeightCt - lessStone);
    const purity = product.silverPurity || product.goldPurity || '24kt';
    return netWeight * parsePurityPercentPublic(purity) * rate;
  }
  if (metalType === 'Gold' && (product.hasGold || productType === 'gold')) {
    const goldWeight = product.goldWeight || product.weight || 0;
    const netWeight = Math.max(0, goldWeight - totalDiamondWeightCt - lessStone);
    const purity = product.goldPurity || '24kt';
    return netWeight * parsePurityPercentPublic(purity) * rate;
  }
  if (metalType === 'Silver' && (product.hasSilver || productType === 'silver')) {
    const silverWeight = product.silverWeight || product.weight || 0;
    const netWeight = Math.max(0, silverWeight - totalDiamondWeightCt - lessStone);
    const purity = product.silverPurity || '24kt';
    return netWeight * parsePurityPercentPublic(purity) * rate;
  }
  // Diamonds product with metals in diamonds array
  if (productType === 'diamonds' && Array.isArray(product.diamonds)) {
    const mt = metalType.toLowerCase();
    return (product.diamonds as any[]).reduce((sum: number, d: any) => {
      const dMetal = (d.metalType || '').toString().toLowerCase();
      if (dMetal !== mt) return sum;
      const w = Number(d.metalWeight) || 0;
      const p = parsePurityPercentPublic(d.metalPurity || '24kt');
      return sum + w * p * rate;
    }, 0);
  }
  return 0;
}

