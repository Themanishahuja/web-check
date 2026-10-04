import type { Cheerio, CheerioAPI } from 'cheerio';
import type { AnyNode } from 'domhandler';
import type { Issue } from '@whc/shared';
import type { AxeFinding, AxeImpact } from '../../browser/inspect.js';
import { pageLabel } from '../context.js';
import { issueFactory, type AuditModule } from '../issue.js';

const { check, forEach } = issueFactory('accessibility');

const VALID_ROLES = new Set([
  'alert',
  'alertdialog',
  'application',
  'article',
  'banner',
  'button',
  'cell',
  'checkbox',
  'columnheader',
  'combobox',
  'complementary',
  'contentinfo',
  'definition',
  'dialog',
  'directory',
  'document',
  'feed',
  'figure',
  'form',
  'grid',
  'gridcell',
  'group',
  'heading',
  'img',
  'link',
  'list',
  'listbox',
  'listitem',
  'log',
  'main',
  'marquee',
  'math',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'navigation',
  'none',
  'note',
  'option',
  'presentation',
  'progressbar',
  'radio',
  'radiogroup',
  'region',
  'row',
  'rowgroup',
  'rowheader',
  'scrollbar',
  'search',
  'searchbox',
  'separator',
  'slider',
  'spinbutton',
  'status',
  'switch',
  'tab',
  'table',
  'tablist',
  'tabpanel',
  'term',
  'textbox',
  'timer',
  'toolbar',
  'tooltip',
  'tree',
  'treegrid',
  'treeitem',
  'generic',
  'doc-abstract',
  'doc-toc',
  'doc-endnotes',
]);

const NON_LABELLED_INPUTS = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

function hasAccessibleText($: CheerioAPI, node: Cheerio<AnyNode>): boolean {
  if (node.text().trim()) return true;
  if (
    node.attr('aria-label')?.trim() ||
    node.attr('title')?.trim() ||
    node.attr('aria-labelledby')
  )
    return true;
  if (node.find('img[alt]:not([alt=""])').length > 0) return true;
  if (node.find('svg title, [aria-label]').length > 0) return true;
  return $(node).attr('value') !== undefined && $(node).attr('type') !== undefined;
}

