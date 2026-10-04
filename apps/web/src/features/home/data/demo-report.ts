import type { DetectedTechnology, ModuleResult } from '@whc/shared';
import { calculateOverallScore } from '@whc/shared';

/** Illustrative sample used by the homepage dashboard preview. Not a real scan. */
export const demoModules: ModuleResult[] = [
  {
    module: 'seo',
    score: 91,
    issues: [
      {
        id: 'seo-meta-description',
        module: 'seo',
        severity: 'medium',
        title: 'Meta description is missing on 2 pages',
        why: 'Search engines have no clear summary to show under your page title.',
        fix: 'Add a unique meta description of about 150 characters to each page’s <head>.',
        affected: ['/pricing', '/contact'],
      },
      {
        id: 'seo-title',
        module: 'seo',
        severity: 'passed',
        title: 'Page title is present and well sized',
        why: '',
        fix: '',
      },
    ],
  },
  {
    module: 'performance',
    score: 84,
    issues: [
      {
        id: 'perf-images',
        module: 'performance',
        severity: 'high',
        title: 'Hero image is 2.4 MB',
        why: 'Large images delay what visitors see first, especially on mobile data.',
        fix: 'Resize it to the displayed size and serve a modern format such as WebP or AVIF.',
        affected: ['/images/hero.jpg'],
      },
      {
        id: 'perf-gzip',
        module: 'performance',
        severity: 'passed',
        title: 'Text compression is enabled',
        why: '',
        fix: '',
      },
    ],
  },
  {
    module: 'security',
    score: 96,
    issues: [
      {
        id: 'sec-csp',
        module: 'security',
        severity: 'low',
        title: 'No Content-Security-Policy header',
        why: 'A CSP limits what scripts can run on your pages, reducing the impact of injected code.',
        fix: 'Start with a report-only Content-Security-Policy header and tighten it over time.',
      },
      {
        id: 'sec-https',
        module: 'security',
        severity: 'passed',
        title: 'HTTPS is enforced with HSTS',
        why: '',
        fix: '',
      },
    ],
  },
  {
    module: 'accessibility',
    score: 78,
    issues: [
      {
        id: 'a11y-label',
        module: 'accessibility',
        severity: 'high',
        title: 'Email field has no label',
        why: 'Screen reader users cannot tell what the field is for.',
        fix: 'Add a <label for="email"> or an aria-label to the input.',
        affected: ['/'],
      },
      {
        id: 'a11y-alt',
        module: 'accessibility',
        severity: 'medium',
        title: '3 images are missing alt text',
        why: 'People using screen readers get no description of the image.',
        fix: 'Add a short, meaningful alt attribute (or alt="" for purely decorative images).',
        affected: ['/', '/about'],
      },
    ],
  },
  {
    module: 'mobile',
    score: 88,
    issues: [
      {
        id: 'mobile-srcset',
        module: 'mobile',
        severity: 'low',
        title: 'Images are not responsive',
        why: 'Phones download desktop-sized images they do not need.',
        fix: 'Use srcset and sizes so each device receives an appropriately sized file.',
      },
      {
        id: 'mobile-viewport',
        module: 'mobile',
        severity: 'passed',
        title: 'Viewport is configured',
        why: '',
        fix: '',
      },
    ],
  },
  {
    module: 'links',
    score: 100,
    issues: [
      {
        id: 'links-ok',
        module: 'links',
        severity: 'passed',
        title: 'No broken links found on scanned pages',
        why: '',
        fix: '',
      },
    ],
  },
  {
    module: 'content',
    score: 86,
    issues: [
      {
        id: 'content-thin',
        module: 'content',
        severity: 'medium',
        title: 'One page has very little text',
        why: 'Thin pages give visitors and search engines little to work with.',
        fix: 'Expand the page with useful content, or merge it into a stronger page.',
        affected: ['/thank-you'],
      },
    ],
  },
  { module: 'technology', score: null, issues: [] },
];

export const demoTechnologies: DetectedTechnology[] = [
  { name: 'Next.js', category: 'Framework' },
  { name: 'React', category: 'JavaScript library' },
  { name: 'Cloudflare', category: 'CDN' },
  { name: 'Google Analytics 4', category: 'Analytics' },
];

export const demoOverallScore = calculateOverallScore(demoModules);
