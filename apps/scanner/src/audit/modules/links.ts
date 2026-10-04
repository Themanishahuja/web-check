import { config } from '../../config.js';
import { FetchError, type HttpClient } from '../../net/http-client.js';
import { mapPool } from '../../util/pool.js';
import { pageLabel } from '../context.js';
import { issueFactory, type AuditModule } from '../issue.js';
import type { Issue } from '@whc/shared';

const { check, forEach } = issueFactory('links');

interface LinkRef {
  url: string;
  internal: boolean;
  /** Pages (labels) that contain this link. */
  foundOn: Set<string>;
}

interface LinkResult {
  ref: LinkRef;
  status: number | null;
  hops: number;
  error?: string;
}

/**
 * Only statuses that mean "this page is gone" count as broken. 401/403/429/999 etc.
 * are usually bot protection or login walls, not dead links.
 */
function isBroken(result: LinkResult): boolean {
  const { status } = result;
  if (status === null) return true;
  return status === 404 || status === 410 || (status >= 500 && status !== 503);
}

async function checkLink(http: HttpClient, ref: LinkRef): Promise<LinkResult> {
  const options = {
    timeoutMs: config.links.timeoutMs,
    maxBytes: 2048,
    headers: { accept: '*/*' },
  };
  try {
    let result = await http.fetch(ref.url, { ...options, method: 'HEAD' });
    // Many servers mishandle HEAD; confirm with GET before reporting a failure.
    if ([400, 403, 404, 405, 406, 501].includes(result.status)) {
      result = await http.fetch(ref.url, { ...options, method: 'GET' });
    }
    return { ref, status: result.status, hops: result.redirects.length };
  } catch (error) {
    if (error instanceof FetchError)
      return { ref, status: null, hops: 0, error: error.message };
    return { ref, status: null, hops: 0, error: 'Request failed' };
  }
}

