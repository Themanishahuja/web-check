export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Primary navigation in the header. */
export const mainNav: NavItem[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Checks', href: '/checks' },
  { label: 'Methodology', href: '/methodology' },
];

/** Footer link groups. */
export const footerGroups: NavGroup[] = [
  {
    title: 'Product',
    items: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'What we check', href: '/checks' },
      { label: 'Methodology', href: '/methodology' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'About our scanner', href: '/bot' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
];

/** Every public page, used for the sitemap. `priority` follows importance for search. */
export const publicPages: Array<{ path: string; priority: number }> = [
  { path: '/', priority: 1 },
  { path: '/checks', priority: 0.9 },
  { path: '/how-it-works', priority: 0.8 },
  { path: '/methodology', priority: 0.8 },
  { path: '/about', priority: 0.5 },
  { path: '/contact', priority: 0.4 },
  { path: '/bot', priority: 0.4 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
  { path: '/disclaimer', priority: 0.3 },
  { path: '/cookies', priority: 0.2 },
];
