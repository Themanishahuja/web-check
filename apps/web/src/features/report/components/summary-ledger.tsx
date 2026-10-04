import { scoreToHealthState, summarizeReport, type ScanReport } from '@whc/shared';
import { Figure, Ledger, LedgerCell } from '@/components/ui/ledger';
import { cn } from '@/lib/cn';
import { healthBar, healthText } from '@/lib/health-styles';
import { formatDuration, gradeState, scoreLabel, vitalStates } from '../lib/report-utils';
import { SeverityBar } from './severity-bar';

/** Flat horizontal gauge with tick marks at the 50 and 80 thresholds. */
function ScoreGauge({ score }: { score: number }) {
  const state = scoreToHealthState(score);
  return (
    <div className="relative h-1.5 bg-line" role="img" aria-label={`${score} out of 100`}>
      <div className={cn('h-full', healthBar[state])} style={{ width: `${score}%` }} />
      {[50, 80].map((tick) => (
        <span
          key={tick}
          className="absolute top-[-3px] h-[calc(100%+6px)] w-px bg-ink/50"
          style={{ left: `${tick}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** The two rows of headline figures shared by the dashboard overview and the PDF cover. */
export function SummaryLedger({
  report,
  omitOverall,
}: {
  report: ScanReport;
  /** The PDF cover already shows the overall score in large type. */
  omitOverall?: boolean;
}) {
  const summary = summarizeReport(report);
  const toFix =
    summary.counts.critical +
    summary.counts.high +
    summary.counts.medium +
    summary.counts.low;
  const passedShare =
    summary.totalChecks === 0 ? 0 : (summary.passed / summary.totalChecks) * 100;
  const headers = report.securityHeaders;
  const goodHeaders =
    headers?.checks.filter((check) => check.status === 'good').length ?? 0;
  const vitals = report.vitals ? vitalStates(report.vitals) : [];
  const goodVitals = vitals.filter((state) => state === 'good').length;

  return (
    <div className="space-y-px">
      <Ledger
        className={omitOverall ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}
      >
        {omitOverall ? null : (
          <LedgerCell label="Overall health" note={scoreLabel(report.overallScore)}>
            <Figure
              unit="/ 100"
              className={cn(
                'text-6xl',
                healthText[scoreToHealthState(report.overallScore)],
              )}
            >
              {report.overallScore}
            </Figure>
            <div className="mt-4">
              <ScoreGauge score={report.overallScore} />
            </div>
          </LedgerCell>
        )}

        <LedgerCell
          label="Issues to fix"
          note={`${summary.totalChecks} checks run in total`}
        >
          <Figure>{toFix}</Figure>
          <SeverityBar counts={summary.counts} className="mt-4" />
        </LedgerCell>

        <LedgerCell
          label="Checks passed"
          note={`${Math.round(passedShare)}% of all checks`}
        >
          <Figure unit={`/ ${summary.totalChecks}`}>{summary.passed}</Figure>
          <div className="mt-4 h-1.5 bg-line">
            <div
              className={cn('h-full', healthBar.good)}
              style={{ width: `${passedShare}%` }}
            />
          </div>
        </LedgerCell>

        {headers ? (
          <LedgerCell
            label="Security headers"
            note={`${goodHeaders} of ${headers.checks.length} in the right state`}
          >
            <Figure
              className={healthText[gradeState(headers.grade)]}
              unit={`${headers.score} / 100`}
            >
              {headers.grade}
            </Figure>
          </LedgerCell>
        ) : (
          <LedgerCell label="Pages examined" note="homepage plus linked pages">
            <Figure>{summary.pagesScanned}</Figure>
          </LedgerCell>
        )}
      </Ledger>

      <Ledger className="border-t-0 sm:grid-cols-3">
        <LedgerCell
          label="Core Web Vitals"
          note={
            report.vitals
              ? 'Loading · stability · responsiveness'
              : 'Not measured for this scan'
          }
        >
          {report.vitals ? (
            <Figure className="text-4xl" unit={`/ ${vitals.length} good`}>
              {goodVitals}
            </Figure>
          ) : (
            <Figure className="text-4xl text-ink-faint">—</Figure>
          )}
        </LedgerCell>

        <LedgerCell
          label="Pages examined"
          note={
            report.coverage
              ? `Free scans cover up to ${report.coverage.pageLimit} pages${
                  report.coverage.sitemapUrls > summary.pagesScanned
                    ? ` · your sitemap lists ${report.coverage.sitemapUrls}`
                    : ''
                }`
              : undefined
          }
        >
          <Figure className="text-4xl">{summary.pagesScanned}</Figure>
        </LedgerCell>

        <LedgerCell label="Scan time" note={new Date(report.scannedAt).toLocaleString()}>
          <Figure className="text-4xl">{formatDuration(report.durationMs)}</Figure>
        </LedgerCell>
      </Ledger>
    </div>
  );
}
