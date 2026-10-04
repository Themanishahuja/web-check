import AxeBuilder from '@axe-core/playwright';
import { devices, type Browser, type BrowserContext } from 'playwright';
import { config } from '../config.js';
import { withBrowser } from './browser-manager.js';
import { installNetworkGuard } from './network-guard.js';
import { MOBILE_LAYOUT_CHECKS, READ_VITALS, VITALS_COLLECTOR } from './page-scripts.js';

export interface LabVitals {
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
}

export interface MobileLayout {
  viewportWidth: number;
  overflowPx: number;
  overflowElements: string[];
  smallTargetCount: number;
  smallTargets: string[];
  smallTextCount: number;
  smallText: string[];
  requestCount: number;
  transferBytes: number;
}

export type AxeImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface AxeFinding {
  id: string;
  impact: AxeImpact;
  help: string;
  description: string;
  helpUrl: string;
  occurrences: number;
  /** "page → selector" samples. */
  targets: string[];
}

export interface AxeSummary {
  findings: AxeFinding[];
  passedRules: number;
  pagesChecked: number;
}

/** Everything learned by actually rendering the site in Chromium. */
export interface BrowserAudit {
  vitals: LabVitals;
  mobile: MobileLayout | null;
  axe: AxeSummary | null;
  consoleErrors: string[];
  failedRequests: string[];
  /** Base64 JPEG of the mobile viewport. */
  screenshot: string | null;
}

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const IGNORED_FAILURES = /ERR_BLOCKED_BY_CLIENT|ERR_ABORTED|net::ERR_FAILED/;

const pathOf = (url: string) => {
  try {
    const { pathname, search } = new URL(url);
    return pathname + search;
  } catch {
    return url;
  }
};

async function mobilePhase(
  browser: Browser,
  url: string,
  track: (context: BrowserContext) => void,
): Promise<
  Pick<
    BrowserAudit,
    'vitals' | 'mobile' | 'consoleErrors' | 'failedRequests' | 'screenshot'
  >
> {
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    serviceWorkers: 'block',
  });
  track(context);
  await installNetworkGuard(context);
  await context.addInitScript(VITALS_COLLECTOR);

  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('pageerror', (error) => consoleErrors.push(error.message.slice(0, 160)));
  page.on('console', (message) => {
    if (message.type() === 'error' && !IGNORED_FAILURES.test(message.text())) {
      consoleErrors.push(message.text().slice(0, 160));
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.request().resourceType() !== 'document') {
      failedRequests.push(`${response.status()} ${response.url().slice(0, 110)}`);
    }
  });
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? '';
    if (!IGNORED_FAILURES.test(reason))
      failedRequests.push(`failed ${request.url().slice(0, 110)}`);
  });

  await page.goto(url, {
    waitUntil: 'load',
    timeout: config.browser.navigationTimeoutMs,
  });
  // Give late layout shifts and the LCP candidate time to settle.
  await page.waitForTimeout(2_000);

  const vitals = (await page.evaluate(READ_VITALS)) as LabVitals;
  const mobile = (await page.evaluate(MOBILE_LAYOUT_CHECKS)) as MobileLayout;
  const screenshot = await page
    .screenshot({ type: 'jpeg', quality: 60, scale: 'css' })
    .then((buffer) => buffer.toString('base64'))
    .catch(() => null);

  return {
    vitals,
    mobile,
    consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
    failedRequests: [...new Set(failedRequests)].slice(0, 10),
    screenshot,
  };
}

async function accessibilityPhase(
  browser: Browser,
  urls: string[],
  track: (context: BrowserContext) => void,
): Promise<AxeSummary | null> {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    bypassCSP: true, // required for axe-core to run inside strict-CSP pages
    serviceWorkers: 'block',
  });
  track(context);
  await installNetworkGuard(context);

  const findings = new Map<string, AxeFinding>();
  const passed = new Set<string>();
  let pagesChecked = 0;

  for (const url of urls) {
    const page = await context.newPage();
    try {
      await page.goto(url, {
        waitUntil: 'load',
        timeout: config.browser.navigationTimeoutMs,
      });
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      pagesChecked += 1;

      for (const violation of results.violations) {
        const existing = findings.get(violation.id) ?? {
          id: violation.id,
          impact: (violation.impact ?? 'minor') as AxeImpact,
          help: violation.help,
          description: violation.description,
          helpUrl: violation.helpUrl,
          occurrences: 0,
          targets: [],
        };
        existing.occurrences += violation.nodes.length;
        for (const node of violation.nodes) {
          const label = `${pathOf(url)} → ${node.target.join(' ').slice(0, 80)}`;
          if (existing.targets.length < 6 && !existing.targets.includes(label)) {
            existing.targets.push(label);
          }
        }
        findings.set(violation.id, existing);
      }
      for (const pass of results.passes) passed.add(pass.id);
    } catch {
      // One slow or broken page should not discard results from the others.
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  if (pagesChecked === 0) return null;
  for (const id of findings.keys()) passed.delete(id);
  return { findings: [...findings.values()], passedRules: passed.size, pagesChecked };
}

async function inspect(browser: Browser, homeUrl: string, extraPages: string[]) {
  const contexts: BrowserContext[] = [];
  const track = (context: BrowserContext) => contexts.push(context);

  const run = async (): Promise<BrowserAudit | null> => {
    const [mobileResult, axe] = await Promise.allSettled([
      mobilePhase(browser, homeUrl, track),
      accessibilityPhase(
        browser,
        [homeUrl, ...extraPages].slice(0, config.browser.axePages),
        track,
      ),
    ]);

    const mobile = mobileResult.status === 'fulfilled' ? mobileResult.value : null;
    if (!mobile && axe.status !== 'fulfilled') return null;

    return {
      vitals: mobile?.vitals ?? { lcpMs: null, cls: null, tbtMs: null, fcpMs: null },
      mobile: mobile?.mobile ?? null,
      axe: axe.status === 'fulfilled' ? axe.value : null,
      consoleErrors: mobile?.consoleErrors ?? [],
      failedRequests: mobile?.failedRequests ?? [],
      screenshot: mobile?.screenshot ?? null,
    };
  };

  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      run(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), config.browser.totalTimeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    await Promise.all(contexts.map((context) => context.close().catch(() => undefined)));
  }
}

/** Renders the site in headless Chromium. Returns null if the browser is disabled or fails. */
export async function runBrowserAudit(
  homeUrl: string,
  extraPages: string[],
): Promise<BrowserAudit | null> {
  if (!config.browser.enabled) return null;
  try {
    return await withBrowser((browser) => inspect(browser, homeUrl, extraPages));
  } catch (error) {
    console.warn(
      'Browser audit unavailable:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
