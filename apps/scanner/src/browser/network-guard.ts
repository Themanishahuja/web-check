import dns from 'node:dns/promises';
import type { BrowserContext } from 'playwright';
import { config } from '../config.js';
import { assertAllowedUrl, isPublicIp } from '../net/ssrf.js';

/**
 * The scanner's HTTP client is SSRF-safe, but a real browser opens its own
 * connections. This guard vets every request the page makes (including
 * sub-resources and redirects) before it leaves the machine.
 *
 * Note: this checks DNS at request time, so a hostile DNS server could still
 * rebind between check and connect. In production, run the scanner in a
 * network-isolated container with no route to internal services.
 */
export async function installNetworkGuard(context: BrowserContext): Promise<void> {
  const verdicts = new Map<string, Promise<boolean>>();

  const isHostAllowed = (url: URL): Promise<boolean> => {
    const cached = verdicts.get(url.hostname);
    if (cached) return cached;
    const verdict = (async () => {
      try {
        assertAllowedUrl(url.href);
        if (config.allowPrivateHosts) return true;
        const records = await dns.lookup(url.hostname, { all: true });
        return (
          records.length > 0 && records.every((record) => isPublicIp(record.address))
        );
      } catch {
        return false;
      }
    })();
    verdicts.set(url.hostname, verdict);
    return verdict;
  };

  await context.route('**/*', async (route) => {
    let url: URL;
    try {
      url = new URL(route.request().url());
    } catch {
      return route.abort('blockedbyclient');
    }
    if (
      url.protocol === 'data:' ||
      url.protocol === 'blob:' ||
      url.protocol === 'about:'
    ) {
      return route.continue();
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return route.abort('blockedbyclient');
    }
    if (await isHostAllowed(url)) return route.continue();
    return route.abort('blockedbyclient');
  });
}
