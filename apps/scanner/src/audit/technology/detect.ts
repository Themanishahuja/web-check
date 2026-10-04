import type { DetectedTechnology } from '@whc/shared';
import { headerValues } from '../../net/http-client.js';
import type { AuditContext } from '../context.js';
import { signatures, type Signature } from './signatures.js';

interface Evidence {
  html: string;
  headers: Map<string, string>;
  assets: string[];
  generator: string;
  cookies: string[];
}

function collectEvidence({ home }: Pick<AuditContext, 'home'>): Evidence {
  const { $ } = home;
  const headers = new Map<string, string>();
  for (const name of Object.keys(home.headers)) {
    headers.set(name.toLowerCase(), headerValues(home.headers, name).join(', '));
  }
  const assets = [
    ...$('script[src]')
      .map((_, el) => $(el).attr('src') ?? '')
      .get(),
    ...$('link[href]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get(),
    ...$('iframe[src]')
      .map((_, el) => $(el).attr('src') ?? '')
      .get(),
  ];
  const cookies = headerValues(home.headers, 'set-cookie').map(
    (c) => c.split('=')[0]?.trim() ?? '',
  );

  return {
    html: home.html,
    headers,
    assets,
    generator: $('meta[name="generator"]').attr('content') ?? '',
    cookies,
  };
}

function matches(signature: Signature, evidence: Evidence): boolean {
  if (signature.generator?.test(evidence.generator)) return true;
  if (signature.html?.some((pattern) => pattern.test(evidence.html))) return true;
  if (
    signature.assets?.some((pattern) =>
      evidence.assets.some((asset) => pattern.test(asset)),
    )
  )
    return true;
  if (
    signature.cookies?.some((pattern) =>
      evidence.cookies.some((cookie) => pattern.test(cookie)),
    )
  )
    return true;
  if (signature.headers) {
    for (const [name, pattern] of Object.entries(signature.headers)) {
      const value = evidence.headers.get(name);
      if (value !== undefined && pattern.test(value)) return true;
    }
  }
  return false;
}

/** Identify frameworks, CMS, analytics, CDN, hosting and server technologies from page signals. */
export function detectTechnologies(
  context: Pick<AuditContext, 'home'>,
): DetectedTechnology[] {
  const evidence = collectEvidence(context);
  const detected = signatures
    .filter((signature) => matches(signature, evidence))
    .map(({ name, category }) => ({ name, category }));

  // Frameworks imply their libraries — avoid listing e.g. both React and Next.js noise ordering issues.
  const order = [
    'CMS',
    'E-commerce',
    'Framework',
    'JavaScript library',
    'CSS framework',
    'Programming language',
    'Web server',
    'Hosting',
    'CDN',
    'Analytics',
    'Tag manager',
    'Marketing',
    'Chat & support',
    'Payments',
    'Security',
    'Fonts',
  ];
  return detected.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
}
