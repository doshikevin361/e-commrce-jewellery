import type { Browser } from 'puppeteer-core';

/** Dynamic import with a static specifier so the bundler can externalize `@sparticuz/chromium` (see next.config serverExternalPackages). */
async function loadSparticuzChromium(): Promise<{
  executablePath: () => Promise<string>;
  args: string[];
  defaultViewport: { width: number; height: number };
  headless: boolean | 'shell';
} | null> {
  try {
    const mod = await import('@sparticuz/chromium');
    return mod.default ?? null;
  } catch {
    return null;
  }
}

/**
 * Launch Chromium for PDF/screenshot generation.
 * - **Vercel / serverless:** `puppeteer-core` + `@sparticuz/chromium` (dynamic import).
 * - **Local:** full `puppeteer` with downloaded Chrome.
 */
export async function launchInvoiceBrowser(): Promise<Browser> {
  const isServerless =
    process.env.VERCEL === '1' ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.NETLIFY === 'true';

  if (isServerless) {
    const puppeteerCore = await import('puppeteer-core');
    const chromium = await loadSparticuzChromium();
    if (chromium) {
      const executablePath = await chromium.executablePath();
      return puppeteerCore.default.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });
    }
    console.warn(
      '[puppeteer-launch] @sparticuz/chromium not installed or failed to load; falling back to puppeteer (may fail on serverless).'
    );
  }

  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}
