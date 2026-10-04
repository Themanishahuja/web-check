import {
  MODULES,
  SEVERITIES,
  calculateModuleScore,
  calculateOverallScore,
  SECURITY_HEADER_ISSUE_IDS,
  type Issue,
  type ModuleId,
  type ModuleResult,
  type ScanProgress,
  type ScanReport,
} from '@whc/shared';
import { auditAccessibility } from '../audit/modules/accessibility.js';
import { auditContent } from '../audit/modules/content.js';
import { auditLinks } from '../audit/modules/links.js';
import { auditMobile } from '../audit/modules/mobile.js';
import { auditPerformance } from '../audit/modules/performance.js';
import { auditSecurity } from '../audit/modules/security.js';
import { auditSeo } from '../audit/modules/seo.js';
import type { AuditContext } from '../audit/context.js';
import type { AuditModule } from '../audit/issue.js';
import { fetchPageSpeed } from '../audit/pagespeed.js';
import { analyzeSecurityHeaders } from '../audit/security/headers.js';
import { buildVitals } from '../audit/vitals.js';
import { runBrowserAudit } from '../browser/inspect.js';
import { detectTechnologies } from '../audit/technology/detect.js';
import { config } from '../config.js';
import { collectAssets } from '../crawl/assets.js';
import { crawlSite, fetchHome } from '../crawl/crawler.js';
import { probeExposures, probeHttpRedirect, probeNotFound } from '../crawl/probes.js';
import { fetchRobots, fetchSitemap } from '../crawl/site-files.js';
import { HttpClient } from '../net/http-client.js';
import { getTlsInfo } from '../net/tls-info.js';
import { pageLabel } from '../audit/context.js';

export type ProgressReporter = (progress: ScanProgress) => void;

/** Scored modules in display order. Technology is handled separately (informational). */
const AUDIT_MODULES: ReadonlyArray<readonly [ModuleId, AuditModule]> = [
  ['performance', auditPerformance],
  ['seo', auditSeo],
  ['security', auditSecurity],
  ['accessibility', auditAccessibility],
  ['mobile', auditMobile],
  ['links', auditLinks],
  ['content', auditContent],
];

const severityRank = new Map(SEVERITIES.map((severity, index) => [severity, index]));
const bySeverity = (a: Issue, b: Issue) =>
  (severityRank.get(a.severity) ?? 99) - (severityRank.get(b.severity) ?? 99);

/**
 * The scan pipeline: Discover → Inspect → Test → Score → Explain.
 * Network I/O happens in the first two stages; the rest is deterministic analysis.
 */
