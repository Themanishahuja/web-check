import type { Issue } from '@whc/shared';
import { failingIssues, passedIssues } from '../lib/report-utils';
import { IssueItem } from './issue-item';

/** Failing issues first (most severe on top); passed checks follow as a plain list. */
export function IssueList({
  issues,
  expandPassed,
}: {
  issues: Issue[];
  expandPassed?: boolean;
}) {
  const failing = failingIssues(issues);
  const passed = passedIssues(issues);

  return (
    <div className="space-y-8">
      {failing.length === 0 ? (
        <p className="border-y border-line py-5 text-ink-soft">
          Nothing to fix in this area — every check passed.
        </p>
      ) : (
        <div className="divide-y divide-line border-y border-ink">
          {failing.map((issue) => (
            <IssueItem key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {passed.length > 0 ? (
        <details className="group" open={expandPassed}>
          <summary className="cursor-pointer list-none font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="underline decoration-line underline-offset-4">
              {passed.length} passed check{passed.length === 1 ? '' : 's'}
            </span>
          </summary>
          <ul className="mt-4 columns-1 gap-10 text-sm text-ink-soft sm:columns-2">
            {passed.map((issue) => (
              <li key={issue.id} className="mb-1.5 break-inside-avoid">
                <span className="mr-2 text-good" aria-hidden="true">
                  ✓
                </span>
                {issue.title}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
