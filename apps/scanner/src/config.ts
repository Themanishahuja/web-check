import { SCAN_LIMITS } from '@whc/shared';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env files (repo root, then apps/scanner). Real environment variables always win.
const here = path.dirname(fileURLToPath(import.meta.url));
for (const file of [path.resolve(here, '../../../.env'), path.resolve(here, '../.env')]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== ''
    ? parsed
    : fallback;
};

export const config = {
  port: num(process.env.PORT, 4100),
  host: process.env.HOST ?? '0.0.0.0',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  /** DEV ONLY: allow scanning localhost / private networks. Never enable in production. */
  allowPrivateHosts: process.env.ALLOW_PRIVATE_HOSTS === 'true',

  crawl: {
    maxPages: num(process.env.MAX_PAGES, SCAN_LIMITS.pages),
    concurrency: 3,
    maxRedirects: 5,
    requestTimeoutMs: 10_000,
    maxBodyBytes: 2_000_000,
  },

  assets: {
    maxCount: 24,
    maxCssBodies: 4,
    maxCssBytes: 300_000,
    concurrency: 6,
  },

  links: {
    maxChecked: num(process.env.MAX_LINKS, SCAN_LIMITS.links),
    concurrency: 8,
    timeoutMs: 8_000,
  },

  scans: {
    maxConcurrent: num(process.env.MAX_CONCURRENT_SCANS, 3),
    maxQueued: 20,
    /** Reports live in memory only (no database) and are discarded after this. */
    reportTtlMs: SCAN_LIMITS.reportMinutes * 60 * 1000,
  },

  rateLimit: {
    max: num(process.env.RATE_LIMIT_MAX, SCAN_LIMITS.scansPerMinute),
    timeWindow: '1 minute',
  },

  pageSpeed: {
    apiKey: process.env.PSI_API_KEY,
    enabled: process.env.ENABLE_PAGESPEED === 'true' || Boolean(process.env.PSI_API_KEY),
    timeoutMs: 50_000,
  },

  browser: {
    enabled: process.env.ENABLE_BROWSER !== 'false',
    maxConcurrent: num(process.env.BROWSER_CONCURRENCY, 2),
    /** Needed when running as root inside a container. */
    noSandbox: process.env.BROWSER_NO_SANDBOX === 'true',
    navigationTimeoutMs: 25_000,
    totalTimeoutMs: 60_000,
    /** Pages (homepage first) checked with axe-core. */
    axePages: SCAN_LIMITS.accessibilityPages,
  },

  pdf: {
    /** Where the web app is reachable from this machine. Auto-detected from CORS_ORIGIN if unset. */
    webUrl: process.env.WEB_URL,
    /** Where this API is reachable *from the browser that renders the PDF*. */
    apiUrl:
      process.env.PUBLIC_API_URL ?? `http://localhost:${num(process.env.PORT, 4100)}`,
    timeoutMs: 45_000,
  },

  /** Identifies our traffic; the URL must point at the public /bot page. */
  /** Hostnames that asked not to be scanned (comma-separated BLOCKED_HOSTS). Subdomains are included. */
  blockedHosts: (process.env.BLOCKED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),

  userAgent: `WebsiteHealthChecker/1.0 (+${process.env.SCANNER_INFO_URL ?? 'https://websitehealthchecker.example/bot'})`,
} as const;
