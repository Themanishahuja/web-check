import { MODULES, SCAN_LIMITS, type Issue, type ModuleId } from '@whc/shared';
import type { DocSection } from '@/components/content/doc-layout';
import { IssueItem } from '@/features/report/components/issue-item';
import { moduleDetails } from '@/content/module-details';

interface AreaReference {
  module: ModuleId;
  /** What we actually check, in plain language. Each line maps to a real rule. */
  checks: string[];
  why: string;
  example: Pick<Issue, 'severity' | 'title' | 'why' | 'fix'> & { affected?: string[] };
  actions: string;
}

const areas: AreaReference[] = [
  {
    module: 'seo',
    checks: [
      'Whether search engines are allowed to index the page (noindex tags and headers)',
      'robots.txt: present, and not blocking the whole site',
      'XML sitemap: present and how many URLs it lists',
      'Page title: present, and a sensible length',
      'Meta description: present, and a sensible length',
      'Headings: one clear H1 per page',
      'Canonical URL',
      'Open Graph tags for link previews',
      'Image alt text',
      'Structured data (JSON-LD)',
      'Internal links from the homepage',
    ],
    why: 'Search engines can only rank what they can find and understand. Missing titles, accidental noindex tags or a blocked robots.txt quietly keep good pages out of search results.',
    example: {
      severity: 'medium',
      title: 'Meta description is missing on 2 pages',
      why: 'Search engines have no clear summary to show under your page title.',
      fix: 'Add a unique meta description of about 150 characters to each page’s <head>.',
      affected: ['/pricing', '/contact'],
    },
    actions:
      'Fix titles, descriptions and headings first — they are quick wins. Make sure robots.txt and any noindex tags are intentional. Submit your sitemap in Google Search Console.',
  },
  {
    module: 'performance',
    checks: [
      'Server response time (time to first byte)',
      'Compression of HTML, CSS and JavaScript (gzip or Brotli)',
      'Browser caching of static files',
      'Page weight: HTML size, JavaScript size, CSS size',
      'Render-blocking scripts in the head and number of stylesheets',
      'Heavy images, missing image dimensions and lazy loading',
      'How many third-party domains your scripts come from',
      'Core Web Vitals: loading (LCP), visual stability (CLS) and responsiveness (INP or blocking time)',
    ],
    why: 'Slow pages lose visitors and conversions, and Google uses Core Web Vitals as a ranking signal. Most slowness comes from a few oversized images and scripts.',
    example: {
      severity: 'high',
      title: 'Largest Contentful Paint is slow (4.2 s)',
      why: 'LCP measures when the main content appears. Slow LCP means visitors stare at a blank page.',
      fix: 'Optimise the hero image or heading, reduce server time and remove render-blocking resources.',
    },
    actions:
      'Resize and compress images, serve them as WebP or AVIF, defer non-essential scripts, and enable caching and compression on your server or CDN.',
  },
  {
    module: 'security',
    checks: [
      'HTTPS, and whether http:// redirects to it',
      'SSL/TLS certificate: trusted, not about to expire, modern protocol version',
      '19 HTTP security headers, graded: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy and more',
      'Cookie flags: Secure, HttpOnly, SameSite',
      'Mixed content: insecure files loaded on secure pages',
      'Server software and version disclosed in headers',
      'Publicly readable sensitive files (/.env and /.git)',
    ],
    why: 'Most real-world compromises start with simple misconfigurations. Security headers and HTTPS settings are free to fix and block whole classes of attack.',
    example: {
      severity: 'medium',
      title: 'No Content-Security-Policy header',
      why: 'A CSP limits which scripts can run on your pages, reducing the damage of injected code (XSS).',
      fix: 'Start with a Content-Security-Policy-Report-Only header, then enforce a policy that avoids unsafe-inline.',
    },
    actions:
      'Turn on HTTPS and HSTS first, then add the other headers one at a time, testing as you go. This is a configuration check, not a penetration test.',
  },
  {
    module: 'accessibility',
    checks: [
      'The rendered page is tested against WCAG 2.0, 2.1 and 2.2 (levels A and AA) with the axe-core engine, on up to ' +
        SCAN_LIMITS.accessibilityPages +
        ' pages',
      'Colour contrast between text and background',
      'Images without alt text, form fields without labels, buttons and links without names',
      'ARIA roles and references that are invalid',
      'Page language, titles and zoom restrictions',
      'Heading order, landmarks (main, nav) and a skip-to-content link',
      'Positive tabindex values and removed keyboard focus outlines',
    ],
    why: 'About one in five people has a disability that affects how they use the web. Accessible sites reach more customers, rank better and reduce legal risk.',
    example: {
      severity: 'high',
      title: 'Elements must meet minimum colour contrast ratio thresholds (12 places)',
      why: 'Ensure the contrast between foreground and background colours meets WCAG 2 AA minimum contrast ratio thresholds.',
      fix: 'Darken the text or lighten the background until contrast is at least 4.5:1 (3:1 for large text).',
      affected: ['/ → .hero > p.lead', '/pricing → .plan-note'],
    },
    actions:
      'Fix contrast and missing labels first. Test with a keyboard (Tab through the page) and a screen reader. Automated tools find only part of the issues, so treat this as a starting point.',
  },
  {
    module: 'mobile',
    checks: [
      'Viewport meta tag and responsive CSS',
      'Horizontal overflow: content wider than a phone screen',
      'Touch targets smaller than 24×24 px',
      'Text rendered smaller than 12 px',
      'Responsive images and overall page weight on mobile',
      'Legacy plugins such as Flash',
      'A favicon / home-screen icon',
    ],
    why: 'Most web traffic is on phones, and Google indexes the mobile version of your site first. A layout that works on a desktop can be unusable on a small screen.',
    example: {
      severity: 'high',
      title: 'Content is 64px wider than a phone screen',
      why: 'Visitors have to scroll sideways to read the page, which feels broken on mobile.',
      fix: 'Find the elements wider than the screen and give them relative widths (max-width: 100%) or let them wrap.',
      affected: ['table.pricing', 'div.hero-image'],
    },
    actions:
      'Add the viewport tag, use responsive units, and make buttons and links big enough to tap. Test on a real phone.',
  },
  {
    module: 'links',
    checks: [
      'Broken internal and external links (up to ' + SCAN_LIMITS.links + ' per scan)',
      'Redirect chains and links that point to redirected URLs',
      'Invalid, empty and placeholder links',
      'Broken images',
      'Whether missing pages return a real 404 (not a “soft 404”)',
      'JavaScript errors and files that fail to load when the homepage opens',
      'Forms without a submit button or posting to insecure addresses',
    ],
    why: 'Dead ends frustrate visitors and waste crawl budget. Search engines treat many broken links as a sign of a neglected site.',
    example: {
      severity: 'high',
      title: '1 broken internal link(s)',
      why: 'Visitors hit a dead end, and search engines treat broken pages as a sign of neglect.',
      fix: 'Fix the link target, restore the page, or redirect the old URL to the closest live page.',
      affected: ['https://example.com/old-pricing — 404 (on /)'],
    },
    actions:
      'Fix or redirect broken internal links first. Link directly to final URLs. Make sure unknown addresses return a proper 404 page.',
  },
  {
    module: 'content',
    checks: [
      'Empty or very thin pages',
      'Duplicate titles and meta descriptions across pages',
      'Pages with long text but no headings',
      'Text-to-code ratio',
      'Placeholder text such as “lorem ipsum”',
      'Contact information and a privacy policy link',
    ],
    why: 'Visitors and search engines both look for substantial, distinct, well-structured pages. Thin or duplicated pages dilute the value of the rest of your site.',
    example: {
      severity: 'medium',
      title: 'Pages with thin content',
      why: 'Thin pages give visitors and search engines little to work with.',
      fix: 'Expand the page with useful, original content, or merge it into a stronger page.',
      affected: ['/thank-you (62 words)'],
    },
    actions:
      'Give every page a unique title and enough genuinely useful text. Merge or remove pages that exist only as placeholders.',
  },
  {
    module: 'technology',
    checks: [
      'Content management systems and e-commerce platforms',
      'Frameworks and JavaScript libraries',
      'Analytics, tag managers and marketing pixels',
      'CDN, hosting and web server signals',
      'Payment, chat and security (CAPTCHA) services',
    ],
    why: 'Knowing what a site is built on helps you plan upgrades, spot unmaintained dependencies and understand what third-party services your visitors’ data flows to.',
    example: {
      severity: 'passed',
      title: '4 technologies detected: Next.js, React, Cloudflare, Google Analytics',
      why: '',
      fix: '',
    },
    actions:
      'This area is informational and does not change your score. Use it as an inventory: is everything listed still needed and kept up to date?',
  },
];

function label(text: string) {
  return (
    <h3 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
      {text}
    </h3>
  );
}

export const checkSections: DocSection[] = areas.map((area) => ({
  id: area.module,
  title: MODULES[area.module].label,
  body: (
    <>
      <p className="text-xl text-ink">{moduleDetails[area.module].summary}</p>

      <div className="space-y-3">
        {label('What we check')}
        <ul>
          {area.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {label('Why it matters')}
        <p>{area.why}</p>
      </div>

      <div className="space-y-3">
        {label('Example of a finding')}
        <div className="border-y border-ink">
          <IssueItem
            issue={{ id: `example-${area.module}`, module: area.module, ...area.example }}
            className="py-5"
          />
        </div>
      </div>

      <div className="space-y-3">
        {label('What you can do')}
        <p>{area.actions}</p>
      </div>
    </>
  ),
}));
