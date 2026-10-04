import type {
  Issue,
  SecurityGrade,
  SecurityHeaderCategory,
  SecurityHeaderCheck,
  SecurityHeaderReport,
  SecurityHeaderStatus,
} from '@whc/shared';
import { headerValue, type Headers } from '../../net/http-client.js';
import { issueFactory, type FailSeverity } from '../issue.js';

/**
 * Security header catalogue: 19 checks, one rule each.
 *
 * Every rule inspects the raw response headers and returns a 0–1 "strength".
 * The 7 core protections carry the grade (`weight > 0`); the rest are shown for
 * completeness. The same evaluation feeds both the visual scanner panel and the
 * Security issue list, so they can never disagree.
 *
 * To change how a header is judged, edit its rule below.
 */

interface Evaluation {
  /** 1 = in the desired state, 0 = not. In between = present but weak. */
  strength: number;
  summary: string;
  /** Set when the header exists but is weak. */
  weakness?: string;
}

interface HeaderRule {
  id: string;
  header: string;
  label: string;
  category: SecurityHeaderCategory;
  /** `absent` = the desired state is NOT sending this header. */
  expected?: 'present' | 'absent';
  /** Share of the grade. 0 = shown for completeness only. */
  weight: number;
  httpsOnly?: boolean;
  /** Severity of the issue raised when a graded header is missing. */
  severity: FailSeverity;
  /** Status shown for an ungraded header that is not in the desired state. */
  fallbackStatus?: SecurityHeaderStatus;
  description: string;
  risk: string;
  missing: string;
  why: string;
  fix: string;
  pass: string;
  evaluate(headers: Headers, isHttps: boolean): Evaluation;
}

const value = (headers: Headers, name: string) => headerValue(headers, name)?.trim();

const cspDirective = (csp: string, name: string): string | undefined =>
  csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith(`${name} `));

function evaluateCsp(headers: Headers): Evaluation {
  const enforced = value(headers, 'content-security-policy');
  const reportOnly = value(headers, 'content-security-policy-report-only');

  if (!enforced) {
    return reportOnly
      ? {
          strength: 0.3,
          summary: 'Only a report-only policy is set, so nothing is blocked yet.',
          weakness:
            'The Content-Security-Policy is report-only and does not block anything',
        }
      : { strength: 0, summary: 'No Content-Security-Policy is set.' };
  }

  const scriptSource =
    cspDirective(enforced, 'script-src') ?? cspDirective(enforced, 'default-src') ?? '';
  const hasNonceOrHash = /'nonce-|'sha(256|384|512)-|'strict-dynamic'/.test(scriptSource);

  if (/'unsafe-inline'|'unsafe-eval'/.test(scriptSource) && !hasNonceOrHash) {
    return {
      strength: 0.6,
      summary:
        'A policy is set but allows unsafe inline/eval scripts, weakening XSS protection.',
      weakness: 'The Content-Security-Policy allows unsafe-inline or unsafe-eval scripts',
    };
  }
  if (/(^|\s)\*(\s|$)/.test(scriptSource) || /(^|\s)https?:(\s|$)/.test(scriptSource)) {
    return {
      strength: 0.5,
      summary: 'A policy is set but allows scripts from any origin.',
      weakness: 'The Content-Security-Policy allows scripts from any origin',
    };
  }
  return {
    strength: 1,
    summary: 'Restricts where scripts and other content can load from.',
  };
}

function evaluateFrameProtection(headers: Headers): Evaluation {
  const xfo = value(headers, 'x-frame-options')?.toLowerCase();
  const csp = value(headers, 'content-security-policy') ?? '';
  if (/frame-ancestors/i.test(csp) || xfo === 'deny' || xfo === 'sameorigin') {
    return { strength: 1, summary: 'Other sites cannot embed this site in a frame.' };
  }
  if (xfo) {
    return {
      strength: 0.5,
      summary: `X-Frame-Options "${xfo}" is outdated or too permissive.`,
      weakness: 'X-Frame-Options is set to an outdated or permissive value',
    };
  }
  return { strength: 0, summary: 'This site can be embedded in any other site’s frame.' };
}