export async function runScan(
  requestedUrl: string,
  report: ProgressReporter,
): Promise<ScanReport> {
  const startedAt = Date.now();
  const http = new HttpClient();

  try {
    // ---- 1. DISCOVER ------------------------------------------------------
    report({ stage: 'discover', percent: 3, message: 'Connecting to your website…' });
    const { home, invalidCert, fellBackToHttp } = await fetchHome(http, requestedUrl);
    const finalUrl = new URL(home.finalUrl);
    const origin = finalUrl.origin;
    const hostname = finalUrl.hostname;

    report({
      stage: 'discover',
      percent: 10,
      message: 'Reading robots.txt and sitemap…',
    });
    const robots = await fetchRobots(http, origin);
    const sitemap = await fetchSitemap(http, origin, robots.sitemaps);

    // Google's lab data runs in parallel with everything else.
    const pageSpeedPromise = fetchPageSpeed(home.finalUrl);

    const pages = await crawlSite(http, home, hostname, sitemap.urls, (done, total) => {
      report({
        stage: 'discover',
        percent: 10 + Math.round((done / total) * 15),
        message: `Discovering pages (${done} of up to ${total})…`,
      });
    });

    // ---- 2. INSPECT -------------------------------------------------------
    report({
      stage: 'inspect',
      percent: 28,
      message: 'Measuring scripts, styles and images…',
    });
    const isHttps = finalUrl.protocol === 'https:';
    const otherPages = pages.slice(1).map((page) => page.finalUrl);
    report({
      stage: 'inspect',
      percent: 30,
      message: 'Rendering your site in a real browser…',
    });
    const [assets, tls, httpRedirect, exposures, notFoundStatus, browser, pageSpeed] =
      await Promise.all([
        collectAssets(http, home),
        isHttps ? getTlsInfo(hostname) : Promise.resolve(null),
        probeHttpRedirect(http, hostname),
        probeExposures(http, origin),
        probeNotFound(http, origin),
        runBrowserAudit(home.finalUrl, otherPages),
        pageSpeedPromise,
      ]);
    report({ stage: 'inspect', percent: 45, message: 'Collecting technical signals…' });

    const vitals = buildVitals(pageSpeed, browser);
    const coverage = { linksFound: 0, linksChecked: 0 };
    const notes: string[] = [];
    if (fellBackToHttp) {
      notes.push(
        'We could not connect to this site over HTTPS, so the scan used plain HTTP. Checks that depend on HTTPS (certificate, HSTS) could not run.',
      );
    }
    if (sitemap.urlCount > pages.length) {
      notes.push(
        `Free scans examine up to ${config.crawl.maxPages} pages. This site's sitemap lists ${sitemap.urlCount}, so issues on pages we did not visit are not included.`,
      );
    }
    if (!browser) {
      notes.push(
        'The real-browser step did not run for this scan, so colour contrast, touch targets, layout overflow and lab Core Web Vitals were not measured.',
      );
    }
    if (vitals?.source === 'browser') {
      notes.push(
        'Core Web Vitals were measured in our own browser without network throttling; real visitors on slower connections will usually see higher numbers.',
      );
    } else if (!vitals) {
      notes.push('Core Web Vitals (LCP, CLS, INP) could not be measured for this scan.');
    }

    const context: AuditContext = {
      requestedUrl,
      origin,
      hostname,
      isHttps,
      http,
      home,
      pages,
      robots,
      sitemap,
      assets,
      tls,
      invalidCert,
      httpRedirect,
      exposures,
      notFoundStatus,
      browser,
      vitals,
      coverage,
      notes,
    };

    // ---- 3. TEST ----------------------------------------------------------
    const modules: ModuleResult[] = [];
    for (const [index, [id, audit]] of AUDIT_MODULES.entries()) {
      report({
        stage: 'test',
        percent: 48 + Math.round((index / AUDIT_MODULES.length) * 37),
        message: `Testing ${MODULES[id].label.toLowerCase()}…`,
      });
      const issues = await audit(context);
      modules.push({ module: id, score: null, issues });
    }

    // ---- 4. SCORE ---------------------------------------------------------
    report({ stage: 'score', percent: 88, message: 'Calculating scores…' });
    for (const result of modules) result.score = calculateModuleScore(result.issues);

    // Security blends two views: general findings (HTTPS, cookies, exposure…) and
    // the header grade, so the module score and the headers panel tell the same story.
    const securityHeaders = analyzeSecurityHeaders(home.headers, isHttps).report;
    const security = modules.find((result) => result.module === 'security');
    if (security) {
      const otherFindings = calculateModuleScore(
        security.issues.filter((issue) => !SECURITY_HEADER_ISSUE_IDS.has(issue.id)),
      );
      security.score = Math.round((otherFindings + securityHeaders.score) / 2);
    }

    // ---- 5. EXPLAIN -------------------------------------------------------
    report({ stage: 'explain', percent: 95, message: 'Writing your recommendations…' });
    for (const result of modules) result.issues.sort(bySeverity);
    const technologies = detectTechnologies(context);
    modules.push({ module: 'technology', score: null, issues: [] });

    const finished: ScanReport = {
      url: home.finalUrl,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      overallScore: calculateOverallScore(modules),
      modules,
      scannedPages: pages.map(pageLabel),
      technologies,
      ...(vitals ? { vitals } : {}),
      securityHeaders,
      coverage: {
        pageLimit: config.crawl.maxPages,
        sitemapUrls: sitemap.urlCount,
        ...coverage,
      },
      ...(browser?.screenshot
        ? { screenshot: `data:image/jpeg;base64,${browser.screenshot}` }
        : {}),
      notes: [...new Set(notes)],
    };
    report({ stage: 'explain', percent: 100, message: 'Done' });
    return finished;
  } finally {
    await http.close().catch(() => undefined);
  }
}
