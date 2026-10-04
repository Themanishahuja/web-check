import { constants, brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';
import { Agent, request, type Dispatcher } from 'undici';
import { config } from '../config.js';
import { BlockedAddressError, assertAllowedUrl, safeLookup } from './ssrf.js';

export type HeaderValue = string | string[] | undefined;
export type Headers = Record<string, HeaderValue>;

export type FetchErrorCode =
  'timeout' | 'dns' | 'blocked' | 'connection' | 'tls' | 'too-many-redirects' | 'unknown';

export class FetchError extends Error {
  constructor(
    readonly code: FetchErrorCode,
    message: string,
    /** Underlying low-level error code (e.g. CERT_HAS_EXPIRED), when known. */
    readonly detail?: string,
  ) {
    super(message);
  }
}

export interface RedirectHop {
  url: string;
  status: number;
}

export interface FetchOptions {
  method?: 'GET' | 'HEAD';
  followRedirects?: boolean;
  /** Maximum bytes of response body to read. */
  maxBytes?: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export interface FetchResult {
  url: string;
  finalUrl: string;
  status: number;
  headers: Headers;
  /** Decoded text body (empty for non-text content and HEAD requests). */
  body: string;
  wireBytes: number;
  truncated: boolean;
  ttfbMs: number;
  totalMs: number;
  redirects: RedirectHop[];
}

const TEXT_TYPE = /(text\/|json|xml|javascript|ecmascript)/i;
const TLS_CODES = new Set([
  'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'CERT_NOT_YET_VALID',
  'ERR_SSL_WRONG_VERSION_NUMBER',
]);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export function headerValue(headers: Headers, name: string): string | undefined {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function headerValues(headers: Headers, name: string): string[] {
  const value = headers[name.toLowerCase()];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function classifyError(error: unknown): FetchError {
  if (error instanceof FetchError) return error;
  if (error instanceof BlockedAddressError)
    return new FetchError('blocked', error.message);
  const code =
    (error as { code?: string; cause?: { code?: string } })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  const name = (error as { name?: string })?.name;
  if (name === 'TimeoutError' || name === 'AbortError' || code?.includes('TIMEOUT')) {
    return new FetchError('timeout', 'The request timed out', code);
  }
  if (code === 'WHC_BLOCKED')
    return new FetchError('blocked', 'Blocked non-public address', code);
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN')
    return new FetchError('dns', 'The domain could not be found', code);
  if (code && TLS_CODES.has(code))
    return new FetchError('tls', 'The SSL/TLS certificate is not valid', code);
  if (
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'EHOSTUNREACH' ||
    code === 'ENETUNREACH' ||
    code?.startsWith('UND_ERR')
  ) {
    return new FetchError('connection', 'Could not connect to the server', code);
  }
  return new FetchError(
    'unknown',
    error instanceof Error ? error.message : 'Request failed',
    code,
  );
}

function decode(buffer: Buffer, encoding: string | undefined): Buffer {
  if (!encoding || encoding === 'identity') return buffer;
  const limit = { maxOutputLength: config.crawl.maxBodyBytes * 6 };
  try {
    if (encoding.includes('br')) return brotliDecompressSync(buffer, limit);
    if (encoding.includes('gzip')) {
      return gunzipSync(buffer, { ...limit, finishFlush: constants.Z_SYNC_FLUSH });
    }
    if (encoding.includes('deflate')) {
      return inflateSync(buffer, { ...limit, finishFlush: constants.Z_SYNC_FLUSH });
    }
  } catch {
    return Buffer.alloc(0);
  }
  return buffer;
}

/**
 * HTTP client for the scanner. Every connection passes through `safeLookup`
 * and every URL through `assertAllowedUrl`. Redirects are followed manually so
 * each hop is re-validated and recorded.
 */
export class HttpClient {
  /** Set when the site's certificate is invalid so the scan can continue and report it. */
  allowInvalidCerts = false;

  private readonly strict: Dispatcher = new Agent({
    connect: { lookup: safeLookup, timeout: 8_000 },
    keepAliveTimeout: 2_000,
  });

  private readonly lenient: Dispatcher = new Agent({
    connect: { lookup: safeLookup, timeout: 8_000, rejectUnauthorized: false },
    keepAliveTimeout: 2_000,
  });

  async fetch(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    const {
      method = 'GET',
      followRedirects = true,
      maxBytes = config.crawl.maxBodyBytes,
      timeoutMs = config.crawl.requestTimeoutMs,
      headers = {},
    } = options;

    const startedAt = performance.now();
    const signal = AbortSignal.timeout(timeoutMs);
    const redirects: RedirectHop[] = [];
    let current = url;

    try {
      for (let hop = 0; hop <= config.crawl.maxRedirects; hop += 1) {
        assertAllowedUrl(current);
        const hopStartedAt = performance.now();
        const response = await request(current, {
          method,
          signal,
          dispatcher: this.allowInvalidCerts ? this.lenient : this.strict,
          headers: {
            'user-agent': config.userAgent,
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-encoding': 'gzip, br',
            ...headers,
          },
        });
        const ttfbMs = performance.now() - hopStartedAt;
        const location = headerValue(response.headers, 'location');

        if (followRedirects && REDIRECT_STATUSES.has(response.statusCode) && location) {
          await response.body.dump({ limit: 4096 }).catch(() => undefined);
          redirects.push({ url: current, status: response.statusCode });
          current = new URL(location, current).href;
          continue;
        }

        const contentType = headerValue(response.headers, 'content-type') ?? '';
        const contentEncoding = headerValue(
          response.headers,
          'content-encoding',
        )?.toLowerCase();
        const chunks: Buffer[] = [];
        let wireBytes = 0;
        let truncated = false;

        if (method === 'HEAD') {
          await response.body.dump({ limit: 1024 }).catch(() => undefined);
        } else {
          for await (const chunk of response.body) {
            const piece = chunk as Buffer;
            wireBytes += piece.length;
            chunks.push(piece);
            if (wireBytes > maxBytes) {
              truncated = true;
              response.body.destroy();
              break;
            }
          }
        }

        const readText =
          method === 'GET' && (TEXT_TYPE.test(contentType) || contentType === '');
        const body = readText
          ? decode(Buffer.concat(chunks), contentEncoding).toString('utf8')
          : '';

        return {
          url,
          finalUrl: current,
          status: response.statusCode,
          headers: response.headers,
          body,
          wireBytes,
          truncated,
          ttfbMs,
          totalMs: performance.now() - startedAt,
          redirects,
        };
      }
      throw new FetchError('too-many-redirects', 'Too many redirects');
    } catch (error) {
      throw classifyError(error);
    }
  }

  async close(): Promise<void> {
    await Promise.all([this.strict.close(), this.lenient.close()]);
  }
}
