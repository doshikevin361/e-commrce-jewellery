'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const THEME_PRIMARY_VAR = '--theme-primary';
const THEME_SECONDARY_VAR = '--theme-secondary';
const WEB_VAR = '--web';

const STORAGE_KEY_PRIMARY = 'website-theme-primary';
const STORAGE_KEY_SECONDARY = 'website-theme-secondary';

const DEFAULT_PRIMARY = '#001e38';
const DEFAULT_SECONDARY = '#C8A15B';

function getStoredTheme(): { primary: string; secondary: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const primary = localStorage.getItem(STORAGE_KEY_PRIMARY);
    const secondary = localStorage.getItem(STORAGE_KEY_SECONDARY);
    if (primary && secondary) return { primary, secondary };
  } catch {
    // ignore
  }
  return null;
}

function setStoredTheme(primary: string, secondary: string) {
  try {
    localStorage.setItem(STORAGE_KEY_PRIMARY, primary);
    localStorage.setItem(STORAGE_KEY_SECONDARY, secondary);
  } catch {
    // ignore
  }
}

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

    // On refresh: apply stored colors immediately so we don't flash default
    const stored = getStoredTheme();
    if (stored) {
      apply(stored.primary, stored.secondary);
    } else {
      // First visit: use defaults until API returns
      apply(DEFAULT_PRIMARY, DEFAULT_SECONDARY);
    }

    const load = async () => {
      try {
        const res = await fetch('/api/public/theme', { cache: 'no-store' });
        const data = await res.json();
        const primary = (data.primaryColor || DEFAULT_PRIMARY).toString().trim() || DEFAULT_PRIMARY;
        const secondary = (data.secondaryColor || DEFAULT_SECONDARY).toString().trim() || DEFAULT_SECONDARY;
        apply(primary, secondary);
        setStoredTheme(primary, secondary);
      } catch {
        // Keep current theme (stored or default); don't overwrite localStorage on error
      }
    };

    load();
  }, [pathname]);

  return null;
}
