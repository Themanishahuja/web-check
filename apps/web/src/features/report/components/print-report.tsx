import { MODULES, scoreToHealthState, type ScanReport } from '@whc/shared';
import { Figure } from '@/components/ui/ledger';
import { LogoMark } from '@/components/ui/logo';
import { cn } from '@/lib/cn';
import { healthText } from '@/lib/health-styles';
import { hostnameOf, priorityFixes, scoreLabel } from '../lib/report-utils';
import { AreaScores } from './area-scores';
import { IssueItem } from './issue-item';
import { ModulePanel } from './module-panel';
import { SummaryLedger } from './summary-ledger';

const KICKER = 'font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint';

/**
 * The PDF document: cover, executive summary, one section per area, then the method.
 * Rendered by headless Chromium (A4) through /report/[id]/print.
 */
export function PrintReport({ report }: { report: ScanReport }) {
  const host = hostnameOf(report.url);
  const state = scoreToHealthState(report.overallScore);
  const fixes = priorityFixes(report, 8, 3);
  const audited = report.modules;

  return (
    <article
      data-report-ready="true"
      className="mx-auto w-full max-w-[182mm] text-[15px]"
    >
      {/* ---- Cover ---------------------------------------------------------- */}
      <section className="flex min-h-[250mm] flex-col justify-between break-after-page py-2">
        <header className="flex items-center gap-3">
          <LogoMark className="size-7" />
          <span className="font-semibold tracking-tight">Website Health Checker</span>
        </header>

        <div className="space-y-6">
          <p className={KICKER}>
            Website health report ·{' '}
            {new Date(report.scannedAt).toLocaleDateString(undefined, {
              dateStyle: 'long',
            })}
          </p>
          <h1 className="text-7xl leading-[0.95] font-semibold tracking-tighter break-words">
            {host}
          </h1>
          <p className="font-mono text-sm break-all text-ink-soft">{report.url}</p>
        </div>

        <div className="space-y-10">
          <div className="flex items-end gap-6 border-t border-ink pt-6">
            <Figure
              unit="/ 100"
              className={cn('text-[8.5rem] leading-[0.8]', healthText[state])}
            >
              {report.overallScore}
            </Figure>
            <p className="pb-2 text-2xl font-semibold tracking-tight">
              {scoreLabel(report.overallScore)}
            </p>
          </div>
          <SummaryLedger report={report} omitOverall />
        </div>
      </section>

      {/* ---- Executive summary ------------------------------------------------ */}
      <section className="space-y-10 break-after-page">
        <div className="space-y-5">
          <h2 className="text-3xl font-semibold tracking-tight">Scores by area</h2>
          <AreaScores modules={audited} technologyCount={report.technologies.length} />
        </div>

        {fixes.length > 0 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Fix these first</h2>
              <p className="mt-1 text-ink-soft">
                The most important findings across the whole site, most severe first.
              </p>
            </div>
            <div className="divide-y divide-line border-y border-ink">
              {fixes.map((issue) => (
                <IssueItem
                  key={issue.id}
                  issue={issue}
                  moduleLabel={MODULES[issue.module].label}
                  maxAffected={3}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* ---- One section per area ---------------------------------------------- */}
      {audited.map((result) => (
        <section key={result.module} className="break-before-page pt-2">
          <ModulePanel report={report} result={result} forPrint />
        </section>
      ))}

      {/* ---- Method & coverage ------------------------------------------------- */}
      <section className="space-y-8 break-before-page pt-2">
        <h2 className="text-3xl font-semibold tracking-tight">
          How this report was made
        </h2>

        <dl className="divide-y divide-line border-y border-ink">
          <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-8">
            <dt className={KICKER}>Pages examined</dt>
            <dd className="font-mono text-sm break-all text-ink-soft">
              {report.scannedPages.join(' · ')}
            </dd>
          </div>
          {report.coverage ? (
            <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-8">
              <dt className={KICKER}>Coverage</dt>
              <dd className="text-ink-soft">
                Free scans examine up to {report.coverage.pageLimit} pages
                {report.coverage.sitemapUrls > 0
                  ? ` (the sitemap lists ${report.coverage.sitemapUrls})`
                  : ''}
                ; {report.coverage.linksChecked} of {report.coverage.linksFound} links
                found were checked.
              </dd>
            </div>
          ) : null}
          <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-8">
            <dt className={KICKER}>Scoring</dt>
            <dd className="text-ink-soft">
              Every area starts at 100. Each failed check removes points by severity
              (critical 25, high 15, medium 8, low 3), with diminishing returns for
              repeated failures in the same tier. The overall score is a weighted average
              of the audited areas. Scores come from fixed rules applied to real signals
              from the site — no AI estimates.
            </dd>
          </div>
        </dl>

        {report.notes.length > 0 ? (
          <div className="space-y-2">
            <h3 className={KICKER}>What this scan didn’t cover</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
              {report.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="border-t border-line pt-6 text-sm text-ink-faint">
          This is a website health assessment, not a penetration test or a guarantee of
          security, accessibility compliance or search ranking. Generated by Website
          Health Checker on {new Date(report.scannedAt).toLocaleString()}.
        </p>
      </section>
    </article>
  );
}
