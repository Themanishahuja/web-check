import { headerValue, headerValues } from '../../net/http-client.js';
import { pageLabel } from '../context.js';
import { issueFactory, type AuditModule } from '../issue.js';
import { analyzeSecurityHeaders } from '../security/headers.js';
import type { Issue } from '@whc/shared';

const { check, forEach } = issueFactory('security');

const ACTIVE_MIXED =
  'script[src], link[rel="stylesheet"][href], iframe[src], object[data], embed[src]';
const PASSIVE_MIXED = 'img[src], audio[src], video[src], source[src]';

export const auditSecurity: AuditModule = ({
  home,
  pages,
  isHttps,
  hostname,
  tls,
  invalidCert,
  httpRedirect,
  exposures,
}) => {
  const issues: Issue[] = [];
  const headers = home.headers;
  issues.push(
    check(isHttps, {
      id: 'https',
      severity: 'critical',
      fail: 'The site is not served over HTTPS',
      pass: 'The site is served over HTTPS',
      why: 'Without HTTPS, everything visitors send and receive can be read or changed in transit, and browsers label the site "Not secure".',
      fix: 'Install a TLS certificate (free via Let’s Encrypt or your host) and serve every page over HTTPS.',
    }),
  );

  if (isHttps) {
    issues.push(
      check(!invalidCert && (tls === null || tls.authorized), {
        id: 'certificate-valid',
        severity: 'critical',
        fail: `The SSL certificate is not trusted${invalidCert ? ` (${invalidCert})` : ''}`,
        pass: 'The SSL certificate is valid and trusted',
        why: 'Browsers show a full-page warning for invalid certificates, and most visitors leave.',
        fix: 'Replace the certificate with one issued by a trusted authority that covers this exact domain and has not expired.',
      }),
    );

    if (tls?.daysRemaining !== undefined && tls.daysRemaining >= 0) {
      const expiresSoon = tls.daysRemaining < 14;
      issues.push(
        check(tls.daysRemaining >= 30, {
          id: 'certificate-expiry',
          severity: expiresSoon ? 'high' : 'medium',
          fail: `The SSL certificate expires in ${tls.daysRemaining} days`,
          pass: `The SSL certificate is valid for another ${tls.daysRemaining} days`,
          why: 'An expired certificate takes the site offline for most visitors until it is renewed.',
          fix: 'Renew the certificate now and enable automatic renewal.',
        }),
      );
    }

    if (tls?.protocol) {
      issues.push(
        check(tls.protocol === 'TLSv1.2' || tls.protocol === 'TLSv1.3', {
          id: 'tls-version',
          severity: 'high',
          fail: `The server negotiated an outdated protocol (${tls.protocol})`,
          pass: `Modern TLS in use (${tls.protocol})`,
          why: 'TLS 1.0 and 1.1 have known weaknesses and are rejected by modern browsers.',
          fix: 'Disable TLS 1.0/1.1 on your server or CDN and support TLS 1.2 and 1.3.',
        }),
      );
    }

    if (httpRedirect.servesHttp) {
      issues.push(
        check(httpRedirect.redirectsToHttps, {
          id: 'http-redirect',
          severity: 'high',
          fail: 'http:// does not redirect to https://',
          pass: 'http:// redirects to https://',
          why: 'Visitors who type the address without https:// land on an insecure copy of the site.',
          fix: 'Add a permanent (301) redirect from http:// to https:// for every URL.',
        }),
      );
    }
  }

  issues.push(...analyzeSecurityHeaders(headers, isHttps).issues);

  const cookies = headerValues(headers, 'set-cookie');
  if (cookies.length > 0) {
    const names = (predicate: (cookie: string) => boolean) =>
      cookies.filter(predicate).map((cookie) => cookie.split('=')[0]?.trim() ?? 'cookie');
    if (isHttps) {
      issues.push(
        forEach(
          names((c) => !/;\s*secure/i.test(c)),
          {
            id: 'cookie-secure',
            severity: 'high',
            fail: 'Cookies are set without the Secure flag',
            pass: 'Cookies use the Secure flag',
            why: 'Cookies without Secure can be sent over unencrypted connections and intercepted.',
            fix: 'Add the Secure attribute to every cookie.',
          },
        ),
      );
    }
    issues.push(
      forEach(
        names((c) => !/;\s*httponly/i.test(c)),
        {
          id: 'cookie-httponly',
          severity: 'medium',
          fail: 'Cookies are set without the HttpOnly flag',
          pass: 'Cookies use the HttpOnly flag',
          why: 'Cookies readable by JavaScript can be stolen by any injected script.',
          fix: 'Add HttpOnly to cookies that JavaScript does not need to read (especially session cookies).',
        },
      ),
      forEach(
        names((c) => !/;\s*samesite/i.test(c)),
        {
          id: 'cookie-samesite',
          severity: 'low',
          fail: 'Cookies are set without a SameSite attribute',
          pass: 'Cookies declare SameSite',
          why: 'SameSite limits when cookies are sent cross-site, helping prevent CSRF.',
          fix: 'Add SameSite=Lax (or Strict) to cookies.',
        },
      ),
    );
  }

  if (isHttps) {
    const insecure = (selector: string) =>
      pages.flatMap((page) =>
        page
          .$(selector)
          .filter((_, el) =>
            /^http:\/\//i.test(
              page.$(el).attr('src') ??
                page.$(el).attr('href') ??
                page.$(el).attr('data') ??
                '',
            ),
          )
          .map(() => pageLabel(page))
          .get(),
      );
    const unique = (list: string[]) => [...new Set(list)];

    issues.push(
      forEach(unique(insecure(ACTIVE_MIXED)), {
        id: 'mixed-active',
        severity: 'high',
        fail: 'Scripts, styles or frames are loaded over insecure HTTP',
        pass: 'No insecure scripts, styles or frames',
        why: 'Browsers block these, which can break features — and attackers can tamper with them.',
        fix: 'Load every script, stylesheet and frame from an https:// URL.',
      }),
      forEach(unique(insecure(PASSIVE_MIXED)), {
        id: 'mixed-passive',
        severity: 'medium',
        fail: 'Images or media are loaded over insecure HTTP',
        pass: 'No insecure images or media',
        why: 'Browsers show a "not fully secure" warning and may block the content.',
        fix: 'Serve images and media from https:// URLs.',
      }),
    );
  }

  const serverHeader = headerValue(headers, 'server') ?? '';
  const poweredBy = headerValue(headers, 'x-powered-by');
  issues.push(
    check(!/\d+\.\d+/.test(serverHeader) && !poweredBy, {
      id: 'version-disclosure',
      severity: 'low',
      fail: 'Server software and version are disclosed in headers',
      pass: 'Headers do not reveal server software versions',
      why: 'Exact versions help attackers pick known exploits for your stack.',
      fix: 'Remove or genericise the Server and X-Powered-By headers in your server config.',
    }),
    forEach(
      exposures.map((path) => `https://${hostname}${path}`),
      {
        id: 'exposed-files',
        severity: 'critical',
        fail: 'Sensitive files are publicly accessible',
        pass: 'No commonly exposed sensitive files found',
        why: 'Files like .env or .git can reveal passwords, API keys and your source code.',
        fix: 'Block access to these paths in your web server immediately and rotate any secrets they contained.',
      },
    ),
  );

  return issues;
};
