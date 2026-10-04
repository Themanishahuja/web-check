/** Copy for the homepage sections that are mostly static text. */

export const comparisonRows = [
  { typical: 'Open multiple tools', ours: 'One URL' },
  { typical: 'Run multiple tests', ours: 'One scan' },
  { typical: 'Understand different reports', ours: 'One report' },
  { typical: 'Collect results manually', ours: 'Everything together' },
  { typical: 'Different free limits', ours: '100% free' },
] as const;

export const freeIncludes = [
  'Website health score',
  'SEO checks',
  'Performance checks',
  'Security checks',
  'Accessibility checks',
  'Mobile checks',
  'Broken-link checks',
  'Technology detection',
] as const;

export const methodologySteps = [
  {
    id: 'discover',
    title: 'Discover',
    summary: 'We fetch your site and understand its structure.',
    detail:
      'We load your homepage, follow redirects, read robots.txt and your sitemap, and find the most important pages to examine.',
  },
  {
    id: 'inspect',
    title: 'Inspect',
    summary: 'Pages, links, HTML, metadata and headers are collected.',
    detail:
      'Every scanned page is parsed: its HTML, metadata, headings, images, forms, scripts, links and response headers become raw signals.',
  },
  {
    id: 'test',
    title: 'Test',
    summary: 'Each category is evaluated against defined rules.',
    detail:
      'Hundreds of small, deterministic checks run against those signals — the same input always produces the same result.',
  },
  {
    id: 'score',
    title: 'Score',
    summary: 'Findings become a transparent 0–100 score.',
    detail:
      'Each failed check removes a fixed number of points based on its severity. Module scores combine into the overall score using published weights.',
  },
  {
    id: 'explain',
    title: 'Explain',
    summary: 'Issues turn into plain-language recommendations.',
    detail:
      'Every issue says what is wrong, why it matters and how to fix it — written for the person who owns the website, not just developers.',
  },
] as const;

export const pipelineSteps = [
  { label: 'HTML', example: '<title>Acme Coffee</title>' },
  { label: 'Technical signals', example: 'title.length = 13' },
  { label: 'Audit rules', example: 'title ≥ 30 chars?' },
  { label: 'Cross checks', example: 'unique across pages?' },
  { label: 'Scoring', example: '−8 · medium' },
  { label: 'Actionable result', example: 'Lengthen your title' },
] as const;

export const audiences = [
  {
    title: 'Developers',
    description:
      'Quickly spot technical issues before you deploy — headers, metadata, links, markup.',
  },
  {
    title: 'Agencies',
    description:
      'Run a fast health check before presenting a website to a client, and share what you find.',
  },
  {
    title: 'Business owners',
    description:
      'Understand whether your website is actually healthy, with no technical knowledge needed.',
  },
] as const;

export const faqs = [
  {
    question: 'Is it really free?',
    answer:
      'Yes. The core website health check is free. To keep it that way we limit how many pages each scan covers — we don’t hide results behind a paywall.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. Enter a URL and get your report. No login, no email, no credit card.',
  },
  {
    question: 'What does it check?',
    answer:
      'SEO, performance, security configuration, accessibility, mobile readiness, broken links, content quality and the technology your site is built with.',
  },
  {
    question: 'Can I scan any website?',
    answer:
      'Any publicly accessible website, subject to our scan limits and technical restrictions. Private networks and pages behind a login can’t be scanned.',
  },
  {
    question: 'Does it replace professional security testing?',
    answer:
      'No. It is a website health assessment that checks common security configuration — not a penetration test or a full security audit.',
  },
  {
    question: 'Are the scores AI-generated?',
    answer:
      'No. Every score comes from defined rules applied to real signals from your site. The same site produces the same result.',
  },
] as const;
