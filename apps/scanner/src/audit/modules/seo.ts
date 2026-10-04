import { headerValue } from '../../net/http-client.js';
import { pageLabel } from '../context.js';
import { issueFactory, type AuditModule } from '../issue.js';

const { check, forEach } = issueFactory('seo');

export const auditSeo: AuditModule = ({ home, pages, robots, sitemap }) => {
  const noindexHeader = /noindex/i.test(headerValue(home.headers, 'x-robots-tag') ?? '');
  const noindexMeta = /noindex/i.test(
    home.$('meta[name="robots"]').attr('content') ?? '',
  );

  const missingTitle = pages
    .filter((p) => !p.$('head title').first().text().trim())
    .map(pageLabel);
  const badTitleLength = pages
    .filter((p) => {
      const length = p.$('head title').first().text().trim().length;
      return length > 0 && (length < 20 || length > 65);
    })
    .map(pageLabel);
  const missingDescription = pages
    .filter((p) => !p.$('meta[name="description"]').attr('content')?.trim())
    .map(pageLabel);
  const badDescriptionLength = pages
    .filter((p) => {
      const length = p.$('meta[name="description"]').attr('content')?.trim().length ?? 0;
      return length > 0 && (length < 70 || length > 170);
    })
    .map(pageLabel);
  const missingH1 = pages.filter((p) => p.$('h1').length === 0).map(pageLabel);
  const multipleH1 = pages.filter((p) => p.$('h1').length > 1).map(pageLabel);
  const missingAlt = pages
    .filter((p) => p.$('img:not([alt])').length > 0)
    .map((p) => `${pageLabel(p)} (${p.$('img:not([alt])').length})`);

  const canonical = home.$('link[rel="canonical"]').attr('href');
  const hasOg = ['og:title', 'og:description', 'og:image'].every((property) =>
    Boolean(home.$(`meta[property="${property}"]`).attr('content')),
  );
  const hasStructuredData = home.$('script[type="application/ld+json"]').length > 0;
  const internalLinks = home.$('a[href]').filter((_, el) => {
    const href = home.$(el).attr('href') ?? '';
    return href.startsWith('/') || href.includes(new URL(home.finalUrl).hostname);
  }).length;

  return [
    check(!noindexHeader && !noindexMeta, {
      id: 'indexable',
      severity: 'critical',
      fail: 'The homepage tells search engines not to index it',
      pass: 'The homepage can be indexed by search engines',
      why: 'A "noindex" directive removes the page from Google and other search results.',
      fix: 'Remove the noindex robots meta tag or X-Robots-Tag header unless the page is meant to stay private.',
    }),
    check(!robots.blocksAll, {
      id: 'robots-blocks-all',
      severity: 'critical',
      fail: 'robots.txt blocks all crawlers from the whole site',
      pass: 'robots.txt does not block the whole site',
      why: '"Disallow: /" tells every search engine to stay away from every page.',
      fix: 'Remove the "Disallow: /" rule for "User-agent: *" in robots.txt.',
    }),
    forEach(missingTitle, {
      id: 'title-missing',
      severity: 'high',
      fail: 'Pages are missing a title',
      pass: 'Every scanned page has a title',
      why: 'The title is the main headline shown in search results and browser tabs.',
      fix: 'Add a unique, descriptive <title> inside each page’s <head>.',
    }),
    forEach(badTitleLength, {
      id: 'title-length',
      severity: 'low',
      fail: 'Some titles are too short or too long',
      pass: 'Page titles are a good length',
      why: 'Very short titles waste ranking opportunity; long ones get cut off in search results.',
      fix: 'Aim for roughly 30–60 characters that describe the page clearly.',
    }),
    forEach(missingDescription, {
      id: 'description-missing',
      severity: 'medium',
      fail: 'Pages are missing a meta description',
      pass: 'Every scanned page has a meta description',
      why: 'Search engines have no clear summary to show under your page title.',
      fix: 'Add a unique meta description of about 150 characters to each page’s <head>.',
    }),
    forEach(badDescriptionLength, {
      id: 'description-length',
      severity: 'low',
      fail: 'Some meta descriptions are too short or too long',
      pass: 'Meta descriptions are a good length',
      why: 'Descriptions outside the typical display length are truncated or look thin.',
      fix: 'Write descriptions of about 70–160 characters.',
    }),
    forEach(missingH1, {
      id: 'h1-missing',
      severity: 'medium',
      fail: 'Pages have no H1 heading',
      pass: 'Every scanned page has an H1 heading',
      why: 'The H1 tells visitors and search engines what the page is about.',
      fix: 'Add one clear <h1> to each page that matches its main topic.',
    }),
    forEach(multipleH1, {
      id: 'h1-multiple',
      severity: 'low',
      fail: 'Some pages have more than one H1',
      pass: 'No page has competing H1 headings',
      why: 'Multiple H1s dilute the page’s main topic and confuse the outline.',
      fix: 'Keep a single <h1> and use <h2>–<h6> for sub-sections.',
    }),
    check(Boolean(canonical), {
      id: 'canonical',
      severity: 'low',
      fail: 'The homepage has no canonical URL',
      pass: 'The homepage declares a canonical URL',
      why: 'Without a canonical, duplicate URLs (www/non-www, tracking parameters) can split ranking signals.',
      fix: 'Add <link rel="canonical" href="https://…"> pointing to the preferred URL.',
    }),
    check(robots.found, {
      id: 'robots-txt',
      severity: 'low',
      fail: 'No robots.txt file found',
      pass: 'robots.txt is present',
      why: 'robots.txt tells crawlers what they may visit and where your sitemap is.',
      fix: 'Create /robots.txt and reference your sitemap in it.',
    }),
    check(sitemap.found, {
      id: 'sitemap',
      severity: 'medium',
      fail: 'No XML sitemap found',
      pass: `XML sitemap found (${sitemap.urlCount} URLs)`,
      why: 'A sitemap helps search engines discover all of your important pages.',
      fix: 'Generate a sitemap.xml and submit it in Google Search Console.',
    }),
    check(hasOg, {
      id: 'open-graph',
      severity: 'low',
      fail: 'Open Graph tags are incomplete',
      pass: 'Open Graph tags are present',
      why: 'Without og:title, og:description and og:image, shared links look bare on social platforms and chat apps.',
      fix: 'Add og:title, og:description and og:image meta tags to the homepage.',
    }),
    forEach(missingAlt, {
      id: 'image-alt',
      severity: 'low',
      fail: 'Images are missing alt text',
      pass: 'All images have alt text',
      why: 'Alt text helps image search and describes images when they cannot be seen.',
      fix: 'Add a short descriptive alt attribute to each image (use alt="" for decorative ones).',
    }),
    check(hasStructuredData, {
      id: 'structured-data',
      severity: 'low',
      fail: 'No structured data (JSON-LD) found',
      pass: 'Structured data (JSON-LD) found',
      why: 'Structured data can unlock rich results such as ratings, FAQs and breadcrumbs.',
      fix: 'Add schema.org JSON-LD that describes your organisation, products or articles.',
    }),
    check(internalLinks >= 3, {
      id: 'internal-links',
      severity: 'low',
      fail: 'The homepage links to very few internal pages',
      pass: 'The homepage links to other pages on the site',
      why: 'Internal links help visitors and crawlers move through your site and pass ranking strength.',
      fix: 'Link to your key pages from the homepage navigation and content.',
    }),
  ];
};
