import { randomBytes } from 'node:crypto';
import { headerValue, type HttpClient } from '../net/http-client.js';

export interface HttpRedirectProbe {
  /** The site answers on plain http://. */
  servesHttp: boolean;
  redirectsToHttps: boolean;
}

export async function probeHttpRedirect(
  http: HttpClient,
  hostname: string,
): Promise<HttpRedirectProbe> {
  try {
    const result = await http.fetch(`http://${hostname}/`, {
      followRedirects: false,
      method: 'GET',
      maxBytes: 4096,
      timeoutMs: 6_000,
    });
    const location = headerValue(result.headers, 'location') ?? '';
    return {
      servesHttp: true,
      redirectsToHttps:
        result.status >= 300 && result.status < 400 && location.startsWith('https://'),
    };
  } catch {
    // Nothing listening on :80 — acceptable; HTTPS-only.
    return { servesHttp: false, redirectsToHttps: false };
  }
}

/** Requests a random missing URL to see how the site answers (real 404 vs "soft 404"). */
export async function probeNotFound(
  http: HttpClient,
  origin: string,
): Promise<number | null> {
  try {
    const result = await http.fetch(
      `${origin}/whc-404-check-${randomBytes(4).toString('hex')}`,
      {
        maxBytes: 100_000,
        timeoutMs: 6_000,
      },
    );
    return result.status;
  } catch {
    return null;
  }
}

const EXPOSURE_PROBES = [
  {
    path: '/.env',
    matches: (body: string) =>
      /^[A-Z][A-Z0-9_]{2,}\s*=\s*\S+/m.test(body) && !/<html/i.test(body),
  },
  {
    path: '/.git/HEAD',
    matches: (body: string) => /^ref:\s*refs\//.test(body.trim()),
  },
] as const;

/** Looks for a couple of well-known, high-impact exposed files. Strict body signatures avoid false positives. */
export async function probeExposures(
  http: HttpClient,
  origin: string,
): Promise<string[]> {
  const exposed: string[] = [];
  await Promise.all(
    EXPOSURE_PROBES.map(async (probe) => {
      try {
        const result = await http.fetch(`${origin}${probe.path}`, {
          maxBytes: 20_000,
          timeoutMs: 6_000,
        });
        if (result.status === 200 && probe.matches(result.body)) exposed.push(probe.path);
      } catch {
        // unreachable == not exposed
      }
    }),
  );
  return exposed;
}
