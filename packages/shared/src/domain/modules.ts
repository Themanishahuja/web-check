/** Every audit category the platform reports on. Single source of truth for web + scanner. */
export const MODULE_IDS = [
  'performance',
  'seo',
  'security',
  'accessibility',
  'mobile',
  'links',
  'content',
  'technology',
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  /** Contributes to the overall health score. Technology detection is informational only. */
  scored: boolean;
  /** Relative weight in the overall score (only meaningful when `scored`). */
  weight: number;
}

export const MODULES: Record<ModuleId, ModuleMeta> = {
  performance: { id: 'performance', label: 'Performance', scored: true, weight: 20 },
  seo: { id: 'seo', label: 'SEO', scored: true, weight: 20 },
  security: { id: 'security', label: 'Security', scored: true, weight: 20 },
  accessibility: {
    id: 'accessibility',
    label: 'Accessibility',
    scored: true,
    weight: 10,
  },
  mobile: { id: 'mobile', label: 'Mobile UX', scored: true, weight: 10 },
  links: { id: 'links', label: 'Links', scored: true, weight: 10 },
  content: { id: 'content', label: 'Content', scored: true, weight: 10 },
  technology: { id: 'technology', label: 'Technology', scored: false, weight: 0 },
};
