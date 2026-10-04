export type UrlParseError = 'empty' | 'invalid' | 'unsupported-protocol' | 'invalid-host';

export type UrlParseResult =
  { ok: true; url: string; hostname: string } | { ok: false; reason: UrlParseError };

const HOST_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * Normalises user input ("example.com", "http://example.com/a#x") into a scannable URL.
 * Purely syntactic — network-level safety (SSRF, private IPs) is enforced by the scanner.
 */
export function parseScanUrl(input: string): UrlParseResult {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: 'empty' };

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
  let parsed: URL;
  try {
    parsed = new URL(hasScheme ? raw : `https://${raw}`);
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'unsupported-protocol' };
  }
  if (!HOST_PATTERN.test(parsed.hostname)) {
    return { ok: false, reason: 'invalid-host' };
  }

  parsed.hash = '';
  return { ok: true, url: parsed.toString(), hostname: parsed.hostname };
}

export const URL_ERROR_MESSAGES: Record<UrlParseError, string> = {
  empty: 'Enter your website address to start.',
  invalid: "That doesn't look like a valid address.",
  'unsupported-protocol': 'Only http:// and https:// websites can be checked.',
  'invalid-host': 'Enter a public domain such as example.com.',
};