function evaluateHsts(headers: Headers, isHttps: boolean): Evaluation {
  if (!isHttps) {
    return {
      strength: 0,
      summary: 'HSTS only works over HTTPS — this site is not served over HTTPS.',
    };
  }
  const hsts = value(headers, 'strict-transport-security');
  if (!hsts)
    return { strength: 0, summary: 'Browsers are not told to always use HTTPS.' };
  const maxAge = Number(hsts.match(/max-age=(\d+)/i)?.[1] ?? 0);
  if (maxAge < 15_552_000) {
    return {
      strength: 0.5,
      summary: 'HSTS is on, but its lifetime is shorter than six months.',
      weakness: 'HSTS max-age is shorter than six months',
    };
  }
  return { strength: 1, summary: 'Browsers always use HTTPS for this site.' };
}

/** Helper for headers whose mere presence is the goal. */
const presence =
  (name: string, good: string, bad: string) =>
  (headers: Headers): Evaluation =>
    value(headers, name) ? { strength: 1, summary: good } : { strength: 0, summary: bad };

/** Helper for headers that should NOT be sent. */
const absence =
  (name: string, hidden: string, exposed: (found: string) => string) =>
  (headers: Headers): Evaluation => {
    const found = value(headers, name);
    return found
      ? { strength: 0, summary: exposed(found) }
      : { strength: 1, summary: hidden };
  };

