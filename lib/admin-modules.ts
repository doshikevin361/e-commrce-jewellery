/**
 * Staff module keys — must match sidebar `moduleKey` and API path mapping below.
 */
export const STAFF_MODULE_DEFINITIONS: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pricing_commission', label: 'Pricing & Commission' },
  { key: 'vendor_commissions', label: 'Vendor Commission Details' },
  { key: 'products', label: 'Products (catalog, categories, tags, etc.)' },
  { key: 'orders', label: 'Orders' },
  { key: 'b2b_orders', label: 'B2B Orders' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'users', label: 'Users & Roles' },
  { key: 'customers', label: 'Customers' },
  { key: 'retailers', label: 'Retailers (B2B)' },
  { key: 'newsletter', label: 'Newsletter Subscribers' },
  { key: 'custom_jewellery', label: 'Custom Jewellery' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'reports', label: 'Reports & Analytics (SEO)' },
  { key: 'cms', label: 'CMS' },
  { key: 'subscription_settings', label: 'Subscription Settings' },
  { key: 'settings', label: 'Settings' },
  { key: 'commission_compare', label: 'Commission Compare' },
];

const STAFF_PERM_KEY_SET = new Set(STAFF_MODULE_DEFINITIONS.map(m => m.key));

/** Validate staff permission keys from API body */
export function normalizeStaffPermissions(role: string, raw: unknown): string[] {
  if (role !== 'staff') return [];
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(raw.filter((x): x is string => typeof x === 'string' && STAFF_PERM_KEY_SET.has(x))),
  ];
}

/** Longest prefix first so specific routes win */
const API_PREFIX_TO_MODULE: { prefix: string; module: string }[] = [
  { prefix: '/api/admin/subscription-settings', module: 'subscription_settings' },
  { prefix: '/api/admin/vendor-commissions', module: 'vendor_commissions' },
  { prefix: '/api/admin/newsletter-subscribers', module: 'newsletter' },
  { prefix: '/api/admin/custom-jewellery', module: 'custom_jewellery' },
  { prefix: '/api/admin/retailer-products', module: 'b2b_orders' },
  { prefix: '/api/admin/pickup-locations', module: 'orders' },
  { prefix: '/api/admin/orders', module: 'orders' },
  { prefix: '/api/admin/retailers', module: 'retailers' },
  { prefix: '/api/admin/vendor/profile', module: 'commission_compare' },
  { prefix: '/api/admin/vendor/change-password', module: 'commission_compare' },
  { prefix: '/api/admin/vendors', module: 'vendors' },
  { prefix: '/api/admin/users', module: 'users' },
  { prefix: '/api/admin/roles', module: 'users' },
  { prefix: '/api/admin/customers', module: 'customers' },
  { prefix: '/api/admin/coupons', module: 'coupons' },
  { prefix: '/api/admin/cms', module: 'cms' },
  { prefix: '/api/admin/stats', module: 'dashboard' },
  { prefix: '/api/admin/dashboard', module: 'dashboard' },
  { prefix: '/api/admin/metal-prices', module: 'pricing_commission' },
  { prefix: '/api/admin/settings', module: 'settings' },
  { prefix: '/api/admin/products', module: 'products' },
  { prefix: '/api/admin/subcategories', module: 'products' },
  { prefix: '/api/admin/categories', module: 'products' },
  { prefix: '/api/admin/tags', module: 'products' },
  { prefix: '/api/admin/brands', module: 'products' },
  { prefix: '/api/admin/attributes', module: 'products' },
  { prefix: '/api/admin/design-types', module: 'products' },
  { prefix: '/api/admin/diamond-types', module: 'products' },
  { prefix: '/api/admin/diamond-shapes', module: 'products' },
  { prefix: '/api/admin/diamond-colors', module: 'products' },
  { prefix: '/api/admin/karats', module: 'products' },
  { prefix: '/api/admin/purities', module: 'products' },
  { prefix: '/api/admin/metal-colors', module: 'products' },
  { prefix: '/api/admin/clarities', module: 'products' },
  { prefix: '/api/admin/certified-labs', module: 'products' },
  { prefix: '/api/admin/setting-types', module: 'products' },
  { prefix: '/api/admin/gemstone-names', module: 'products' },
  { prefix: '/api/admin/notifications', module: 'dashboard' },
  { prefix: '/api/admin/seo', module: 'reports' },
  { prefix: '/api/commission-compare', module: 'commission_compare' },
  { prefix: '/api/price-compare', module: 'commission_compare' },
  { prefix: '/api/custom-jewellery', module: 'custom_jewellery' },
  { prefix: '/api/subscription/plans', module: 'subscription_settings' },
].sort((a, b) => b.prefix.length - a.prefix.length);

