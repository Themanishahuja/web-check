import { config } from '../config.js';
import { headerValue, type HttpClient } from '../net/http-client.js';
import { mapPool } from '../util/pool.js';
import type { PageSnapshot } from './snapshot.js';

export type AssetKind = 'css' | 'js' | 'image';

export interface AssetInfo {
  url: string;
  kind: AssetKind;
  sameOrigin: boolean;
  status: number | null;
  /** Transfer size when known. */
  bytes: number | null;
  encoding?: string;
  cacheControl?: string;
  contentType?: string;
  /** Stylesheet source, for same-origin CSS only (used for CSS-level checks). */
  css?: string;
}

interface AssetRef {
  url: string;
  kind: AssetKind;
}

function collectRefs(page: PageSnapshot): AssetRef[] {
  const { $ } = page;
  const refs: AssetRef[] = [];
  const seen = new Set<string>();

  const add = (raw: string | undefined, kind: AssetKind) => {
    if (!raw || raw.startsWith('data:')) return;
    try {
      const url = new URL(raw, page.finalUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      url.hash = '';
      if (seen.has(url.href)) return;
      seen.add(url.href);
      refs.push({ url: url.href, kind });
    } catch {
      // ignore malformed URLs; the links module reports them
    }
  };

  $('link[rel~="stylesheet"][href]').each((_, el) => add($(el).attr('href'), 'css'));
  $('script[src]').each((_, el) => add($(el).attr('src'), 'js'));
  $('img[src]').each((_, el) => add($(el).attr('src'), 'image'));

  const css = refs.filter((r) => r.kind === 'css');
  const js = refs.filter((r) => r.kind === 'js');
  const images = refs.filter((r) => r.kind === 'image');
  const budget = config.assets.maxCount;
  return [
    ...css.slice(0, 8),
    ...js.slice(0, 8),
    ...images.slice(0, Math.max(8, budget - 16)),
  ].slice(0, budget);
}

/** Measure the homepage's CSS / JS / image files (HEAD requests; stylesheets are also read). */
export async function collectAssets(
  http: HttpClient,
  home: PageSnapshot,
): Promise<AssetInfo[]> {
  const homeOrigin = new URL(home.finalUrl).origin;
  const refs = collectRefs(home);
  let cssBodies = 0;

  return mapPool(refs, config.assets.concurrency, async (ref): Promise<AssetInfo> => {
    const sameOrigin = new URL(ref.url).origin === homeOrigin;
    const base: AssetInfo = {
      url: ref.url,
      kind: ref.kind,
      sameOrigin,
      status: null,
      bytes: null,
    };
    const readCss =
      ref.kind === 'css' && sameOrigin && cssBodies < config.assets.maxCssBodies;
    if (readCss) cssBodies += 1;

    try {
      const result = await http.fetch(ref.url, {
        method: readCss ? 'GET' : 'HEAD',
        maxBytes: config.assets.maxCssBytes,
        timeoutMs: 8_000,
        headers: { accept: '*/*', referer: home.finalUrl },
      });
      const declared = Number(headerValue(result.headers, 'content-length'));
      return {
        ...base,
        status: result.status,
        bytes:
          Number.isFinite(declared) && declared > 0 ? declared : result.wireBytes || null,
        encoding: headerValue(result.headers, 'content-encoding'),
        cacheControl: headerValue(result.headers, 'cache-control'),
        contentType: headerValue(result.headers, 'content-type'),
        css: readCss && result.status < 400 ? result.body : undefined,
      };
    } catch {
      return base;
    }
  });
}
