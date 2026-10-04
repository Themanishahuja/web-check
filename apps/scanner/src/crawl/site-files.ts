import { load } from 'cheerio';
import type { HttpClient } from '../net/http-client.js';

export interface RobotsInfo {
  found: boolean;
  status: number | null;
  /** `User-agent: *` is disallowed from the entire site. */
  blocksAll: boolean;
  sitemaps: string[];
}

export interface SitemapInfo {
  found: boolean;
  url: string | null;
  urlCount: number;
  /** URLs listed in the sitemap (capped), used to seed the crawl. */
  urls: string[];
}

const EMPTY_ROBOTS: RobotsInfo = {
  found: false,
  status: null,
  blocksAll: false,
  sitemaps: [],
};

function parseRobots(text: string): Pick<RobotsInfo, 'blocksAll' | 'sitemaps'> {
  const sitemaps: string[] = [];
  let appliesToAll = false;
  let blocksAll = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0]?.trim() ?? '';
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'user-agent') appliesToAll = value === '*';
    else if (field === 'disallow' && appliesToAll && value === '/') blocksAll = true;
    else if (field === 'sitemap' && value) sitemaps.push(value);
  }
  return { blocksAll, sitemaps };
}

export async function fetchRobots(http: HttpClient, origin: string): Promise<RobotsInfo> {
  try {
    const result = await http.fetch(`${origin}/robots.txt`, {
      maxBytes: 200_000,
      timeoutMs: 6_000,
    });
    const looksLikeHtml = /^\s*<(!doctype|html)/i.test(result.body);
    if (result.status !== 200 || looksLikeHtml)
      return { ...EMPTY_ROBOTS, status: result.status };
    return { found: true, status: result.status, ...parseRobots(result.body) };
  } catch {
    return EMPTY_ROBOTS;
  }
}

export async function fetchSitemap(
  http: HttpClient,
  origin: string,
  declared: string[],
): Promise<SitemapInfo> {
  const candidates = [...declared, `${origin}/sitemap.xml`];
  for (const candidate of candidates.slice(0, 3)) {
    try {
      const result = await http.fetch(candidate, {
        maxBytes: 1_000_000,
        timeoutMs: 8_000,
      });
      if (result.status !== 200 || !/<(urlset|sitemapindex)/i.test(result.body)) continue;

      const $ = load(result.body, { xmlMode: true });
      const urls = $('url > loc')
        .map((_, el) => $(el).text().trim())
        .get();
      const nested = $('sitemap > loc').length;
      return {
        found: true,
        url: candidate,
        urlCount: urls.length > 0 ? urls.length : nested,
        urls: urls.slice(0, 200),
      };
    } catch {
      continue;
    }
  }
  return { found: false, url: null, urlCount: 0, urls: [] };
}