export const auditAccessibility: AuditModule = ({ pages, home, browser }) => {
  const perPage = (find: (page: (typeof pages)[number]) => number) =>
    pages
      .map((page) => ({ label: pageLabel(page), count: find(page) }))
      .filter((entry) => entry.count > 0)
      .map((entry) => `${entry.label} (${entry.count})`);

  const missingLang = pages
    .filter((p) => !p.$('html').attr('lang')?.trim())
    .map(pageLabel);
  const missingTitle = pages
    .filter((p) => !p.$('head title').first().text().trim())
    .map(pageLabel);

  const missingAlt = perPage((p) => p.$('img:not([alt])').length);

  const unlabelledFields = perPage((p) => {
    const { $ } = p;
    return $('input, select, textarea').filter((_, el) => {
      const node = $(el);
      const type = (node.attr('type') ?? 'text').toLowerCase();
      if (NON_LABELLED_INPUTS.has(type)) return false;
      if (
        node.attr('aria-label')?.trim() ||
        node.attr('aria-labelledby') ||
        node.attr('title')?.trim()
      )
        return false;
      const id = node.attr('id');
      if (id && $(`label[for="${id.replace(/"/g, '\\"')}"]`).length > 0) return false;
      return node.closest('label').length === 0;
    }).length;
  });

  const unnamedButtons = perPage((p) => {
    const { $ } = p;
    return $('button, [role="button"]').filter((_, el) => !hasAccessibleText($, $(el)))
      .length;
  });
  const unnamedLinks = perPage((p) => {
    const { $ } = p;
    return $('a[href]').filter((_, el) => !hasAccessibleText($, $(el))).length;
  });

  const headingSkips = pages
    .filter((p) => {
      const levels = p
        .$('h1, h2, h3, h4, h5, h6')
        .map((_, el) => Number(el.tagName.slice(1)))
        .get();
      return levels.some((level, i) => i > 0 && level - (levels[i - 1] ?? level) > 1);
    })
    .map(pageLabel);

  const missingMain = pages
    .filter((p) => p.$('main, [role="main"]').length === 0)
    .map(pageLabel);
  const positiveTabindex = perPage(
    (p) =>
      p.$('[tabindex]').filter((_, el) => Number(p.$(el).attr('tabindex')) > 0).length,
  );
  const untitledFrames = perPage(
    (p) => p.$('iframe:not([title]):not([aria-label])').length,
  );
  const hiddenFocusable = perPage(
    (p) =>
      p
        .$(
          'a[href][aria-hidden="true"], button[aria-hidden="true"], input[aria-hidden="true"]',
        )
        .filter((_, el) => p.$(el).attr('tabindex') !== '-1').length,
  );
  const invalidRoles = perPage(
    (p) =>
      p.$('[role]').filter((_, el) => {
        const role = (p.$(el).attr('role') ?? '').trim().split(/\s+/)[0] ?? '';
        return role !== '' && !VALID_ROLES.has(role.toLowerCase());
      }).length,
  );
  const brokenAriaRefs = perPage(
    (p) =>
      p.$('[aria-labelledby], [aria-describedby], [aria-controls]').filter((_, el) => {
        const node = p.$(el);
        const refs = [
          node.attr('aria-labelledby'),
          node.attr('aria-describedby'),
          node.attr('aria-controls'),
        ]
          .filter(Boolean)
          .flatMap((value) => (value ?? '').split(/\s+/));
        return refs.some(
          (id) => id && p.$(`[id="${id.replace(/"/g, '\\"')}"]`).length === 0,
        );
      }).length,
  );
  const duplicateIds = perPage((p) => {
    const counts = new Map<string, number>();
    p.$('[id]').each((_, el) => {
      const id = p.$(el).attr('id') ?? '';
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return [...counts.values()].filter((count) => count > 1).length;
  });

  const viewport = home.$('meta[name="viewport"]').attr('content') ?? '';
  const zoomDisabled =
    /user-scalable\s*=\s*(no|0)/i.test(viewport) ||
    /maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport);
  const hasSkipLink =
    home
      .$('a[href^="#"]')
      .slice(0, 5)
      .filter((_, el) =>
        /skip|jump|main|content/i.test(
          home.$(el).text() + (home.$(el).attr('href') ?? ''),
        ),
      ).length > 0;
  const hasNav = home.$('nav, [role="navigation"]').length > 0;
  const focusOutlineRemoved = pages.some((p) =>
    p
      .$('style')
      .toArray()
      .some((el) =>
        /:focus(?!-visible)[^{]*\{[^}]*outline\s*:\s*(none|0)/i.test(p.$(el).text()),
      ),
  );

  const staticIssues: Issue[] = [
    forEach(missingLang, {
      id: 'lang',
      severity: 'high',
      fail: 'The page language is not declared',
      pass: 'The page language is declared',
      why: 'Screen readers use the lang attribute to choose the right pronunciation.',
      fix: 'Add lang="en" (or the correct language code) to the <html> element.',
    }),
    forEach(missingTitle, {
      id: 'page-title',
      severity: 'high',
      fail: 'Pages have no title',
      pass: 'Every page has a title',
      why: 'The title is the first thing a screen reader announces and how people tell tabs apart.',
      fix: 'Give each page a unique, descriptive <title>.',
    }),
    forEach(missingAlt, {
      id: 'image-alt',
      severity: 'high',
      fail: 'Images are missing an alt attribute',
      pass: 'All images have an alt attribute',
      why: 'People using screen readers get no description of these images.',
      fix: 'Add a short, meaningful alt attribute (use alt="" for purely decorative images).',
    }),
    forEach(unlabelledFields, {
      id: 'form-labels',
      severity: 'high',
      fail: 'Form fields have no label',
      pass: 'All form fields are labelled',
      why: 'Without a label, screen reader users cannot tell what a field is for, and tapping the label cannot focus it.',
      fix: 'Add a <label for="…"> for each field, or an aria-label when a visible label is not possible.',
    }),
    forEach(unnamedButtons, {
      id: 'button-names',
      severity: 'high',
      fail: 'Buttons have no accessible name',
      pass: 'All buttons have an accessible name',
      why: 'An icon-only button with no text is announced simply as "button".',
      fix: 'Add visible text or an aria-label that describes what the button does.',
    }),
    forEach(unnamedLinks, {
      id: 'link-names',
      severity: 'high',
      fail: 'Links have no accessible text',
      pass: 'All links have accessible text',
      why: 'Empty links are announced as just "link", giving no clue where they lead.',
      fix: 'Add link text, an aria-label, or alt text on the image inside the link.',
    }),
    check(!zoomDisabled, {
      id: 'zoom',
      severity: 'high',
      fail: 'Pinch-to-zoom is disabled',
      pass: 'Pinch-to-zoom is allowed',
      why: 'People with low vision rely on zooming to read content.',
      fix: 'Remove user-scalable=no and maximum-scale=1 from the viewport meta tag.',
    }),
    forEach(headingSkips, {
      id: 'heading-order',
      severity: 'medium',
      fail: 'Heading levels skip (for example H2 → H4)',
      pass: 'Heading levels follow a logical order',
      why: 'Screen reader users navigate by headings; gaps make the outline confusing.',
      fix: 'Use heading levels in order and style them with CSS rather than skipping levels.',
    }),
    forEach(missingMain, {
      id: 'landmark-main',
      severity: 'medium',
      fail: 'Pages have no <main> landmark',
      pass: 'Pages use a <main> landmark',
      why: 'Landmarks let assistive technology jump straight to the main content.',
      fix: 'Wrap the primary content of each page in a <main> element.',
    }),
    check(hasNav, {
      id: 'landmark-nav',
      severity: 'low',
      fail: 'No <nav> landmark on the homepage',
      pass: 'The homepage uses a <nav> landmark',
      why: 'Marking navigation as a landmark makes it quick to find and skip.',
      fix: 'Wrap your main menu in a <nav> element.',
    }),
    check(hasSkipLink, {
      id: 'skip-link',
      severity: 'low',
      fail: 'No "skip to content" link',
      pass: 'A skip-to-content link is present',
      why: 'Keyboard users otherwise tab through the whole menu on every page.',
      fix: 'Add a visually hidden "Skip to main content" link as the first focusable element.',
    }),
    forEach(positiveTabindex, {
      id: 'tabindex',
      severity: 'medium',
      fail: 'Positive tabindex values are used',
      pass: 'No positive tabindex values',
      why: 'Positive tabindex overrides the natural keyboard order and usually makes it unpredictable.',
      fix: 'Use tabindex="0" or "-1" only, and order elements logically in the HTML.',
    }),
    check(!focusOutlineRemoved, {
      id: 'focus-outline',
      severity: 'medium',
      fail: 'Keyboard focus outlines are removed in CSS',
      pass: 'No focus outlines removed in inline styles',
      why: 'Without a visible focus indicator, keyboard users cannot see where they are.',
      fix: 'Do not set outline:none on :focus without providing another clear focus style.',
    }),
    forEach(untitledFrames, {
      id: 'iframe-title',
      severity: 'medium',
      fail: 'Iframes have no title',
      pass: 'Iframes have titles',
      why: 'Screen readers announce the frame title to explain what embedded content is.',
      fix: 'Add a title attribute describing each iframe.',
    }),
    forEach(hiddenFocusable, {
      id: 'aria-hidden-focusable',
      severity: 'medium',
      fail: 'Focusable elements are hidden from assistive technology',
      pass: 'No focusable elements are aria-hidden',
      why: 'Keyboard users can reach the element, but screen readers will not announce it.',
      fix: 'Remove aria-hidden from interactive elements, or add tabindex="-1" and hide them properly.',
    }),
    forEach(invalidRoles, {
      id: 'aria-roles',
      severity: 'medium',
      fail: 'Invalid ARIA role values are used',
      pass: 'ARIA roles are valid',
      why: 'Invalid roles are ignored, so the element loses the meaning you intended.',
      fix: 'Use only roles defined in the WAI-ARIA specification, or prefer native HTML elements.',
    }),
    forEach(brokenAriaRefs, {
      id: 'aria-references',
      severity: 'medium',
      fail: 'ARIA attributes point to elements that do not exist',
      pass: 'ARIA references resolve correctly',
      why: 'A reference to a missing id gives the element no label or description.',
      fix: 'Make sure aria-labelledby / aria-describedby / aria-controls reference existing ids.',
    }),
    forEach(duplicateIds, {
      id: 'duplicate-ids',
      severity: 'low',
      fail: 'Duplicate id attributes found',
      pass: 'All ids are unique',
      why: 'Duplicate ids break label and ARIA associations.',
      fix: 'Make every id on a page unique.',
    }),
  ];

  const axe = browser?.axe;
  if (!axe) return staticIssues;

  // axe-core inspects the rendered page, so it replaces the HTML-only checks it covers.
  const replacedByAxe = new Set([
    'accessibility-lang',
    'accessibility-page-title',
    'accessibility-image-alt',
    'accessibility-form-labels',
    'accessibility-button-names',
    'accessibility-link-names',
    'accessibility-zoom',
    'accessibility-iframe-title',
    'accessibility-aria-roles',
    'accessibility-aria-references',
    'accessibility-aria-hidden-focusable',
  ]);

  return [
    ...staticIssues.filter((issue) => !replacedByAxe.has(issue.id)),
    ...axe.findings.map(axeIssue),
    {
      id: 'accessibility-axe-passed',
      module: 'accessibility',
      severity: 'passed',
      title: `${axe.passedRules} WCAG rules passed in a real browser (${axe.pagesChecked} page${axe.pagesChecked === 1 ? '' : 's'})`,
      why: '',
      fix: '',
    },
  ];
};

const AXE_SEVERITY: Record<AxeImpact, Issue['severity']> = {
  critical: 'high',
  serious: 'high',
  moderate: 'medium',
  minor: 'low',
};

const AXE_FIXES: Record<string, string> = {
  'color-contrast':
    'Darken the text or lighten the background until contrast is at least 4.5:1 (3:1 for large text).',
  'image-alt':
    'Add a short, meaningful alt attribute (use alt="" for decorative images).',
  label: 'Add a <label for="…"> (or aria-label) to every form field.',
  'link-name': 'Give each link visible text, an aria-label, or alt text on its image.',
  'button-name': 'Give each button visible text or an aria-label that says what it does.',
  'html-has-lang': 'Add lang="en" (or the right language code) to the <html> element.',
  'document-title': 'Give every page a unique, descriptive <title>.',
  'meta-viewport':
    'Remove user-scalable=no and maximum-scale=1 from the viewport meta tag.',
};

function axeIssue(finding: AxeFinding): Issue {
  return {
    id: `accessibility-axe-${finding.id}`,
    module: 'accessibility',
    severity: AXE_SEVERITY[finding.impact],
    title: `${finding.help} (${finding.occurrences} place${finding.occurrences === 1 ? '' : 's'})`,
    why: finding.description,
    fix:
      AXE_FIXES[finding.id] ??
      `Fix the elements listed below, following the guidance: ${finding.helpUrl.split('?')[0]}`,
    affected: finding.targets,
  };
}