/** Page path → module (for client route guard) */
const PAGE_PREFIX_TO_MODULE: { prefix: string; module: string }[] = [
  { prefix: '/admin/subscription-settings', module: 'subscription_settings' },
  { prefix: '/admin/vendor-commissions', module: 'vendor_commissions' },
  { prefix: '/admin/pricing-settings', module: 'pricing_commission' },
  { prefix: '/admin/newsletter-subscribers', module: 'newsletter' },
  { prefix: '/admin/custom-jewellery', module: 'custom_jewellery' },
  { prefix: '/admin/orders/b2b', module: 'b2b_orders' },
  { prefix: '/admin/pickup-locations', module: 'orders' },
  { prefix: '/admin/orders', module: 'orders' },
  { prefix: '/admin/retailers', module: 'retailers' },
  { prefix: '/admin/vendors', module: 'vendors' },
  { prefix: '/admin/users', module: 'users' },
  { prefix: '/admin/roles', module: 'users' },
  { prefix: '/admin/customers', module: 'customers' },
  { prefix: '/admin/coupons', module: 'coupons' },
  { prefix: '/admin/cms', module: 'cms' },
  { prefix: '/admin/banners', module: 'cms' },
  { prefix: '/admin/policies', module: 'cms' },
  { prefix: '/admin/blog', module: 'cms' },
  { prefix: '/admin/seo', module: 'reports' },
  { prefix: '/admin/price-compare', module: 'commission_compare' },
  { prefix: '/admin/vendor-commission', module: 'commission_compare' },
  { prefix: '/admin/subscription', module: 'commission_compare' },
  { prefix: '/admin/settings', module: 'settings' },
  { prefix: '/admin/products', module: 'products' },
  { prefix: '/admin/subcategories', module: 'products' },
  { prefix: '/admin/categories', module: 'products' },
  { prefix: '/admin/tags', module: 'products' },
  { prefix: '/admin/brands', module: 'products' },
  { prefix: '/admin/attributes', module: 'products' },
  { prefix: '/admin/design-types', module: 'products' },
  { prefix: '/admin/diamond-types', module: 'products' },
  { prefix: '/admin/diamond-shapes', module: 'products' },
  { prefix: '/admin/diamond-colors', module: 'products' },
  { prefix: '/admin/karats', module: 'products' },
  { prefix: '/admin/purities', module: 'products' },
  { prefix: '/admin/metal-colors', module: 'products' },
  { prefix: '/admin/clarities', module: 'products' },
  { prefix: '/admin/certified-labs', module: 'products' },
  { prefix: '/admin/setting-types', module: 'products' },
  { prefix: '/admin/gemstone-names', module: 'products' },
  { prefix: '/admin', module: 'dashboard' },
].sort((a, b) => b.prefix.length - a.prefix.length);

export function resolveApiPathToStaffModule(pathname: string): string | null {
  const path = pathname.split('?')[0];
  for (const { prefix, module } of API_PREFIX_TO_MODULE) {
    if (path === prefix || path.startsWith(prefix + '/')) return module;
  }
  return null;
}

export function resolvePagePathToStaffModule(pathname: string): string | null {
  const path = pathname.split('?')[0];
  for (const { prefix, module } of PAGE_PREFIX_TO_MODULE) {
    if (path === prefix || path.startsWith(prefix + '/')) return module;
  }
  return null;
}

export function staffCanAccessApiPath(permissions: string[] | undefined, pathname: string): boolean {
  const perms = Array.isArray(permissions) ? permissions : [];
  if (perms.length === 0) return false;
  const mod = resolveApiPathToStaffModule(pathname);
  if (!mod) return false;
  return perms.includes(mod);
}

export function staffCanAccessPagePath(permissions: string[] | undefined, pathname: string): boolean {
  const perms = Array.isArray(permissions) ? permissions : [];
  if (perms.length === 0) return false;
  const mod = resolvePagePathToStaffModule(pathname);
  if (!mod) return false;
  return perms.includes(mod);
}

/** First allowed module’s home URL (order = sidebar priority) */
const MODULE_HOME: Record<string, string> = {
  dashboard: '/admin',
  pricing_commission: '/admin/pricing-settings',
  vendor_commissions: '/admin/vendor-commissions',
  products: '/admin/products',
  orders: '/admin/orders',
  b2b_orders: '/admin/orders/b2b',
  coupons: '/admin/coupons',
  users: '/admin/users',
  customers: '/admin/customers',
  retailers: '/admin/retailers',
  newsletter: '/admin/newsletter-subscribers',
  custom_jewellery: '/admin/custom-jewellery',
  vendors: '/admin/vendors',
  reports: '/admin/seo',
  cms: '/admin/cms/logos',
  subscription_settings: '/admin/subscription-settings',
  settings: '/admin/settings',
  commission_compare: '/admin/price-compare',
};

export function getStaffDefaultPath(permissions: string[]): string {
  for (const { key } of STAFF_MODULE_DEFINITIONS) {
    if (permissions.includes(key)) {
      return MODULE_HOME[key] ?? '/admin';
    }
  }
  return '/admin';
}
