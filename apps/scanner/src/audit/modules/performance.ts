import type { Issue } from '@whc/shared';
import { headerValue } from '../../net/http-client.js';
import { issueFactory, type AuditModule } from '../issue.js';

const { check, forEach } = issueFactory('performance');

const KB = 1024;
const MB = KB * KB;
const mb = (bytes: number) => `${(bytes / MB).toFixed(1)} MB`;
const kb = (bytes: number) => `${Math.round(bytes / KB)} KB`;
const shortUrl = (url: string) => {
  try {
    const { pathname, hostname } = new URL(url);
    return `${hostname}${pathname}`.slice(0, 80);
  } catch {
    return url;
  }
};

function maxAge(cacheControl: string | undefined): number | null {
  if (!cacheControl) return null;
  if (/no-store|no-cache/i.test(cacheControl)) return 0;
  const match = cacheControl.match(/(?:s-)?max-age=(\d+)/i);
  return match?.[1] ? Number(match[1]) : null;
}

export const auditPerformance: AuditModule = ({ home, assets, vitals }) => {
  const issues: Issue[] = [];
  const { $ } = home;
  const encoding = (headerValue(home.headers, 'content-encoding') ?? '').toLowerCase();
  const compressed = /gzip|br|deflate|zstd/.test(encoding);

  // --- Server response ---------------------------------------------------
  const ttfb = Math.round(home.ttfbMs);
  issues.push(
    check(ttfb < 800, {
      id: 'ttfb',
      severity: ttfb > 1800 ? 'high' : 'medium',
      fail: `Slow server response (${ttfb} ms)`,
      pass: `Fast server response (${ttfb} ms)`,
      why: 'Nothing can render until the server answers; a slow first byte delays everything else.',
      fix: 'Add server-side caching or a CDN, and look for slow database queries or heavy server rendering.',
    }),
    check(compressed || home.htmlBytes < 1500, {
      id: 'html-compression',
      severity: 'high',
      fail: 'The HTML page is not compressed',
      pass: `The HTML page is compressed (${encoding || 'n/a'})`,
      why: 'Uncompressed text is often 3–5× larger than it needs to be.',
      fix: 'Enable gzip or Brotli compression on your server or CDN.',
    }),
    check(home.htmlBytes < 500 * KB, {
      id: 'html-size',
      severity: 'medium',
      fail: `The HTML document is large (${kb(home.htmlBytes)})`,
      pass: `The HTML document is a reasonable size (${kb(home.htmlBytes)})`,
      why: 'Large documents take longer to download and parse, especially on phones.',
      fix: 'Remove inline data blobs and large inline scripts or styles; load them as cacheable files.',
    }),
  );

  // --- Render blocking ---------------------------------------------------
  const blockingScripts = $('head script[src]')
    .filter((_, el) => {
      const node = $(el);
      return !node.attr('async') && !node.attr('defer') && node.attr('type') !== 'module';
    })
    .map((_, el) => shortUrl($(el).attr('src') ?? ''))
    .get();
  const stylesheetCount = $('link[rel~="stylesheet"]').length;

  issues.push(
    forEach(blockingScripts, {
      id: 'render-blocking-scripts',
      severity: blockingScripts.length >= 3 ? 'high' : 'medium',
      fail: `${blockingScripts.length} render-blocking script(s) in <head>`,
      pass: 'No render-blocking scripts in <head>',
      why: 'The browser stops drawing the page while it downloads and runs these scripts.',
      fix: 'Add defer (or async) to script tags, or move them to the end of <body>.',
    }),
    check(stylesheetCount <= 5, {
      id: 'stylesheet-count',
      severity: 'low',
      fail: `${stylesheetCount} separate stylesheets are loaded`,
      pass: `${stylesheetCount} stylesheet(s) loaded`,
      why: 'Every stylesheet blocks rendering and costs a request.',
      fix: 'Combine and minify CSS, and inline only the critical styles.',
    }),
  );

  // --- Assets ------------------------------------------------------------
  const measured = assets.filter((a) => a.status !== null && a.status < 400);
  const sameOriginText = measured.filter(
    (a) => a.sameOrigin && (a.kind === 'css' || a.kind === 'js'),
  );
  const uncompressed = sameOriginText
    .filter(
      (a) => !/gzip|br|deflate|zstd/i.test(a.encoding ?? '') && (a.bytes ?? 0) > 2 * KB,
    )
    .map((a) => shortUrl(a.url));
  const poorlyCached = measured
    .filter((a) => a.sameOrigin)
    .filter((a) => {
      const age = maxAge(a.cacheControl);
      return age === null || age < 86_400;
    })
    .map((a) => shortUrl(a.url));

  const jsBytes = measured
    .filter((a) => a.kind === 'js')
    .reduce((sum, a) => sum + (a.bytes ?? 0), 0);
  const cssBytes = measured
    .filter((a) => a.kind === 'css')
    .reduce((sum, a) => sum + (a.bytes ?? 0), 0);
  const heavyImages = measured.filter(
    (a) => a.kind === 'image' && (a.bytes ?? 0) > 500 * KB,
  );
  const veryHeavyImage = heavyImages.some((a) => (a.bytes ?? 0) > MB);

  issues.push(
    forEach(uncompressed, {
      id: 'asset-compression',
      severity: 'medium',
      fail: 'CSS/JS files are served without compression',
      pass: 'CSS and JavaScript files are compressed',
      why: 'Uncompressed code files download several times slower than compressed ones.',
      fix: 'Enable gzip or Brotli for text assets (CSS, JS, SVG, JSON) on your server or CDN.',
    }),
    forEach(poorlyCached, {
      id: 'caching',
      severity: 'medium',
      fail: 'Static files have weak or missing browser caching',
      pass: 'Static files are cached by browsers',
      why: 'Without long cache lifetimes, returning visitors re-download the same files every time.',
      fix: 'Send "Cache-Control: public, max-age=31536000, immutable" for versioned assets.',
    }),
    check(jsBytes < MB, {
      id: 'js-size',
      severity: jsBytes > 2 * MB ? 'high' : 'medium',
      fail: `JavaScript payload is large (${mb(jsBytes)})`,
      pass: `JavaScript payload is reasonable (${mb(jsBytes)})`,
      why: 'JavaScript must be downloaded, parsed and run — it is the biggest cause of slow interaction on phones.',
      fix: 'Remove unused libraries, split code by route and lazy-load what is not needed immediately.',
    }),
    check(cssBytes < 300 * KB, {
      id: 'css-size',
      severity: 'low',
      fail: `CSS payload is large (${kb(cssBytes)})`,
      pass: `CSS payload is reasonable (${kb(cssBytes)})`,
      why: 'Large stylesheets delay first paint because CSS blocks rendering.',
      fix: 'Purge unused CSS and minify stylesheets.',
    }),
    forEach(
      heavyImages.map((a) => `${shortUrl(a.url)} (${mb(a.bytes ?? 0)})`),
      {
        id: 'image-weight',
        severity: veryHeavyImage ? 'high' : 'medium',
        fail: 'Some images are very large files',
        pass: 'Images are reasonably sized',
        why: 'Heavy images delay what visitors see first, especially on mobile data.',
        fix: 'Resize images to their display size and use modern formats such as WebP or AVIF.',
      },
    ),
  );

  // --- Images in markup --------------------------------------------------
  const images = $('img');
  const missingDimensions = images
    .filter((_, el) => !($(el).attr('width') && $(el).attr('height')))
    .map((_, el) => shortUrl($(el).attr('src') ?? ''))
    .get();
  const eagerBelowFold = images
    .slice(3)
    .filter((_, el) => $(el).attr('loading') !== 'lazy')
    .map((_, el) => shortUrl($(el).attr('src') ?? ''))
    .get();

  issues.push(
    forEach(images.length > 0 ? missingDimensions : [], {
      id: 'image-dimensions',
      severity: 'low',
      fail: 'Images have no width/height attributes',
      pass: 'Images declare their dimensions',
      why: 'Without dimensions the page jumps around as images load (layout shift).',
      fix: 'Add width and height attributes (or CSS aspect-ratio) to every image.',
    }),
    forEach(eagerBelowFold, {
      id: 'image-lazy',
      severity: 'low',
      fail: 'Below-the-fold images are not lazy-loaded',
      pass: 'Below-the-fold images are lazy-loaded',
      why: 'Loading every image up-front slows the visible part of the page.',
      fix: 'Add loading="lazy" to images that start off-screen.',
    }),
  );

  const thirdPartyScripts = new Set(
    $('script[src]')
      .map((_, el) => {
        try {
          return new URL($(el).attr('src') ?? '', home.finalUrl).hostname;
        } catch {
          return '';
        }
      })
      .get()
      .filter((host) => host && host !== new URL(home.finalUrl).hostname),
  );
  issues.push(
    check(thirdPartyScripts.size <= 8, {
      id: 'third-party',
      severity: 'low',
      fail: `Scripts load from ${thirdPartyScripts.size} different third-party domains`,
      pass: `Scripts load from ${thirdPartyScripts.size} third-party domain(s)`,
      why: 'Each third party adds connections and can slow or break your page.',
      fix: 'Remove third-party scripts you do not need and self-host the rest where possible.',
    }),
  );

  // --- Core Web Vitals (Google PageSpeed Insights, when available) --------
  if (vitals) {
    const { lcpMs, cls, tbtMs, inpMs } = vitals;
    if (lcpMs !== null) {
      issues.push(
        check(lcpMs <= 2500, {
          id: 'lcp',
          severity: lcpMs > 4000 ? 'high' : 'medium',
          fail: `Largest Contentful Paint is slow (${(lcpMs / 1000).toFixed(1)} s)`,
          pass: `Largest Contentful Paint is good (${(lcpMs / 1000).toFixed(1)} s)`,
          why: 'LCP measures when the main content appears. Slow LCP means visitors stare at a blank page.',
          fix: 'Optimise the hero image or heading, reduce server time and remove render-blocking resources.',
        }),
      );
    }
    if (cls !== null) {
      issues.push(
        check(cls <= 0.1, {
          id: 'cls',
          severity: cls > 0.25 ? 'high' : 'medium',
          fail: `Layout shifts while loading (CLS ${cls.toFixed(2)})`,
          pass: `Layout is stable while loading (CLS ${cls.toFixed(2)})`,
          why: 'Content that jumps around causes misclicks and feels broken.',
          fix: 'Reserve space for images, ads and embeds with width/height or aspect-ratio.',
        }),
      );
    }
    if (inpMs !== null) {
      issues.push(
        check(inpMs <= 200, {
          id: 'inp',
          severity: inpMs > 500 ? 'high' : 'medium',
          fail: `Interactions feel slow (INP ${Math.round(inpMs)} ms)`,
          pass: `Interactions are responsive (INP ${Math.round(inpMs)} ms)`,
          why: 'INP measures how quickly the page responds to taps and clicks, based on real visitors.',
          fix: 'Break up long JavaScript tasks and reduce the work done on interaction.',
        }),
      );
    } else if (tbtMs !== null) {
      issues.push(
        check(tbtMs <= 200, {
          id: 'tbt',
          severity: tbtMs > 600 ? 'high' : 'medium',
          fail: `The main thread is blocked for ${Math.round(tbtMs)} ms while loading`,
          pass: `Main thread is responsive while loading (${Math.round(tbtMs)} ms blocking)`,
          why: 'Total Blocking Time is the lab proxy for slow interaction (INP).',
          fix: 'Defer non-critical JavaScript and split long tasks.',
        }),
      );
    }
  }

  return issues;
};
