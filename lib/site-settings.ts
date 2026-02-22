export type ProductTypeCommissions = {
  Gold: number;
  Silver: number;
  Platinum: number;
  Gemstone: number;
  Diamonds: number;
  Imitation: number;
};

export type CommissionRow = {
  productType: string;
  category: string;
  designType: string;
  metal: string;
  purityKarat: string;
  vendorCommission: number;
  platformCommission: number;
};

export type SiteSettings = {
  siteName: string;
  siteTitle: string;
  tagline: string;
  adminPrimaryColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
  productTypeCommissions: ProductTypeCommissions;
  commissionRows?: CommissionRow[];
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "Grocify Admin",
  siteTitle: "Grocify – Admin Panel",
  tagline: "Manage every part of your storefront",
  adminPrimaryColor: "#16a34a",
  primaryColor: "#001e38",
  secondaryColor: "#C8A15B",
  accentColor: "#0f172a",
  logo: "",
  favicon: "",
  productTypeCommissions: {
    Gold: 5,
    Silver: 4,
    Platinum: 6,
    Gemstone: 8,
    Diamonds: 10,
    Imitation: 3,
  },
  commissionRows: [],
};