const RULES: HeaderRule[] = [
  // ---- Core protections (graded) -------------------------------------------
  {
    id: 'hsts',
    header: 'Strict-Transport-Security',
    label: 'Forces HTTPS',
    category: 'protection',
    weight: 20,
    httpsOnly: true,
    severity: 'medium',
    description:
      'Tells the browser to only ever talk to your site over HTTPS, even if someone types http:// or clicks an old link.',
    risk: 'Visitors on public Wi-Fi can be silently downgraded to an insecure connection, letting attackers read or change what they see and send (including logins).',
    missing: 'No Strict-Transport-Security (HSTS) header',
    why: 'HSTS tells browsers to always use HTTPS for your site, blocking downgrade attacks.',
    fix: 'Send "Strict-Transport-Security: max-age=31536000; includeSubDomains" on HTTPS responses.',
    pass: 'HSTS is enabled',
    evaluate: evaluateHsts,
  },
  {
    id: 'csp',
    header: 'Content-Security-Policy',
    label: 'Controls what can run',
    category: 'protection',
    weight: 25,
    severity: 'medium',
    description:
      'A whitelist of where scripts, styles, images and frames may load from. The browser refuses everything else.',
    risk: 'If an attacker manages to inject a script (XSS), nothing stops it from running — stealing sessions, passwords or payment details.',
    missing: 'No Content-Security-Policy header',
    why: 'A CSP limits which scripts can run on your pages, reducing the damage of injected code (XSS).',
    fix: 'Start with a Content-Security-Policy-Report-Only header, then enforce a policy that avoids unsafe-inline.',
    pass: 'A solid Content-Security-Policy is set',
    evaluate: evaluateCsp,
  },
  {
    id: 'frame',
    header: 'X-Frame-Options',
    label: 'Blocks clickjacking',
    category: 'protection',
    weight: 15,
    severity: 'medium',
    description: 'Stops other websites from loading your pages inside a hidden frame.',
    risk: 'Clickjacking: an attacker overlays your page invisibly under a fake button, so visitors unknowingly click “Buy”, “Delete” or “Allow” on your site.',
    missing: 'The site can be embedded in other sites’ frames',
    why: 'Attackers can overlay your pages in a hidden frame to trick visitors into clicking things.',
    fix: 'Send "X-Frame-Options: SAMEORIGIN" or a CSP "frame-ancestors" directive.',
    pass: 'Framing is restricted (clickjacking protection)',
    evaluate: evaluateFrameProtection,
  },
  {
    id: 'nosniff',
    header: 'X-Content-Type-Options',
    label: 'Stops file-type guessing',
    category: 'protection',
    weight: 10,
    severity: 'low',
    description:
      'Makes the browser trust the file type your server declares instead of guessing from the content.',
    risk: 'A harmless-looking uploaded file (an image or text file) can be reinterpreted by the browser as a script and executed.',
    missing: 'Missing X-Content-Type-Options: nosniff',
    why: 'Browsers may guess a file’s type and execute content that was never meant to run.',
    fix: 'Send "X-Content-Type-Options: nosniff" on all responses.',
    pass: 'Content-type sniffing is disabled',
    evaluate: (headers) =>
      /nosniff/i.test(value(headers, 'x-content-type-options') ?? '')
        ? { strength: 1, summary: 'Browsers must respect the declared file types.' }
        : {
            strength: 0,
            summary: 'Browsers may guess file types and run unexpected content.',
          },
  },
  {
    id: 'referrer',
    header: 'Referrer-Policy',
    label: 'Limits URL leakage',
    category: 'protection',
    weight: 10,
    severity: 'low',
    description:
      'Controls how much of the current page address is sent to other sites when a visitor clicks a link or loads a resource.',
    risk: 'Full URLs — which can contain search terms, tokens, order or account IDs — leak to third parties such as analytics, ads and linked sites.',
    missing: 'No Referrer-Policy header',
    why: 'Without it, full page URLs (which may contain private data) can leak to other sites.',
    fix: 'Send "Referrer-Policy: strict-origin-when-cross-origin".',
    pass: 'A Referrer-Policy is set',
    evaluate: (headers) => {
      const policy = value(headers, 'referrer-policy')?.toLowerCase();
      if (!policy)
        return { strength: 0, summary: 'Full page URLs may be sent to other sites.' };
      if (policy === 'unsafe-url' || policy === 'no-referrer-when-downgrade') {
        return {
          strength: 0.5,
          summary: `"${policy}" still leaks full URLs to other sites.`,
          weakness: 'The Referrer-Policy leaks full URLs to other sites',
        };
      }
      return {
        strength: 1,
        summary: 'Controls how much of the URL is shared with other sites.',
      };
    },
  },
  {
    id: 'permissions',
    header: 'Permissions-Policy',
    label: 'Restricts browser features',
    category: 'protection',
    weight: 10,
    severity: 'low',
    description:
      'Switches off powerful browser features (camera, microphone, location, payments…) that your site does not need.',
    risk: 'Injected or third-party code on your page could ask visitors for camera, microphone or location access, and visitors would see it as coming from you.',
    missing: 'No Permissions-Policy header',
    why: 'It lets you switch off browser features (camera, microphone, geolocation) your site never uses.',
    fix: 'Send a Permissions-Policy header that disables unused features, e.g. "camera=(), microphone=(), geolocation=()".',
    pass: 'A Permissions-Policy is set',
    evaluate: (headers) =>
      value(headers, 'permissions-policy')
        ? { strength: 1, summary: 'Unused browser features are switched off.' }
        : value(headers, 'feature-policy')
          ? {
              strength: 0.5,
              summary: 'Only the deprecated Feature-Policy header is set.',
              weakness: 'Only the deprecated Feature-Policy header is used',
            }
          : {
              strength: 0,
              summary: 'Browser features such as camera or location are not restricted.',
            },
  },
  {
    id: 'coop',
    header: 'Cross-Origin-Opener-Policy',
    label: 'Isolates the window',
    category: 'protection',
    weight: 10,
    severity: 'low',
    description:
      'Separates your page from any other site’s window that opened it (or that you opened), so they cannot reach each other.',
    risk: 'A malicious site that opens yours in a popup can keep a handle on your window and use cross-site leak or Spectre-style attacks to learn about the visitor’s session.',
    missing: 'No Cross-Origin-Opener-Policy header',
    why: 'COOP stops other sites that open yours in a popup from interacting with your page.',
    fix: 'Send "Cross-Origin-Opener-Policy: same-origin".',
    pass: 'Cross-Origin-Opener-Policy is set',
    evaluate: presence(
      'cross-origin-opener-policy',
      'The page is isolated from windows opened by other sites.',
      'The window is not isolated from cross-origin popups.',
    ),
  },

  // ---- Cross-origin isolation (not graded) ----------------------------------
  {
    id: 'corp',
    header: 'Cross-Origin-Resource-Policy',
    label: 'Protects your files',
    category: 'isolation',
    weight: 0,
    severity: 'low',
    description: 'Says which sites may load your images, scripts and other files.',
    risk: 'Other sites can embed or probe your private resources (for example logged-in-only images), leaking information about your visitors.',
    missing: 'No Cross-Origin-Resource-Policy header',
    why: '',
    fix: 'Send "Cross-Origin-Resource-Policy: same-site" if your files should not be used by other sites.',
    pass: 'Cross-Origin-Resource-Policy is set',
    evaluate: presence(
      'cross-origin-resource-policy',
      'Other sites are restricted from loading your resources.',
      'Any site can load your resources.',
    ),
  },
  {
    id: 'coep',
    header: 'Cross-Origin-Embedder-Policy',
    label: 'Requires safe embeds',
    category: 'isolation',
    weight: 0,
    severity: 'low',
    description:
      'Only lets your page load cross-origin content that has explicitly agreed to be embedded.',
    risk: 'Without it (and COOP) your page cannot be fully “cross-origin isolated”, which powerful features and the strongest Spectre protections depend on.',
    missing: 'No Cross-Origin-Embedder-Policy header',
    why: '',
    fix: 'Send "Cross-Origin-Embedder-Policy: require-corp" — only needed for advanced features such as SharedArrayBuffer.',
    pass: 'Cross-Origin-Embedder-Policy is set',
    evaluate: presence(
      'cross-origin-embedder-policy',
      'Embedded content must opt in to being loaded.',
      'Cross-origin content can be embedded without opting in.',
    ),
  },

  // ---- Extra hardening (not graded) -----------------------------------------
  {
    id: 'xpcdp',
    header: 'X-Permitted-Cross-Domain-Policies',
    label: 'Blocks Flash/PDF policies',
    category: 'hardening',
    weight: 0,
    severity: 'low',
    description:
      'Stops old Adobe plugins (Flash, Acrobat) from reading data from your site using cross-domain policy files.',
    risk: 'Legacy plugins could be used to pull data from your site on behalf of an attacker’s page. Rare today, but trivial to close.',
    missing: 'No X-Permitted-Cross-Domain-Policies header',
    why: '',
    fix: 'Send "X-Permitted-Cross-Domain-Policies: none".',
    pass: 'X-Permitted-Cross-Domain-Policies is set',
    evaluate: presence(
      'x-permitted-cross-domain-policies',
      'Legacy plugin cross-domain access is restricted.',
      'Legacy plugins may read data via cross-domain policy files.',
    ),
  },
  {
    id: 'oac',
    header: 'Origin-Agent-Cluster',
    label: 'Isolates memory',
    category: 'hardening',
    weight: 0,
    severity: 'low',
    description:
      'Asks the browser to run your site in its own process/memory group, apart from other sites on related domains.',
    risk: 'A compromised page on a sibling subdomain shares more with yours, making side-channel attacks easier.',
    missing: 'No Origin-Agent-Cluster header',
    why: '',
    fix: 'Send "Origin-Agent-Cluster: ?1".',
    pass: 'Origin-Agent-Cluster is set',
    evaluate: presence(
      'origin-agent-cluster',
      'The site is isolated into its own agent cluster.',
      'The site shares an agent cluster with related origins.',
    ),
  },
  {
    id: 'dns-prefetch',
    header: 'X-DNS-Prefetch-Control',
    label: 'Controls DNS pre-lookups',
    category: 'hardening',
    weight: 0,
    severity: 'low',
    description:
      'Controls whether browsers resolve the domains of links on your page before the visitor clicks them.',
    risk: 'Pre-lookups tell DNS servers which sites your visitors might visit and can leak activity patterns; “off” is the privacy-friendly choice.',
    missing: 'No X-DNS-Prefetch-Control header',
    why: '',
    fix: 'Send "X-DNS-Prefetch-Control: off" unless you rely on prefetching for speed.',
    pass: 'X-DNS-Prefetch-Control is set',
    evaluate: presence(
      'x-dns-prefetch-control',
      'DNS prefetching is explicitly controlled.',
      'Browsers may resolve linked domains in advance.',
    ),
  },
  {
    id: 'xxss',
    header: 'X-XSS-Protection',
    label: 'Legacy filter is off',
    category: 'hardening',
    expected: 'absent',
    weight: 0,
    severity: 'low',
    fallbackStatus: 'warn',
    description:
      'An old browser filter that tried to block XSS. Modern advice is to switch it off (value 0) and rely on a Content-Security-Policy instead.',
    risk: 'In older browsers the filter itself could be abused to break pages or leak information. “1; mode=block” is no longer recommended.',
    missing: '',
    why: '',
    fix: 'Remove it or send "X-XSS-Protection: 0", and use Content-Security-Policy.',
    pass: 'No risky legacy XSS filter',
    evaluate: (headers) => {
      const found = value(headers, 'x-xss-protection');
      return !found || found === '0'
        ? {
            strength: 1,
            summary: 'The legacy filter is not enabled — correct for modern browsers.',
          }
        : {
            strength: 0,
            summary: `Legacy filter enabled ("${found}") — no longer recommended.`,
          };
    },
  },

  // ---- Monitoring (not graded) ----------------------------------------------
  {
    id: 'reporting',
    header: 'Reporting-Endpoints',
    label: 'Gets violation reports',
    category: 'monitoring',
    weight: 0,
    severity: 'low',
    description:
      'Tells browsers where to send reports about policy violations (CSP breaks, crashes, deprecations).',
    risk: 'Attacks and misconfigurations can go on for weeks because you never receive a signal that something was blocked.',
    missing: 'No Reporting-Endpoints header',
    why: '',
    fix: 'Send a "Reporting-Endpoints" header pointing to a collection endpoint.',
    pass: 'Violation reporting is configured',
    evaluate: (headers) =>
      value(headers, 'reporting-endpoints') || value(headers, 'report-to')
        ? { strength: 1, summary: 'Browsers report policy violations to you.' }
        : { strength: 0, summary: 'You will not hear about violations browsers detect.' },
  },
  {
    id: 'nel',
    header: 'NEL',
    label: 'Network error reports',
    category: 'monitoring',
    weight: 0,
    severity: 'low',
    description:
      'Network Error Logging: browsers tell you when real visitors fail to reach your site.',
    risk: 'Outages, DNS or certificate problems that only affect some visitors stay invisible to you.',
    missing: 'No NEL header',
    why: '',
    fix: 'Send a "NEL" header together with a Report-To / Reporting-Endpoints group.',
    pass: 'Network error logging is configured',
    evaluate: presence(
      'nel',
      'Browsers report network failures to you.',
      'Network failures that visitors experience are not reported.',
    ),
  },

  // ---- Information disclosure (should be ABSENT) -----------------------------
  {
    id: 'server',
    header: 'Server',
    label: 'Hides server version',
    category: 'disclosure',
    expected: 'absent',
    weight: 0,
    severity: 'low',
    fallbackStatus: 'warn',
    description:
      'Shows which web server software answers requests. The name alone is harmless; an exact version is not.',
    risk: 'Attackers match the exact version to published vulnerabilities and aim ready-made exploits at it.',
    missing: '',
    why: '',
    fix: 'Hide the version (e.g. nginx: "server_tokens off", Apache: "ServerTokens Prod").',
    pass: 'The server does not reveal its version',
    evaluate: (headers) => {
      const found = value(headers, 'server');
      return found && /\d+\.\d+/.test(found)
        ? { strength: 0, summary: `Reveals the exact server version ("${found}").` }
        : {
            strength: 1,
            summary: found
              ? `Only the product name is shown ("${found}").`
              : 'No server details are shared.',
          };
    },
  },
  {
    id: 'powered-by',
    header: 'X-Powered-By',
    label: 'Hides your tech stack',
    category: 'disclosure',
    expected: 'absent',
    weight: 0,
    severity: 'low',
    fallbackStatus: 'warn',
    description:
      'Announces the language or framework behind the site (PHP, Express, ASP.NET…).',
    risk: 'Tells attackers exactly which framework and often which version to target.',
    missing: '',
    why: '',
    fix: 'Remove it (Express: app.disable("x-powered-by"); PHP: expose_php = Off).',
    pass: 'X-Powered-By is not sent',
    evaluate: absence(
      'x-powered-by',
      'The technology stack is not advertised.',
      (found) => `Advertises the stack ("${found}").`,
    ),
  },
  {
    id: 'aspnet',
    header: 'X-AspNet-Version',
    label: 'Hides ASP.NET version',
    category: 'disclosure',
    expected: 'absent',
    weight: 0,
    severity: 'low',
    fallbackStatus: 'warn',
    description: 'Reveals the exact ASP.NET version running the site.',
    risk: 'Gives attackers a precise target for known ASP.NET vulnerabilities.',
    missing: '',
    why: '',
    fix: 'Set <httpRuntime enableVersionHeader="false" /> in web.config.',
    pass: 'X-AspNet-Version is not sent',
    evaluate: absence(
      'x-aspnet-version',
      'The ASP.NET version is not advertised.',
      (found) => `Reveals ASP.NET version ${found}.`,
    ),
  },
  {
    id: 'generator',
    header: 'X-Generator',
    label: 'Hides the CMS',
    category: 'disclosure',
    expected: 'absent',
    weight: 0,
    severity: 'low',
    fallbackStatus: 'warn',
    description:
      'Names the CMS or site generator (Drupal, WordPress plugins, etc.) that produced the page.',
    risk: 'Makes it trivial to find sites running a specific, possibly outdated, CMS.',
    missing: '',
    why: '',
    fix: 'Remove the X-Generator header in your CMS or server configuration.',
    pass: 'X-Generator is not sent',
    evaluate: absence(
      'x-generator',
      'The CMS is not advertised in headers.',
      (found) => `Advertises the CMS ("${found}").`,
    ),
  },
];

