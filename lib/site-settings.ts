export type ProductTypeCommissions = {
  Gold: number;
  Silver: number;
  Platinum: number;
  Gemstone: number;
  Diamonds: number;
  Imitation: number;
};

export type SiteSettings = {
  siteName: string;
  siteTitle: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
  productTypeCommissions: ProductTypeCommissions;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "Grocify Admin",
  siteTitle: "Grocify – Admin Panel",
  tagline: "Manage every part of your storefront",
  primaryColor: "#16a34a",
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
};
