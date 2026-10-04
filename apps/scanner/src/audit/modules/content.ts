import { pageLabel } from '../context.js';
import { issueFactory, type AuditModule } from '../issue.js';

const { check, forEach } = issueFactory('content');

function visibleText(page: Parameters<typeof pageLabel>[0]): string {
  const clone = page.$('body').clone();
  clone.find('script, style, noscript, template, svg').remove();
  return clone.text().replace(/\s+/g, ' ').trim();
}

const wordCount = (text: string) => (text ? text.split(' ').length : 0);

export const auditContent: AuditModule = ({ pages, home }) => {
  const stats = pages.map((page) => {
    const text = visibleText(page);
    return {
      page,
      label: pageLabel(page),
      text,
      words: wordCount(text),
      ratio: page.htmlBytes > 0 ? (Buffer.byteLength(text) / page.htmlBytes) * 100 : 0,
    };
  });

  const empty = stats
    .filter((s) => s.words < 50)
    .map((s) => `${s.label} (${s.words} words)`);
  const thin = stats
    .filter((s) => s.words >= 50 && s.words < 250)
    .map((s) => `${s.label} (${s.words} words)`);

  const duplicatesOf = (pick: (s: (typeof stats)[number]) => string) => {
    const groups = new Map<string, string[]>();
    for (const s of stats) {
      const key = pick(s).trim().toLowerCase();
      if (!key) continue;
      groups.set(key, [...(groups.get(key) ?? []), s.label]);
    }
    return [...groups.entries()]
      .filter(([, labels]) => labels.length > 1)
      .flatMap(([, labels]) => labels);
  };

  const duplicateTitles = duplicatesOf((s) => s.page.$('head title').first().text());
  const duplicateDescriptions = duplicatesOf(
    (s) => s.page.$('meta[name="description"]').attr('content') ?? '',
  );

  const noHeadings = stats
    .filter((s) => s.words > 150 && s.page.$('h1, h2, h3').length === 0)
    .map((s) => s.label);
  const longWithoutSubheadings = stats
    .filter((s) => s.words > 600 && s.page.$('h2, h3').length === 0)
    .map((s) => s.label);

  const lowRatio = stats
    .filter((s) => s.words >= 50 && s.ratio < 5)
    .map((s) => `${s.label} (${s.ratio.toFixed(1)}%)`);
  const lorem = stats
    .filter((s) => /lorem ipsum|dolor sit amet/i.test(s.text))
    .map((s) => s.label);

  const homeText = stats[0]?.text ?? '';
  const hasContact =
    home.$('a[href^="mailto:"], a[href^="tel:"], a[href*="contact" i], form').length >
      0 || /\b[\w.+-]+@[\w-]+\.[\w.]+\b/.test(homeText);
  const hasPrivacy =
    home.$('a[href*="privacy" i], a[href*="terms" i], a[href*="legal" i]').length > 0;

  return [
    forEach(empty, {
      id: 'empty-pages',
      severity: 'high',
      fail: 'Pages with almost no text',
      pass: 'No empty pages found',
      why: 'Visitors and search engines find nothing useful on these pages.',
      fix: 'Add meaningful content, or remove / redirect the page.',
    }),
    forEach(thin, {
      id: 'thin-content',
      severity: 'medium',
      fail: 'Pages with thin content',
      pass: 'Pages have a healthy amount of content',
      why: 'Thin pages give visitors and search engines little to work with.',
      fix: 'Expand the page with useful, original content, or merge it into a stronger page.',
    }),
    forEach(duplicateTitles, {
      id: 'duplicate-titles',
      severity: 'medium',
      fail: 'Multiple pages share the same title',
      pass: 'Every scanned page has a unique title',
      why: 'Duplicate titles make pages hard to tell apart in search results.',
      fix: 'Give each page its own descriptive title.',
    }),
    forEach(duplicateDescriptions, {
      id: 'duplicate-descriptions',
      severity: 'low',
      fail: 'Multiple pages share the same meta description',
      pass: 'Meta descriptions are unique',
      why: 'Identical descriptions give no reason to click one result over another.',
      fix: 'Write a unique description for each page.',
    }),
    forEach(noHeadings, {
      id: 'no-headings',
      severity: 'medium',
      fail: 'Text pages with no headings',
      pass: 'Text pages use headings',
      why: 'Headings make content scannable for readers and understandable for search engines.',
      fix: 'Break the text into sections with descriptive headings.',
    }),
    forEach(longWithoutSubheadings, {
      id: 'long-no-subheadings',
      severity: 'low',
      fail: 'Long pages without sub-headings',
      pass: 'Long pages are broken up with sub-headings',
      why: 'Walls of text are hard to scan.',
      fix: 'Add H2/H3 sub-headings every few paragraphs.',
    }),
    forEach(lowRatio, {
      id: 'text-ratio',
      severity: 'low',
      fail: 'Very low text-to-code ratio',
      pass: 'Text-to-code ratio is healthy',
      why: 'When code outweighs content, pages load slower and signal little value.',
      fix: 'Reduce inline scripts/styles and unnecessary markup.',
    }),
    forEach(lorem, {
      id: 'placeholder-text',
      severity: 'high',
      fail: 'Placeholder text ("lorem ipsum") found',
      pass: 'No placeholder text found',
      why: 'Placeholder text signals an unfinished site and hurts trust.',
      fix: 'Replace it with real content.',
    }),
    check(hasContact, {
      id: 'contact',
      severity: 'low',
      fail: 'No contact information found on the homepage',
      pass: 'Contact information is available',
      why: 'Visitors look for a way to reach you before they trust a site.',
      fix: 'Add a contact link, email, phone number or form to the homepage.',
    }),
    check(hasPrivacy, {
      id: 'privacy',
      severity: 'low',
      fail: 'No privacy policy or terms link found',
      pass: 'A privacy / legal link is present',
      why: 'Privacy policies are expected by visitors and required by many regulations.',
      fix: 'Link to your privacy policy and terms from the footer.',
    }),
  ];
};
