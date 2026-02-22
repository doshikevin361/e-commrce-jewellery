'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const THEME_PRIMARY_VAR = '--theme-primary';
const THEME_SECONDARY_VAR = '--theme-secondary';
const WEB_VAR = '--web';

const DEFAULT_PRIMARY = '#001e38';
const DEFAULT_SECONDARY = '#C8A15B';

export function PublicThemeLoader() {
  const pathname = usePathname();

  useEffect(() => {
    // Do not apply theme on admin (or login/vendor) routes so admin panel primary stays fixed
    const isAdminRoute =
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/vendors') ||
      pathname?.startsWith('/become-vendor') ||
      pathname?.startsWith('/vendor-registration');
    if (isAdminRoute) return;

    const apply = (primary: string, secondary: string) => {
      const root = document.documentElement;
      root.style.setProperty(THEME_PRIMARY_VAR, primary);
      root.style.setProperty(THEME_SECONDARY_VAR, secondary);
      root.style.setProperty(WEB_VAR, primary);
    };

    const load = async () => {
      try {
        const res = await fetch('/api/public/theme', { cache: 'no-store' });
        const data = await res.json();
        const primary = data.primaryColor || DEFAULT_PRIMARY;
        const secondary = data.secondaryColor || DEFAULT_SECONDARY;
        apply(primary, secondary);
      } catch {
        apply(DEFAULT_PRIMARY, DEFAULT_SECONDARY);
      }
    };

    load();
  }, [pathname]);

  return null;
}
