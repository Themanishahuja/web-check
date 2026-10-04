import { MODULES, type ModuleId, type ScanReport } from '@whc/shared';
import { priorityFixes } from '../lib/report-utils';
import { AreaScores } from './area-scores';
import { IssueItem } from './issue-item';
import { SummaryLedger } from './summary-ledger';

interface OverviewPanelProps {
  report: ScanReport;
  onSelect: (module: ModuleId) => void;
}

const SECTION_TITLE = 'text-2xl font-semibold tracking-tight';

/** The at-a-glance view: headline figures, per-area scores, and what to fix first. */
export function OverviewPanel({ report, onSelect }: OverviewPanelProps) {
  const fixes = priorityFixes(report, 6);

  return (
    <div className="space-y-14">
      <SummaryLedger report={report} />

      <section aria-labelledby="areas-heading" className="space-y-5">
        <h2 id="areas-heading" className={SECTION_TITLE}>
          Scores by area
        </h2>
        <AreaScores
          modules={report.modules}
          technologyCount={report.technologies.length}
          onSelect={onSelect}
        />
      </section>

      <section aria-labelledby="priority-heading" className="space-y-5">
        <div>
          <h2 id="priority-heading" className={SECTION_TITLE}>
            Fix these first
          </h2>
          <p className="mt-1 text-ink-soft">
            The most important findings across your whole site, most severe first.
          </p>
        </div>
        {fixes.length > 0 ? (
          <div className="divide-y divide-line border-y border-ink">
            {fixes.map((issue) => (
              <IssueItem
                key={issue.id}
                issue={issue}
                moduleLabel={MODULES[issue.module].label}
                maxAffected={3}
                aside={
                  <button
                    type="button"
                    onClick={() => onSelect(issue.module)}
                    className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
                  >
                    Open area →
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <p className="border-y border-line py-5 text-lg">
            Nothing urgent — this site passed every check we ran.
          </p>
        )}
      </section>

      {report.notes.length > 0 ? (
        <section
          aria-labelledby="notes-heading"
          className="space-y-3 border-t border-line pt-8"
        >
          <h2
            id="notes-heading"
            className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint"
          >
            What this scan didn’t cover
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
            {report.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="text-sm text-ink-faint">
            This is a website health assessment, not a penetration test.
          </p>
        </section>
      ) : null}
    </div>
  );
}
