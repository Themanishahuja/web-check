export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'passed'] as const;

export type Severity = (typeof SEVERITIES)[number];

/** Score points deducted per failed check of the given severity. */
export const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  passed: 0,
};

/** UI-facing health state, derived from a score or severity. */
export type HealthState = 'good' | 'warn' | 'bad';

export function scoreToHealthState(score: number): HealthState {
  if (score >= 80) return 'good';
  if (score >= 50) return 'warn';
  return 'bad';
}
