import { load, type CheerioAPI } from 'cheerio';
import {
  headerValue,
  type FetchResult,
  type Headers,
  type RedirectHop,
} from '../net/http-client.js';

/** A fetched, parsed HTML page. The unit every audit module works on. */
export interface PageSnapshot {
  url: string;
  finalUrl: string;
  status: number;
  headers: Headers;
  html: string;
  $: CheerioAPI;
  ttfbMs: number;
  wireBytes: number;
  htmlBytes: number;
  redirects: RedirectHop[];
}

export function isHtmlResult(result: FetchResult): boolean {
  const type = headerValue(result.headers, 'content-type') ?? '';
  return (
    type.includes('html') || (type === '' && result.body.trimStart().startsWith('<'))
  );
}

export function buildSnapshot(result: FetchResult): PageSnapshot {
  return {
    url: result.url,
    finalUrl: result.finalUrl,
    status: result.status,
    headers: result.headers,
    html: result.body,
    $: load(result.body),
    ttfbMs: result.ttfbMs,
    wireBytes: result.wireBytes,
    htmlBytes: Buffer.byteLength(result.body, 'utf8'),
    redirects: result.redirects,
  };
}
