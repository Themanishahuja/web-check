import { SCAN_LIMITS } from '@whc/shared';
import type { Stage } from '@/components/content/stage-list';

export const howItWorksStages: Stage[] = [
  {
    title: 'Discover',
    summary: 'We find out what your site is made of.',
    details: [
      'We load your homepage and follow any redirects (http to https, non-www to www).',
      'We read robots.txt and your sitemap.',
      `We pick up to ${SCAN_LIMITS.pages} pages to examine — the homepage and the shallowest pages it links to.`,
    ],
    example: `GET /               200   142 ms
GET /robots.txt     200
GET /sitemap.xml    200   38 URLs
→ ${SCAN_LIMITS.pages} pages selected`,
  },
  {
    title: 'Inspect',
    summary: 'We collect the raw facts: HTML, headers, files and a real browser view.',
    details: [
      'Each page’s HTML, headings, images, forms, scripts and links are parsed.',
      'CSS, JavaScript and image files are measured for size, compression and caching.',
      'Your server’s response headers and SSL/TLS certificate are read.',
      'Your homepage is rendered in a real browser on a phone-sized screen, and accessibility is tested on up to ' +
        SCAN_LIMITS.accessibilityPages +
        ' pages.',
    ],
    example: `CSS   3 files    118 KB
JS    9 files    1.2 MB
TLS   v1.3       expires in 61 days
Chrome  LCP 2.1 s · CLS 0.00
axe-core  3 pages · 61 rules passed`,
  },
  {
    title: 'Test',
    summary: 'Hundreds of small, fixed rules are run against those facts.',
    details: [
      'Each rule asks one precise question: is there a title? Is HSTS set? Is this link alive?',
      'The same facts always give the same answers — no guesswork and no AI judgement.',
      'Rules cover SEO, performance, security, accessibility, mobile, links and content.',
    ],
    example: `title.length        34    ok   30–60
h1.count             0    FAIL expected 1
strict-transport…   –     FAIL missing
links.broken         1    FAIL /old-pricing`,
  },
  {
    title: 'Score',
    summary: 'Findings become scores you can trace back.',
    details: [
      'Every area starts at 100. A failed check subtracts points according to how serious it is.',
      'Area scores combine into an overall health score using published weights.',
      'Security is graded A+ to F from 19 HTTP headers.',
    ],
    example: `SEO   100
       −8   medium  no meta description
       −3   low     no canonical URL
      ────
       89`,
  },
  {
    title: 'Explain',
    summary: 'Every finding says what’s wrong, why it matters and how to fix it.',
    details: [
      'Findings are sorted so the most important ones come first.',
      'The language is written for the person who owns the website, not only for developers.',
      'You can share the report, download it as a PDF, or save the raw data as JSON.',
    ],
    example: `HIGH   Missing meta description
Why    Search engines have no clear
       summary to show under your title.
Fix    Add a unique description of about
       150 characters to each page.`,
  },
];

export const reportContents = [
  'An overall health score and a score for each area',
  'The most important fixes, ranked',
  'A security-header grade with all 19 headers explained',
  'Core Web Vitals for loading, stability and responsiveness',
  'Every finding with its why-it-matters and how-to-fix',
  'The technology your site is built with',
  'A phone screenshot of your homepage',
  'A PDF version you can send to a client or colleague',
] as const;

export const scanFacts: Array<{ label: string; value: string }> = [
  { label: 'Pages examined', value: `up to ${SCAN_LIMITS.pages}` },
  { label: 'Links checked', value: `up to ${SCAN_LIMITS.links}` },
  {
    label: 'Accessibility tested on',
    value: `up to ${SCAN_LIMITS.accessibilityPages} pages`,
  },
  { label: 'Typical scan time', value: '10–50 seconds' },
  { label: 'Report available for', value: `${SCAN_LIMITS.reportMinutes} minutes` },
  { label: 'Account needed', value: 'None' },
];
