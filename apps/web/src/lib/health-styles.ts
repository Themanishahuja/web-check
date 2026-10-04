import type { HealthState, Severity } from '@whc/shared';

/**
 * Class lookups for health states. Tailwind needs full literal class names,
 * so every variant is spelled out here rather than built dynamically.
 */
export const healthText: Record<HealthState, string> = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
};

/** Saturated palette colours for rings and strokes (not for small text). */
export const healthFillText: Record<HealthState, string> = {
  good: 'text-good-fill',
  warn: 'text-warn-fill',
  bad: 'text-bad-fill',
};

export const healthBar: Record<HealthState, string> = {
  good: 'bg-good-fill',
  warn: 'bg-warn-fill',
  bad: 'bg-bad-fill',
};

export const healthSoft: Record<HealthState, string> = {
  good: 'border-good/20 bg-good-soft text-good',
  warn: 'border-warn/25 bg-warn-soft text-warn',
  bad: 'border-bad/20 bg-bad-soft text-bad',
};

export type SeverityTone = HealthState | 'neutral';

export const severityTone: Record<Severity, SeverityTone> = {
  critical: 'bad',
  high: 'bad',
  medium: 'warn',
  low: 'neutral',
  passed: 'good',
};

export const severityLabel: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  passed: 'Passed',
};

/** Solid fills for severity bars and legend dots. */
export const severityFill: Record<Severity, string> = {
  critical: 'bg-bad-fill',
  high: 'bg-bad-fill/70',
  medium: 'bg-warn-fill',
  low: 'bg-ink-faint/40',
  passed: 'bg-good-fill',
};
