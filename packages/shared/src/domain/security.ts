/** Header rules that feed the security-headers scanner (and the matching issue ids). */
export const SECURITY_HEADER_RULE_IDS = [
  'hsts',
  'csp',
  'frame',
  'nosniff',
  'referrer',
  'permissions',
  'coop',
] as const;

/** Ids of the issues generated from those rules, e.g. "security-hsts". */
export const SECURITY_HEADER_ISSUE_IDS: ReadonlySet<string> = new Set(
  SECURITY_HEADER_RULE_IDS.map((id) => `security-${id}`),
);
