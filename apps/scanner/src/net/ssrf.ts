import dns from 'node:dns';
import { isIP, type LookupFunction } from 'node:net';
import { config } from '../config.js';

/**
 * SSRF protection. The scanner fetches arbitrary user-supplied URLs, so every
 * connection must be limited to public internet addresses. Two layers:
 *  1. `assertAllowedUrl` rejects obviously unsafe URLs before any request.
 *  2. `safeLookup` validates the *resolved* IP at connect time, which also
 *     defeats DNS-rebinding and redirects to internal hosts.
 */

export class BlockedAddressError extends Error {
  readonly code = 'WHC_BLOCKED';
  constructor(target: string) {
    super(`Blocked non-public address: ${target}`);
  }
}

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443']);
const BLOCKED_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.lan',
  '.home',
  '.corp',
  '.intranet',
];

function isPublicIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  const [a, b] = parts;
  if (
    parts.length !== 4 ||
    a === undefined ||
    b === undefined ||
    parts.some(Number.isNaN)
  ) {
    return false;
  }
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a === 169 && b === 254) return false; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a >= 224) return false; // multicast + reserved
  return true;
}

function isPublicIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return false;

  const mappedDotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedDotted?.[1]) return isPublicIPv4(mappedDotted[1]);

  const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex?.[1] && mappedHex[2]) {
    const high = parseInt(mappedHex[1], 16);
    const low = parseInt(mappedHex[2], 16);
    return isPublicIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
  }

  if (/^f[cd]/.test(lower)) return false; // unique local
  if (/^fe[89ab]/.test(lower)) return false; // link-local
  if (lower.startsWith('ff')) return false; // multicast
  if (lower.startsWith('2001:db8')) return false; // documentation
  if (lower.startsWith('64:ff9b')) return false; // NAT64
  return true;
}

export function isPublicIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPublicIPv4(ip);
  if (version === 6) return isPublicIPv6(ip);
  return false;
}

/** Throws `BlockedAddressError` if the URL must never be requested. */
export function assertAllowedUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new BlockedAddressError(input);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new BlockedAddressError(input);
  if (config.allowPrivateHosts) return url;

  if (url.username || url.password) throw new BlockedAddressError(url.hostname);
  if (!ALLOWED_PORTS.has(url.port))
    throw new BlockedAddressError(`${url.hostname}:${url.port}`);

  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (isIP(host)) {
    if (!isPublicIp(host)) throw new BlockedAddressError(host);
    return url;
  }
  if (
    host === 'localhost' ||
    !host.includes('.') ||
    BLOCKED_SUFFIXES.some((s) => host.endsWith(s))
  ) {
    throw new BlockedAddressError(host);
  }
  return url;
}

/** DNS lookup that refuses to resolve to non-public addresses. Plug into socket `lookup`. */
export const safeLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, options, (error, address, family) => {
    if (error) {
      (callback as (e: Error | null, a?: unknown, f?: unknown) => void)(
        error,
        address,
        family,
      );
      return;
    }
    const addresses = Array.isArray(address)
      ? address.map((entry) => entry.address)
      : [address];
    if (!config.allowPrivateHosts && !addresses.every((entry) => isPublicIp(entry))) {
      (callback as (e: Error | null) => void)(new BlockedAddressError(hostname));
      return;
    }
    (callback as (e: Error | null, a: unknown, f: unknown) => void)(
      null,
      address,
      family,
    );
  });
};
