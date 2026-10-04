import type { HealthState, ModuleId } from '@whc/shared';

export type AnatomyTarget = 'title' | 'image' | 'security' | 'form' | 'link';

export interface AnatomyStep {
  module: ModuleId;
  target: AnatomyTarget;
  /** What we look at in this part of the page. */
  looksAt: string;
  state: HealthState;
  /** Mono label shown on the highlighted element. */
  signal: string;
}

export const anatomySteps: AnatomyStep[] = [
  {
    module: 'seo',
    target: 'title',
    looksAt:
      'The page title, description, headings and canonical URL — what search engines read first.',
    state: 'good',
    signal: '<title> found',
  },
  {
    module: 'performance',
    target: 'image',
    looksAt:
      'Image weight, compression, caching and everything that slows the first view.',
    state: 'warn',
    signal: 'Large image · 2.4 MB',
  },
  {
    module: 'security',
    target: 'security',
    looksAt:
      'HTTPS, redirects and the security headers your server sends with every page.',
    state: 'good',
    signal: 'HTTPS + headers checked',
  },
  {
    module: 'accessibility',
    target: 'form',
    looksAt: 'Labels, names, alt text and structure that assistive technology relies on.',
    state: 'warn',
    signal: 'Field has no label',
  },
  {
    module: 'links',
    target: 'link',
    looksAt: 'Every link we find, followed to check that it still leads somewhere.',
    state: 'bad',
    signal: '404 · /old-pricing',
  },
];
