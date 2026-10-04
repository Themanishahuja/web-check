import { withBrowser } from '../browser/browser-manager.js';
import { config } from '../config.js';

export class PdfUnavailableError extends Error {}

let cachedWebUrl: string | undefined;
const WEB_APP_MARKER = 'Website Health Checker';

/** The web app's base URL: WEB_URL if set, otherwise the first CORS origin that answers. */
async function resolveWebUrl(): Promise<string> {
  if (cachedWebUrl) return cachedWebUrl;
  const candidates = config.pdf.webUrl ? [config.pdf.webUrl] : config.corsOrigins;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { signal: AbortSignal.timeout(2_500) });
      // Another project may own a port (e.g. :3000), so confirm it is really this site.
      if (response.ok && (await response.text()).includes(WEB_APP_MARKER)) {
        cachedWebUrl = candidate.replace(/\/$/, '');
        return cachedWebUrl;
      }
    } catch {
      // try the next candidate
    }
  }
  throw new PdfUnavailableError(
    'The report page could not be reached to render the PDF.',
  );
}

const footer = (host: string) => `
  <div style="width:100%;padding:0 14mm;font-family:Helvetica,Arial,sans-serif;font-size:8px;color:#8a8676;display:flex;justify-content:space-between;">
    <span>Website Health Checker · ${host}</span>
    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
  </div>`;

/**
 * Renders the print view of a finished report to an A4 PDF using the same
 * components as the on-screen report, so the two can never drift apart.
 * The page may only talk to the web app and to this API — everything else is blocked.
 */
export async function renderReportPdf(scanId: string, hostname: string): Promise<Buffer> {
  const webUrl = await resolveWebUrl();
  const allowedOrigins = new Set([
    new URL(webUrl).origin,
    new URL(config.pdf.apiUrl).origin,
  ]);
  const safeHost = hostname.replace(/[^a-z0-9.-]/gi, '');

  return withBrowser(async (browser) => {
    const context = await browser.newContext({
      viewport: { width: 794, height: 1123 },
      serviceWorkers: 'block',
    });
    try {
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        const local = url.protocol === 'data:' || url.protocol === 'blob:';
        return local || allowedOrigins.has(url.origin) ? route.continue() : route.abort();
      });

      const page = await context.newPage();
      await page.goto(`${webUrl}/report/${encodeURIComponent(scanId)}/print`, {
        waitUntil: 'domcontentloaded',
        timeout: config.pdf.timeoutMs,
      });
      await page.waitForSelector('[data-report-ready="true"]', {
        timeout: config.pdf.timeoutMs,
      });
      await page.evaluate('document.fonts.ready.then(() => true)');
      await page.emulateMedia({ media: 'print' });

      return await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', bottom: '18mm', left: '14mm', right: '14mm' },
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: footer(safeHost),
      });
    } finally {
      await context.close().catch(() => undefined);
    }
  });
}
