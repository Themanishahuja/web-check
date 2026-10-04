/** Generic tool categories people juggle today — deliberately not brand names. */
export interface FragmentedTool {
  tool: string;
  checks: string;
}

export const fragmentedTools: FragmentedTool[] = [
  { tool: 'Speed tester', checks: 'Performance' },
  { tool: 'SEO analyzer', checks: 'SEO' },
  { tool: 'Header scanner', checks: 'Security' },
  { tool: 'Accessibility checker', checks: 'Accessibility' },
  { tool: 'Mobile tester', checks: 'Mobile UX' },
  { tool: 'Link checker', checks: 'Broken links' },
  { tool: 'Tech detector', checks: 'Technology' },
];
