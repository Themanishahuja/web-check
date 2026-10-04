import type { HealthState, WebVitals } from '@whc/shared';
import { Figure, Ledger, LedgerCell } from '@/components/ui/ledger';
import { cn } from '@/lib/cn';
import { healthText } from '@/lib/health-styles';
import { VITAL_THRESHOLDS, vitalState } from '../lib/report-utils';
import { Tag } from './tag';

interface Metric {
  label: string;
  hint: string;
  value: number | null;
  format: (value: number) => { text: string; unit?: string };
  good: number;
  warn: number;
}

const seconds = (ms: number) => ({ text: (ms / 1000).toFixed(1), unit: 's' });
const millis = (ms: number) => ({ text: String(Math.round(ms)), unit: 'ms' });

const VERDICT: Record<HealthState, string> = {
  good: 'Good',
  warn: 'Needs work',
  bad: 'Poor',
};

const SOURCE_NOTE: Record<WebVitals['source'], string> = {
  pagespeed:
    'Measured by Google PageSpeed Insights on a simulated mid-range phone. INP is real-user data when Google has enough visits to report it.',
  browser:
    'Measured in our own browser without network throttling. Visitors on slower connections will usually see higher numbers.',
};

/** Core Web Vitals as four plain-language figures. */
export function VitalsPanel({ vitals }: { vitals: WebVitals }) {
  const metrics: Metric[] = [
    {
      label: 'Loading',
      hint: 'Largest Contentful Paint',
      value: vitals.lcpMs,
      format: seconds,
      ...VITAL_THRESHOLDS.lcp,
    },
    {
      label: 'Visual stability',
      hint: 'Cumulative Layout Shift',
      value: vitals.cls,
      format: (v) => ({ text: v.toFixed(2) }),
      ...VITAL_THRESHOLDS.cls,
    },
    vitals.inpMs !== null
      ? {
          label: 'Responsiveness',
          hint: 'Interaction to Next Paint',
          value: vitals.inpMs,
          format: millis,
          ...VITAL_THRESHOLDS.inp,
        }
      : {
          label: 'Responsiveness',
          hint: 'Total Blocking Time',
          value: vitals.tbtMs,
          format: millis,
          ...VITAL_THRESHOLDS.tbt,
        },
    {
      label: 'First paint',
      hint: 'First Contentful Paint',
      value: vitals.fcpMs,
      format: seconds,
      ...VITAL_THRESHOLDS.fcp,
    },
  ];

  return (
    <section aria-labelledby="vitals-heading" className="space-y-4">
      <div>
        <h3 id="vitals-heading" className="text-2xl font-semibold tracking-tight">
          Core Web Vitals
        </h3>
        <p className="mt-1 text-ink-soft">
          How fast and stable your homepage feels to a visitor.
        </p>
      </div>

      <Ledger className="sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const state =
            metric.value === null
              ? null
              : vitalState(metric.value, { good: metric.good, warn: metric.warn });
          const shown = metric.value === null ? null : metric.format(metric.value);
          return (
            <LedgerCell key={metric.hint} label={metric.label} note={metric.hint}>
              <Figure
                unit={shown?.unit}
                className={cn('text-4xl', state ? healthText[state] : 'text-ink-faint')}
              >
                {shown?.text ?? '—'}
              </Figure>
              {state ? (
                <div className="mt-3">
                  <Tag tone={state}>{VERDICT[state]}</Tag>
                </div>
              ) : null}
            </LedgerCell>
          );
        })}
      </Ledger>
      <p className="text-xs text-ink-faint">{SOURCE_NOTE[vitals.source]}</p>
    </section>
  );
}