function toGrade(percent: number, isHttps: boolean): SecurityGrade {
  if (!isHttps) return 'F';
  if (percent >= 95) return 'A+';
  if (percent >= 85) return 'A';
  if (percent >= 70) return 'B';
  if (percent >= 55) return 'C';
  if (percent >= 35) return 'D';
  return 'F';
}

export interface SecurityHeaderAnalysis {
  report: SecurityHeaderReport;
  /** Issues for the Security module, derived from the same evaluation. */
  issues: Issue[];
}

const { check } = issueFactory('security');

export function analyzeSecurityHeaders(
  headers: Headers,
  isHttps: boolean,
): SecurityHeaderAnalysis {
  const checks: SecurityHeaderCheck[] = [];
  const issues: Issue[] = [];
  let earned = 0;
  let possible = 0;

  for (const rule of RULES) {
    const result = rule.evaluate(headers, isHttps);
    const raw =
      value(headers, rule.header) ??
      (rule.id === 'csp'
        ? value(headers, 'content-security-policy-report-only')
        : undefined) ??
      null;
    const expected = rule.expected ?? 'present';

    // HSTS cannot apply to plain HTTP, so it does not count toward the grade there.
    const graded = rule.weight > 0 && !(rule.httpsOnly && !isHttps);
    if (graded) {
      earned += rule.weight * result.strength;
      possible += rule.weight;
    }

    let status: SecurityHeaderStatus;
    if (result.strength >= 1) status = 'good';
    else if (rule.weight === 0) status = rule.fallbackStatus ?? 'info';
    else status = result.strength > 0 ? 'warn' : 'bad';

    checks.push({
      id: rule.id,
      category: rule.category,
      expected,
      description: rule.description,
      risk: rule.risk,
      header: rule.header,
      label: rule.label,
      status,
      present: raw !== null || (rule.id === 'frame' && result.strength > 0),
      value: raw,
      summary: result.summary,
      recommendation: result.strength >= 1 ? null : rule.fix,
    });

    // Only graded rules raise issues (disclosure is reported by the Security module separately).
    if (!graded) continue;
    const spec = {
      id: rule.id,
      severity: rule.severity,
      fail: rule.missing,
      pass: rule.pass,
      why: rule.why,
      fix: rule.fix,
    };
    if (result.strength >= 1) issues.push(check(true, spec));
    else if (result.strength > 0) {
      issues.push(
        check(false, { ...spec, severity: 'low', fail: result.weakness ?? rule.missing }),
      );
    } else issues.push(check(false, spec));
  }

  const percent = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  const disclosure = checks
    .filter(
      (item) => item.category === 'disclosure' && item.status !== 'good' && item.value,
    )
    .map((item) => ({ header: item.header, value: item.value ?? '' }));

  return {
    report: { grade: toGrade(percent, isHttps), score: percent, checks, disclosure },
    issues,
  };
}
