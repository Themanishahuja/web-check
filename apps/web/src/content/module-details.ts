import type { ModuleId } from '@whc/shared';

export interface ModuleDetail {
  summary: string;
  /** Representative checks — shown in the module wheel and reused on /checks. */
  checks: string[];
}

export const moduleDetails: Record<ModuleId, ModuleDetail> = {
  seo: {
    summary: 'Whether search engines can find, read and understand your pages.',
    checks: [
      'Title & meta description',
      'Headings, canonical, robots.txt',
      'Sitemap, Open Graph, alt text',
    ],
  },
  performance: {
    summary: 'How quickly your pages respond and how heavy they are to load.',
    checks: [
      'Response time & compression',
      'Caching & page weight',
      'Render-blocking & image delivery',
    ],
  },
  security: {
    summary: 'Whether the common security basics are configured correctly.',
    checks: [
      'HTTPS & redirects',
      'HSTS, CSP, frame & content-type headers',
      'Cookie flags & mixed content',
    ],
  },
  accessibility: {
    summary: 'Whether people using assistive technology can use your site.',
    checks: [
      'Image alt text & form labels',
      'Button and link names',
      'Heading order, landmarks, language',
    ],
  },
  mobile: {
    summary: 'Whether your site is set up to work on a phone.',
    checks: [
      'Viewport configuration',
      'Fixed-width layout risks',
      'Responsive images & tiny text',
    ],
  },
  links: {
    summary: 'Whether the links on your pages actually lead somewhere.',
    checks: [
      'Broken internal & external links',
      'Redirect chains',
      'Invalid and insecure URLs',
    ],
  },
  content: {
    summary: 'Whether your pages have enough clear, unique content.',
    checks: [
      'Thin or empty pages',
      'Duplicate titles',
      'Heading structure & text-to-code ratio',
    ],
  },
  technology: {
    summary: 'What your website is built with and where it runs.',
    checks: [
      'CMS & frameworks',
      'Analytics & third-party services',
      'CDN, server & hosting signals',
    ],
  },
};
