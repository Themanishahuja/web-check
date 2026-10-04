import type { Severity } from '@whc/shared';
import { cn } from '@/lib/cn';
import { severityFill, severityLabel } from '@/lib/health-styles';

const ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

/** Flat stacked bar showing how failing issues split across severities. */
export function SeverityBar({
  counts,
  className,
}: {
  counts: Record<Severity, number>;
  className?: string;
}) {
  const present = ORDER.filter((severity) => counts[severity] > 0);
  const total = present.reduce((sum, severity) => sum + counts[severity], 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className="flex h-1.5 gap-px bg-line"
        role="img"
        aria-label={`${total} issues to fix`}
      >
        {present.map((severity) => (
          <span
            key={severity}
            className={cn('h-full', severityFill[severity])}
            style={{ width: `${(counts[severity] / total) * 100}%` }}
          />
        ))}
        {total === 0 ? (
          <span className={cn('h-full w-full', severityFill.passed)} />
        ) : null}
      </div>
      {total > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-wider text-ink-soft">
          {present.map((severity) => (
            <li key={severity} className="inline-flex items-center gap-1.5">
              <span className={cn('size-1.5', severityFill[severity])} />
              {counts[severity]} {severityLabel[severity]}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
