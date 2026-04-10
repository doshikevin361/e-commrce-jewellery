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

/** Bundled brand files in /public */
export const BRAND_LOGO_PATH = '/jewel-manas-logo.png';
export const BRAND_FAVICON_PATH = '/favicon.png';

export const defaultSiteSettings: SiteSettings = {
  siteName: 'Jewels Manas Admin',
  siteTitle: 'Jewels Manas – Admin Panel',
  tagline: 'Manage every part of your storefront',
  adminPrimaryColor: '#16a34a',
  primaryColor: '#001e38',
  secondaryColor: '#C8A15B',
  accentColor: '#0f172a',
  logo: BRAND_LOGO_PATH,
  favicon: BRAND_FAVICON_PATH,
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
