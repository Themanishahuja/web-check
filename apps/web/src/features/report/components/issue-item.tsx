import type { Issue } from '@whc/shared';
import { cn } from '@/lib/cn';
import { SeverityBadge } from './severity-badge';

interface IssueItemProps {
  issue: Issue;
  /** Hide the why/fix text (used for passed checks in compact lists). */
  compact?: boolean;
  /** Area name shown under the severity (where issues from several areas are mixed). */
  moduleLabel?: string;
  /** Maximum number of affected locations to list. */
  maxAffected?: number;
  /** Extra content under the severity label (for example an "Open" link). */
  aside?: React.ReactNode;
  className?: string;
}

const LABEL = 'font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint';

/** One finding, always answering: what's wrong → why it matters → how to fix it. */
export function IssueItem({
  issue,
  compact,
  moduleLabel,
  maxAffected = 6,
  aside,
  className,
}: IssueItemProps) {
  const showDetails = !compact && issue.severity !== 'passed';
  const affected = issue.affected ?? [];

  return (
    <article
      className={cn(
        'grid gap-x-8 gap-y-3 py-6 sm:grid-cols-[8rem_minmax(0,1fr)] print:break-inside-avoid',
        className,
      )}
    >
      <div className="space-y-1.5">
        <SeverityBadge severity={issue.severity} />
        {moduleLabel ? <p className={LABEL}>{moduleLabel}</p> : null}
        {aside}
      </div>

      <div className="min-w-0 space-y-4">
        <h4 className="text-lg leading-snug font-semibold tracking-tight">
          {issue.title}
        </h4>

        {showDetails ? (
          <dl className="grid gap-4 md:grid-cols-2 md:gap-10">
            <div className="space-y-1">
              <dt className={LABEL}>Why it matters</dt>
              <dd className="text-ink-soft [overflow-wrap:anywhere]">{issue.why}</dd>
            </div>
            <div className="space-y-1">
              <dt className={LABEL}>How to fix</dt>
              <dd className="text-ink-soft [overflow-wrap:anywhere]">{issue.fix}</dd>
            </div>
          </dl>
        ) : null}

        {showDetails && affected.length > 0 ? (
          <div className="space-y-1">
            <p className={LABEL}>Found at</p>
            <ul className="space-y-0.5 font-mono text-xs leading-relaxed text-ink-soft">
              {affected.slice(0, maxAffected).map((target, index) => (
                <li key={`${index}-${target}`} className="break-all">
                  {target}
                </li>
              ))}
              {affected.length > maxAffected ? (
                <li className="text-ink-faint">+ {affected.length - maxAffected} more</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
