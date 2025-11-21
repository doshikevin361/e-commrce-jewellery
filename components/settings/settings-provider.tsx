'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSiteSettings, type SiteSettings } from '@/lib/site-settings';

type SettingsContextValue = {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateLocal: (partial: Partial<SiteSettings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Try to load from localStorage first to avoid showing defaults
  const getCachedSettings = (): SiteSettings => {
    if (typeof window === 'undefined') return defaultSiteSettings;
    try {
      const cached = localStorage.getItem('siteSettings');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Validate that it has required fields
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSiteSettings, ...parsed };
        }
      }
    } catch (err) {
      console.error('[settings] Failed to load cached settings:', err);
    }
    return defaultSiteSettings;
  };

  const [settings, setSettings] = useState<SiteSettings>(getCachedSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyBrandTokens = useCallback((data: SiteSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', data.primaryColor || defaultSiteSettings.primaryColor);
    root.style.setProperty('--brand-accent', data.accentColor || defaultSiteSettings.accentColor);

    if (data.siteTitle) {
      document.title = data.siteTitle;
    }

    // Handle favicon - remove all existing favicon links first
    const existingFavicons = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
    existingFavicons.forEach(link => link.remove());

    // Add new favicon if provided
    if (data.favicon && data.favicon.trim()) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = data.favicon;
      document.head.appendChild(link);
    }
  }, []);

  // Apply cached settings immediately on mount
  useEffect(() => {
    const cached = getCachedSettings();
    if (cached !== defaultSiteSettings) {
      applyBrandTokens(cached);
    }
  }, [applyBrandTokens]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const payload = await response.json();
      const normalized: SiteSettings = { ...defaultSiteSettings, ...payload };
      setSettings(normalized);
      applyBrandTokens(normalized);
      
      // Cache settings in localStorage for faster initial load
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('siteSettings', JSON.stringify(normalized));
        } catch (err) {
          console.error('[settings] Failed to cache settings:', err);
        }
      }
      
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
      console.error('[settings] refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [applyBrandTokens]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateLocal = useCallback(
    (partial: Partial<SiteSettings>) => {
      setSettings(prev => {
        const next = { ...prev, ...partial };
        applyBrandTokens(next);
        
        // Update cache immediately
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('siteSettings', JSON.stringify(next));
          } catch (err) {
            console.error('[settings] Failed to cache settings:', err);
          }
        }
        
        return next;
      });
    },
    [applyBrandTokens],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      refresh,
      updateLocal,
    }),
    [settings, loading, error, refresh, updateLocal],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

