export type SiteSettings = {
  siteName: string;
  siteTitle: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
  defaultVendorCommissionRate: number;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "Grocify Admin",
  siteTitle: "Grocify – Admin Panel",
  tagline: "Manage every part of your storefront",
  primaryColor: "#16a34a",
  accentColor: "#0f172a",
  logo: "",
  favicon: "",
  defaultVendorCommissionRate: 5,
};
