import { MODULES } from '../domain/modules';
import type { Issue, ModuleResult, ScanReport } from '../domain/report';
import { SEVERITIES, SEVERITY_PENALTY, type Severity } from '../domain/severity';

/** Each additional failed check of the same severity counts this much of the previous one. */
export const REPEAT_DECAY = 0.8;

/**
 * Deterministic module score: 100 minus a penalty per failed check, with
 * diminishing returns within a severity tier. The n-th failure of a tier costs
 * `base × 0.8^(n-1)`, so one badly neglected area degrades the score steeply
 * but a single tier can never cost more than 5× its base penalty.
 */
export function calculateModuleScore(issues: Issue[]): number {
  const failuresBySeverity = new Map<Severity, number>();
  for (const issue of issues) {
    if (issue.severity === 'passed') continue;
    failuresBySeverity.set(
      issue.severity,
      (failuresBySeverity.get(issue.severity) ?? 0) + 1,
    );
  }

  let penalty = 0;
  for (const [severity, count] of failuresBySeverity) {
    penalty +=
      SEVERITY_PENALTY[severity] * ((1 - REPEAT_DECAY ** count) / (1 - REPEAT_DECAY));
  }
  return Math.max(0, Math.round(100 - penalty));
}

/** Weighted average of all scored modules that produced a score. */
export function calculateOverallScore(results: ModuleResult[]): number {
  let weighted = 0;
  let totalWeight = 0;
  for (const result of results) {
    const meta = MODULES[result.module];
    if (!meta.scored || result.score === null) continue;
    weighted += result.score * meta.weight;
    totalWeight += meta.weight;
  }
  return totalWeight === 0 ? 0 : Math.round(weighted / totalWeight);
}

export interface ReportSummary {
  pagesScanned: number;
  totalChecks: number;
  passed: number;
  counts: Record<Severity, number>;
}

export function summarizeReport(report: ScanReport): ReportSummary {
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<
    Severity,
    number
  >;
  for (const mod of report.modules) {
    for (const issue of mod.issues) counts[issue.severity] += 1;
  }
  const totalChecks = SEVERITIES.reduce((sum, s) => sum + counts[s], 0);
  return {
    pagesScanned: report.scannedPages.length,
    totalChecks,
    passed: counts.passed,
    counts,
  };
}
