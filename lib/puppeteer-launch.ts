import type { Browser } from 'puppeteer-core';

/**
 * Launch Chromium for PDF/screenshot generation.
 * - **Vercel / serverless:** uses `puppeteer-core` + `@sparticuz/chromium` (no bundled Chrome).
 * - **Local:** uses full `puppeteer` with downloaded Chrome.
 */
export async function launchInvoiceBrowser(): Promise<Browser> {
  const isServerless =
    process.env.VERCEL === '1' ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
    process.env.NETLIFY === 'true';

  if (isServerless) {
    const puppeteerCore = await import('puppeteer-core');
    const chromium = (await import('@sparticuz/chromium')).default;
    const executablePath = await chromium.executablePath();
    return puppeteerCore.default.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}