export const auditLinks: AuditModule = async ({
  http,
  pages,
  assets,
  hostname,
  notFoundStatus,
  notes,
  browser,
  coverage,
}) => {
  const issues: Issue[] = [];
  const bare = (host: string) => host.replace(/^www\./, '');

  const refs = new Map<string, LinkRef>();
  const invalid: string[] = [];
  const placeholder: string[] = [];

  for (const page of pages) {
    const label = pageLabel(page);
    page.$('a[href]').each((_, element) => {
      const href = (page.$(element).attr('href') ?? '').trim();
      if (href === '' || /^javascript:/i.test(href)) {
        invalid.push(`${label} → ${href || '(empty href)'}`);
        return;
      }
      if (href === '#') {
        placeholder.push(label);
        return;
      }
      if (/^(mailto:|tel:|sms:|#|data:)/i.test(href)) return;

      let resolved: URL;
      try {
        resolved = new URL(href, page.finalUrl);
      } catch {
        invalid.push(`${label} → ${href.slice(0, 60)}`);
        return;
      }
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return;
      resolved.hash = '';

      const existing = refs.get(resolved.href);
      if (existing) existing.foundOn.add(label);
      else {
        refs.set(resolved.href, {
          url: resolved.href,
          internal: bare(resolved.hostname) === bare(hostname),
          foundOn: new Set([label]),
        });
      }
    });
  }

  // Internal links first so the budget goes to the links the site owner controls.
  const ordered = [...refs.values()].sort(
    (a, b) => Number(b.internal) - Number(a.internal),
  );
  const toCheck = ordered.slice(0, config.links.maxChecked);
  if (ordered.length > toCheck.length) {
    notes.push(
      `${ordered.length} unique links were found; the first ${toCheck.length} (internal links first) were checked.`,
    );
  }

  coverage.linksFound = ordered.length;
  coverage.linksChecked = toCheck.length;

  const results = await mapPool(toCheck, config.links.concurrency, (ref) =>
    checkLink(http, ref),
  );
  const describe = (r: LinkResult) =>
    `${r.ref.url.slice(0, 90)} — ${r.status ?? r.error ?? 'no response'}${r.ref.foundOn.size ? ` (on ${[...r.ref.foundOn][0]})` : ''}`;

  const brokenInternal = results.filter((r) => r.ref.internal && isBroken(r));
  const brokenExternal = results.filter((r) => !r.ref.internal && isBroken(r));
  const longChains = results.filter((r) => r.hops >= 3);
  const redirected = results.filter((r) => r.ref.internal && r.hops >= 1 && r.hops < 3);
  const insecureLinks = results.filter(
    (r) => r.ref.url.startsWith('http://') && r.ref.internal,
  );

  issues.push(
    forEach(brokenInternal.map(describe), {
      id: 'broken-internal',
      severity: 'high',
      fail: `${brokenInternal.length} broken internal link(s)`,
      pass: `No broken internal links (${results.filter((r) => r.ref.internal).length} checked)`,
      why: 'Visitors hit a dead end, and search engines treat broken pages as a sign of neglect.',
      fix: 'Fix the link target, restore the page, or redirect the old URL to the closest live page.',
    }),
    forEach(brokenExternal.map(describe), {
      id: 'broken-external',
      severity: 'medium',
      fail: `${brokenExternal.length} broken external link(s)`,
      pass: `No broken external links (${results.filter((r) => !r.ref.internal).length} checked)`,
      why: 'Links to dead pages frustrate visitors and make content look outdated.',
      fix: 'Update or remove the links, or point them to a working replacement.',
    }),
    forEach(
      longChains.map((r) => `${describe(r)} — ${r.hops} redirects`),
      {
        id: 'redirect-chains',
        severity: 'medium',
        fail: 'Links pass through long redirect chains',
        pass: 'No long redirect chains',
        why: 'Every extra redirect adds delay and can lose search ranking signals.',
        fix: 'Link directly to the final URL instead of an old address that redirects several times.',
      },
    ),
    forEach(redirected.map(describe), {
      id: 'redirected-links',
      severity: 'low',
      fail: 'Internal links point to URLs that redirect',
      pass: 'Internal links point directly to their final URLs',
      why: 'Redirected links add a needless extra request.',
      fix: 'Update internal links to use the final destination URL.',
    }),
    forEach(
      insecureLinks.map((r) => r.ref.url.slice(0, 90)),
      {
        id: 'insecure-links',
        severity: 'low',
        fail: 'Internal links use http:// instead of https://',
        pass: 'Internal links use https://',
        why: 'Linking to the insecure version adds a redirect and weakens security.',
        fix: 'Update internal links to https://.',
      },
    ),
    forEach([...new Set(invalid)], {
      id: 'invalid-urls',
      severity: 'medium',
      fail: 'Invalid or empty link targets',
      pass: 'No invalid link targets',
      why: 'These links do nothing when clicked, which confuses visitors and assistive technology.',
      fix: 'Give every link a real destination, or use a <button> for actions.',
    }),
    forEach([...new Set(placeholder)], {
      id: 'placeholder-links',
      severity: 'low',
      fail: 'Placeholder links (href="#") found',
      pass: 'No placeholder links',
      why: 'Placeholder links jump to the top of the page instead of doing anything useful.',
      fix: 'Link to the real destination or use a <button> for in-page actions.',
    }),
  );

  // Broken images (already measured by the asset step).
  const brokenImages = assets
    .filter((a) => a.kind === 'image' && (a.status === null ? false : a.status >= 400))
    .map((a) => `${a.url.slice(0, 90)} — ${a.status}`);
  issues.push(
    forEach(brokenImages, {
      id: 'broken-images',
      severity: 'high',
      fail: 'Broken images on the homepage',
      pass: 'Homepage images load correctly',
      why: 'Visitors see empty boxes where images should be.',
      fix: 'Restore the missing image files or update the image URLs.',
    }),
  );

  // Custom 404 handling.
  if (notFoundStatus !== null) {
    issues.push(
      check(notFoundStatus === 404 || notFoundStatus === 410, {
        id: 'not-found-status',
        severity: 'medium',
        fail: `Missing pages return HTTP ${notFoundStatus} instead of 404`,
        pass: 'Missing pages correctly return a 404 status',
        why:
          notFoundStatus === 200
            ? 'A "soft 404" tells search engines that non-existent pages are real, which pollutes the index.'
            : 'Search engines and monitoring tools rely on the correct status code.',
        fix: 'Configure your server or app to send a real 404 status (with a helpful page) for unknown URLs.',
      }),
    );
  }

  // Basic forms.
  const formsWithoutSubmit = pages.flatMap((page) =>
    page
      .$('form')
      .filter(
        (_, form) =>
          page.$(form).find('button, input[type="submit"], input[type="image"]')
            .length === 0,
      )
      .map(() => pageLabel(page))
      .get(),
  );
  const insecureForms = pages.flatMap((page) =>
    page
      .$('form[action^="http://"]')
      .map(() => pageLabel(page))
      .get(),
  );
  issues.push(
    forEach([...new Set(formsWithoutSubmit)], {
      id: 'forms-submit',
      severity: 'low',
      fail: 'Forms without a submit button',
      pass: 'Forms have submit buttons',
      why: 'Visitors (and keyboard users) may not be able to submit the form.',
      fix: 'Add a <button type="submit"> inside each form.',
    }),
    forEach([...new Set(insecureForms)], {
      id: 'forms-insecure',
      severity: 'high',
      fail: 'Forms submit data over insecure HTTP',
      pass: 'Forms submit over HTTPS',
      why: 'Anything typed into these forms can be read in transit.',
      fix: 'Change the form action to an https:// URL.',
    }),
  );

  // Basic functionality, observed while rendering the page in a real browser.
  if (browser) {
    issues.push(
      forEach(browser.consoleErrors, {
        id: 'js-errors',
        severity: 'medium',
        fail: 'JavaScript errors occur while the homepage loads',
        pass: 'No JavaScript errors while the homepage loads',
        why: 'Script errors usually mean something on the page (a menu, form or widget) is not working.',
        fix: 'Open your browser console on this page, find the errors listed here and fix or remove the failing scripts.',
      }),
      forEach(browser.failedRequests, {
        id: 'failed-requests',
        severity: 'medium',
        fail: 'Some files the homepage depends on fail to load',
        pass: 'All files the homepage depends on load successfully',
        why: 'Missing scripts, styles, images or fonts can leave parts of the page broken or empty.',
        fix: 'Fix or remove the references to these missing files.',
      }),
    );
  }

  return issues;
};
