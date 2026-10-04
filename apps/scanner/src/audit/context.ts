import type { AssetInfo } from '../crawl/assets.js';
import type { HttpRedirectProbe } from '../crawl/probes.js';
import type { RobotsInfo, SitemapInfo } from '../crawl/site-files.js';
import type { PageSnapshot } from '../crawl/snapshot.js';
import type { HttpClient } from '../net/http-client.js';
import type { TlsInfo } from '../net/tls-info.js';
import type { WebVitals } from '@whc/shared';
import type { BrowserAudit } from '../browser/inspect.js';

/**
 * Everything the audit modules need, gathered up-front by the scan pipeline.
 * Modules are (almost) pure functions of this object, which keeps every rule
 * deterministic and unit-testable.
 */
export interface AuditContext {
  /** URL as the user entered it. */
  requestedUrl: string;
  /** Origin after redirects, e.g. https://www.example.com */
  origin: string;
  hostname: string;
  isHttps: boolean;
  http: HttpClient;

  home: PageSnapshot;
  pages: PageSnapshot[];
  robots: RobotsInfo;
  sitemap: SitemapInfo;
  assets: AssetInfo[];

  tls: TlsInfo | null;
  /** Error code if the certificate was rejected during the scan. */
  invalidCert: string | null;
  httpRedirect: HttpRedirectProbe;
  /** Paths of sensitive files that were publicly readable. */
  exposures: string[];
  /** HTTP status returned for a random non-existent URL. */
  notFoundStatus: number | null;

  /** Rendered-browser results (null when the browser step was skipped or failed). */
  browser: BrowserAudit | null;
  /** Best available Core Web Vitals (PageSpeed Insights, else the local browser). */
  vitals: WebVitals | null;
  /** Filled in by modules as they work; reported back to the user. */
  coverage: { linksFound: number; linksChecked: number };
  /** Coverage notes surfaced to the user (things we could not check). */
  notes: string[];
}

export function pageLabel(page: PageSnapshot): string {
  try {
    const url = new URL(page.finalUrl);
    return url.pathname + url.search || '/';
  } catch {
    return page.finalUrl;
  }
}
