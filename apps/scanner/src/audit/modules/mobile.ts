import type { Issue } from '@whc/shared';
import { pageLabel } from '../context.js';
import { issueFactory, type AuditModule } from '../issue.js';

const { check, forEach } = issueFactory('mobile');

const MB = 1024 * 1024;

export const auditMobile: AuditModule = ({ home, pages, assets, notes, browser }) => {
  const { $ } = home;
  const viewport = $('meta[name="viewport"]').attr('content') ?? '';
  const hasViewport = viewport.length > 0;
  const deviceWidth = /width\s*=\s*device-width/i.test(viewport);

  const css = assets.map((a) => a.css ?? '').join('\n');
  const inlineCss = $('style')
    .toArray()
    .map((el) => $(el).text())
    .join('\n');
  const hasMediaQueries = /@media[^{]*(max|min)-width|@container/i.test(
    `${css}\n${inlineCss}`,
  );
  const cssWasRead = css.length > 0 || inlineCss.length > 0;

  const fixedWidth = pages
    .filter((p) => {
      const wide = p
        .$('table[width], div[width], td[width]')
        .filter((_, el) => Number(p.$(el).attr('width')) > 480).length;
      const inline = p.$('[style]').filter((_, el) => {
        const match = (p.$(el).attr('style') ?? '').match(
          /(?:^|;)\s*width\s*:\s*(\d+)px/i,
        );
        return match?.[1] ? Number(match[1]) > 600 : false;
      }).length;
      return wide + inline > 0;
    })
    .map(pageLabel);

  const tinyText = pages
    .filter(
      (p) =>
        p.$('[style]').filter((_, el) => {
          const match = (p.$(el).attr('style') ?? '').match(
            /font-size\s*:\s*(\d+(?:\.\d+)?)px/i,
          );
          return match?.[1] ? Number(match[1]) < 12 : false;
        }).length > 0 || p.$('font[size="1"]').length > 0,
    )
    .map(pageLabel);

  const imagesWithoutSrcset = $('img[src]:not([srcset])').filter(
    (_, el) => !/\.svg(\?|$)/i.test($(el).attr('src') ?? ''),
  ).length;
  const pictureCount = $('picture').length;
  const hasIcon = $('link[rel~="icon"], link[rel="apple-touch-icon"]').length > 0;
  const legacyEmbeds = $('embed, object[type*="flash"], frameset, applet').length;

  const measured = assets.filter((a) => a.status !== null && a.status < 400);
  const totalWeight =
    home.wireBytes + measured.reduce((sum, a) => sum + (a.bytes ?? 0), 0);

  if (!cssWasRead && !browser?.mobile) {
    notes.push(
      'Mobile layout checks used the HTML only; no same-origin stylesheet could be read.',
    );
  }
  if (!browser?.mobile) {
    notes.push(
      'Touch-target size and rendered text readability were not measured because the browser step did not run.',
    );
  }

  const issues: Issue[] = [
    check(hasViewport, {
      id: 'viewport',
      severity: 'critical',
      fail: 'No viewport meta tag',
      pass: 'A viewport meta tag is present',
      why: 'Without it, phones render the page at desktop width and shrink everything to illegible size.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head>.',
    }),
    check(!hasViewport || deviceWidth, {
      id: 'viewport-width',
      severity: 'high',
      fail: 'The viewport does not use width=device-width',
      pass: 'The viewport adapts to the device width',
      why: 'A fixed viewport width prevents the layout from fitting the screen.',
      fix: 'Set the viewport content to "width=device-width, initial-scale=1".',
    }),
    check(!cssWasRead || hasMediaQueries, {
      id: 'media-queries',
      severity: 'medium',
      fail: 'No responsive CSS (media queries) detected',
      pass: 'Responsive CSS (media queries) detected',
      why: 'Without responsive rules, the same desktop layout is forced onto small screens.',
      fix: 'Use responsive CSS (media queries, flexbox/grid) so the layout adapts to narrow screens.',
    }),
    forEach(fixedWidth, {
      id: 'fixed-width',
      severity: 'medium',
      fail: 'Fixed-width elements may cause horizontal scrolling on phones',
      pass: 'No wide fixed-width elements detected',
      why: 'Elements wider than the screen force visitors to scroll sideways.',
      fix: 'Use relative widths (%, max-width: 100%) instead of large fixed pixel widths.',
    }),
    forEach(tinyText, {
      id: 'tiny-text',
      severity: 'low',
      fail: 'Very small text sizes are set',
      pass: 'No very small inline text sizes',
      why: 'Text under about 12px is hard to read on a phone.',
      fix: 'Use at least 16px for body text and 12px for fine print.',
    }),
    check(imagesWithoutSrcset <= 3 || pictureCount > 0, {
      id: 'responsive-images',
      severity: 'low',
      fail: 'Images are not responsive',
      pass: 'Images are served responsively',
      why: 'Phones download desktop-sized images they do not need.',
      fix: 'Use srcset and sizes (or <picture>) so each device gets an appropriately sized file.',
    }),
    check(totalWeight < 3 * MB, {
      id: 'page-weight',
      severity: totalWeight > 5 * MB ? 'high' : 'medium',
      fail: `The homepage is heavy for mobile networks (${(totalWeight / MB).toFixed(1)} MB measured)`,
      pass: `Page weight is mobile-friendly (${(totalWeight / MB).toFixed(1)} MB measured)`,
      why: 'Large pages load slowly and cost visitors mobile data.',
      fix: 'Compress images, remove unused scripts and lazy-load below-the-fold content.',
    }),
    check(legacyEmbeds === 0, {
      id: 'legacy-embeds',
      severity: 'high',
      fail: 'Legacy plugins or frames are used',
      pass: 'No legacy plugins or frames',
      why: 'Flash, applets and framesets do not work on phones.',
      fix: 'Replace them with modern HTML5 elements.',
    }),
    check(hasIcon, {
      id: 'icons',
      severity: 'low',
      fail: 'No favicon or home-screen icon declared',
      pass: 'A site icon is declared',
      why: 'Icons identify your site in browser tabs, bookmarks and home screens.',
      fix: 'Add <link rel="icon"> and an apple-touch-icon.',
    }),
  ];

  const layout = browser?.mobile;
  if (!layout) return issues;

  // Rendered measurements supersede the HTML-only guesses for the same questions.
  const superseded = new Set(['mobile-fixed-width', 'mobile-tiny-text']);
  return [
    ...issues.filter((issue) => !superseded.has(issue.id)),
    check(layout.overflowPx === 0, {
      id: 'horizontal-overflow',
      severity: 'high',
      fail: `Content is ${layout.overflowPx}px wider than a phone screen`,
      pass: 'No horizontal scrolling on a phone',
      why: 'Visitors have to scroll sideways to read the page, which feels broken on mobile.',
      fix: 'Find the elements wider than the screen and give them relative widths (max-width: 100%) or let them wrap.',
      affected: layout.overflowElements,
    }),
    check(layout.smallTargetCount === 0, {
      id: 'touch-targets',
      severity: layout.smallTargetCount > 5 ? 'medium' : 'low',
      fail: `${layout.smallTargetCount} tap target(s) are smaller than 24×24 px`,
      pass: 'Tap targets are large enough',
      why: 'Tiny buttons and links are hard to hit with a finger, causing mis-taps.',
      fix: 'Make interactive elements at least 24×24 px (ideally 44×44 px) with enough space around them.',
      affected: layout.smallTargets,
    }),
    check(layout.smallTextCount === 0, {
      id: 'rendered-text-size',
      severity: 'low',
      fail: `${layout.smallTextCount} text element(s) render smaller than 12 px`,
      pass: 'Text is a readable size on a phone',
      why: 'Text under 12 px is hard to read on a phone without zooming.',
      fix: 'Use at least 16 px for body text and 12 px for fine print.',
      affected: layout.smallText,
    }),
  ];
};
