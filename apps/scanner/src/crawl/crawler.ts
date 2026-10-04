import { config } from '../config.js';
import { FetchError, type HttpClient } from '../net/http-client.js';
import { mapPool } from '../util/pool.js';
import { buildSnapshot, isHtmlResult, type PageSnapshot } from './snapshot.js';

export class ScanError extends Error {}

const NON_PAGE_EXTENSION =
  /\.(pdf|jpe?g|png|gif|webp|avif|svg|ico|zip|gz|mp4|mp3|webm|css|js|json|xml|txt|docx?|xlsx?|pptx?)$/i;

const REASONS: Record<string, string> = {
  dns: 'the domain could not be found',
  timeout:
    'the connection timed out. The site may be down, overloaded, or blocking automated tools — try opening it in your browser',
  connection:
    'the server refused or dropped the connection. The site may be down or blocking automated tools',
  blocked: 'that address cannot be scanned',
  tls: 'its SSL/TLS certificate is invalid',
};

/** Failures where trying plain HTTP instead of HTTPS can still produce a useful scan. */
const isUnreachable = (error: unknown) =>
  error instanceof FetchError &&
  (error.code === 'timeout' || error.code === 'connection');

export interface HomeFetch {
  /** True when HTTPS could not be reached and the scan fell back to plain HTTP. */
  fellBackToHttp: boolean;
  home: PageSnapshot;
  /** Populated when the certificate was invalid and the scan continued in lenient mode. */
  invalidCert: string | null;
}

/** Fetch the entry page. If TLS fails we retry leniently so the problem can be reported, not just fail. */
export async function fetchHome(http: HttpClient, url: string): Promise<HomeFetch> {
  let invalidCert: string | null = null;
  let fellBackToHttp = false;

  const attempt = () => http.fetch(url);
  let result;
  try {
    result = await attempt();
  } catch (error) {
    if (isUnreachable(error) && url.startsWith('https://')) {
      // Some sites only answer on port 80. Try that once; the report will flag the missing HTTPS.
      try {
        result = await http.fetch(url.replace(/^https:/, 'http:'));
        fellBackToHttp = true;
      } catch {
        throw toScanError(error);
      }
    } else if (error instanceof FetchError && error.code === 'tls') {
      invalidCert = error.detail ?? 'invalid certificate';
      http.allowInvalidCerts = true;
      try {
        result = await attempt();
      } catch (retryError) {
        throw toScanError(retryError);
      }
    } else {
      throw toScanError(error);
    }
  }

  if (result.status >= 400) {
    throw new ScanError(
      `The homepage returned HTTP ${result.status}, so it could not be audited.`,
    );
  }
  if (!isHtmlResult(result)) {
    throw new ScanError('That address did not return an HTML web page.');
  }
  return { home: buildSnapshot(result), invalidCert, fellBackToHttp };
}

function toScanError(error: unknown): ScanError {
  if (error instanceof ScanError) return error;
  if (error instanceof FetchError) {
    return new ScanError(
      `We couldn’t reach this website: ${REASONS[error.code] ?? error.message}.`,
    );
  }
  return new ScanError('We couldn’t reach this website.');
}

function sameSite(candidate: string, hostname: string): boolean {
  const bare = (host: string) => host.replace(/^www\./, '');
  return bare(candidate) === bare(hostname);
}

/** Internal page links found on `page`, de-duplicated and ordered shallow-first. */
export function discoverInternalLinks(page: PageSnapshot, hostname: string): string[] {
  const seen = new Set<string>();
  const found: string[] = [];

  page.$('a[href]').each((_, element) => {
    const href = page.$(element).attr('href');
    if (!href) return;
    let resolved: URL;
    try {
      resolved = new URL(href, page.finalUrl);
    } catch {
      return;
    }
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return;
    if (
      !sameSite(resolved.hostname, hostname) ||
      NON_PAGE_EXTENSION.test(resolved.pathname)
    )
      return;

    resolved.hash = '';
    const key = resolved.href.replace(/\/$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    found.push(resolved.href);
  });

  const depth = (href: string) =>
    new URL(href).pathname.split('/').filter(Boolean).length;
  return found.sort((a, b) => depth(a) - depth(b));
}

/** Crawl up to `maxPages` HTML pages starting from the already-fetched homepage. */
export async function crawlSite(
  http: HttpClient,
  home: PageSnapshot,
  hostname: string,
  sitemapUrls: string[],
  onPage: (done: number, total: number) => void,
): Promise<PageSnapshot[]> {
  const homeKey = home.finalUrl.replace(/\/$/, '');
  const candidates = [...discoverInternalLinks(home, hostname), ...sitemapUrls]
    .filter((href) => {
      try {
        const parsed = new URL(href);
        return sameSite(parsed.hostname, hostname) && href.replace(/\/$/, '') !== homeKey;
      } catch {
        return false;
      }
    })
    .filter((href, index, all) => all.indexOf(href) === index)
    .slice(0, (config.crawl.maxPages - 1) * 2);

  const pages: PageSnapshot[] = [home];
  const budget = config.crawl.maxPages - 1;
  let attempted = 0;
  onPage(1, config.crawl.maxPages);

  await mapPool(candidates, config.crawl.concurrency, async (href) => {
    if (pages.length - 1 >= budget || attempted >= candidates.length) return;
    attempted += 1;
    try {
      const result = await http.fetch(href);
      if (result.status < 400 && isHtmlResult(result) && pages.length - 1 < budget) {
        pages.push(buildSnapshot(result));
        onPage(pages.length, config.crawl.maxPages);
      }
    } catch {
      // Unreachable pages are reported by the links module, not the crawler.
    }
  });

  return pages;
}
