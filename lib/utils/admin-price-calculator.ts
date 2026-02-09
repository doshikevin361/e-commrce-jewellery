type RateOverrides = {
  goldRate?: number;
  silverRate?: number;
  platinumRate?: number;
  platformCommissionRate?: number;
};

// Helper function to calculate product price (same logic as in product-form-page.tsx)
export function calculateAdminProductPrice(
  product: any,
  overrides: RateOverrides = {}
): number {
  const PURITY_MAP: Record<string, number> = {
    '24kt': 1,
    '22kt': 0.92,
    '20kt': 0.84,
    '18kt': 0.75,
    '14kt': 0.583,
    '80%': 0.8,
  };

  const parsePurityPercent = (purity: string): number => {
    if (!purity) return 1;
    const lower = purity.toLowerCase().trim();
    if (PURITY_MAP[lower] !== undefined) return PURITY_MAP[lower];
    const numeric = parseFloat(purity);
    if (isFinite(numeric)) {
      // If user enters a percentage (e.g., 92), treat >24 as percent/100.
      if (numeric > 24) return Math.min(numeric / 100, 1);
      // If user enters karat (e.g., 22), convert to 24k scale.
      if (numeric > 0 && numeric <= 24) return numeric / 24;
    }
    return 1;
  };

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
      overrides.platinumRate ?? product.goldRatePerGram ?? 0; // Platinum uses goldRatePerGram field
    const platinumPurity = product.goldPurity || '24kt'; // Platinum uses goldPurity field
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
    const silverRatePerGram =
      overrides.silverRate ?? product.silverRatePerGram ?? 0;
    const silverPurity = product.silverPurity || '24kt';
    const purityPercent = parsePurityPercent(silverPurity);
    const purityMetalRate = silverRatePerGram * purityPercent;

    silverValue = silverWeight * purityMetalRate;
    makingChargesValue =
      silverWeight * (product.makingChargePerGram || 0);
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

