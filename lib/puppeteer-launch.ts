import type { Browser } from 'puppeteer-core';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);

/** Avoid a literal `@sparticuz/chromium` string so Turbopack/Webpack do not resolve it at build time. */
function loadSparticuzChromiumSync(): {
  default: {
    executablePath: () => Promise<string>;
    args: string[];
    defaultViewport: { width: number; height: number };
    headless: boolean | 'shell';
  };
} | null {
  try {
    const at = String.fromCharCode(64);
    const pkg = `${at}sparticuz/chromium`;
    return nodeRequire(pkg);
  } catch {
    return null;
  }
}

/**
 * Launch Chromium for PDF/screenshot generation.
 * - **Vercel / serverless:** `puppeteer-core` + `@sparticuz/chromium` (loaded via require, not import).
 * - **Local:** full `puppeteer` with downloaded Chrome.
 */
export async function launchInvoiceBrowser(): Promise<Browser> {
  const isServerless =
    process.env.VERCEL === '1' ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.NETLIFY === 'true';

  if (isServerless) {
    const puppeteerCore = await import('puppeteer-core');
    const chromiumMod = loadSparticuzChromiumSync();
    if (chromiumMod?.default) {
      const chromium = chromiumMod.default;
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
