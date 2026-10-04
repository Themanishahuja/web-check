import {
  SEVERITIES,
  type HealthState,
  type Issue,
  type ScanReport,
  type Severity,
  type WebVitals,
} from '@whc/shared';

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs attention';
  return 'Poor';
}

const FAILING: Severity[] = ['critical', 'high', 'medium', 'low'];

export function failingIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.severity !== 'passed');
}

export function passedIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.severity === 'passed');
}

/** The most important findings across all modules, most severe first. */
export function priorityFixes(report: ScanReport, limit = 6, perModule = 2): Issue[] {
  const rank = (severity: Severity) => SEVERITIES.indexOf(severity);
  const perModuleCount = new Map<string, number>();
  return report.modules
    .flatMap((mod) => mod.issues)
    .filter((issue) => FAILING.includes(issue.severity))
    .sort((a, b) => rank(a.severity) - rank(b.severity))
    .filter((issue) => {
      // Keep one noisy area from crowding out everything else.
      const seen = perModuleCount.get(issue.module) ?? 0;
      perModuleCount.set(issue.module, seen + 1);
      return seen < perModule;
    })
    .slice(0, limit);
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function countBySeverity(issues: Issue[]): Record<Severity, number> {
  const counts = Object.fromEntries(
    SEVERITIES.map((severity) => [severity, 0]),
  ) as Record<Severity, number>;
  for (const issue of issues) counts[issue.severity] += 1;
  return counts;
}

export function gradeState(grade: string): 'good' | 'warn' | 'bad' {
  if (grade === 'A+' || grade === 'A') return 'good';
  if (grade === 'B' || grade === 'C') return 'warn';
  return 'bad';
}

/** Google's Core Web Vitals bands: up to `good` is good, up to `warn` needs work, above is poor. */
export const VITAL_THRESHOLDS = {
  lcp: { good: 2500, warn: 4000 },
  cls: { good: 0.1, warn: 0.25 },
  inp: { good: 200, warn: 500 },
  tbt: { good: 200, warn: 600 },
  fcp: { good: 1800, warn: 3000 },
} as const;

export function vitalState(
  value: number,
  band: { good: number; warn: number },
): HealthState {
  if (value <= band.good) return 'good';
  if (value <= band.warn) return 'warn';
  return 'bad';
}

/** State of each headline vital that was actually measured. */
export function vitalStates(vitals: WebVitals): HealthState[] {
  const states: HealthState[] = [];
  if (vitals.lcpMs !== null) states.push(vitalState(vitals.lcpMs, VITAL_THRESHOLDS.lcp));
  if (vitals.cls !== null) states.push(vitalState(vitals.cls, VITAL_THRESHOLDS.cls));
  if (vitals.inpMs !== null) states.push(vitalState(vitals.inpMs, VITAL_THRESHOLDS.inp));
  else if (vitals.tbtMs !== null)
    states.push(vitalState(vitals.tbtMs, VITAL_THRESHOLDS.tbt));
  if (vitals.fcpMs !== null) states.push(vitalState(vitals.fcpMs, VITAL_THRESHOLDS.fcp));
  return states;
}
