import {
  MODULES,
  SECURITY_HEADER_ISSUE_IDS,
  scoreToHealthState,
  type ModuleResult,
  type ScanReport,
} from '@whc/shared';
import Image from 'next/image';
import { Figure } from '@/components/ui/ledger';
import { moduleDetails } from '@/content/module-details';
import { cn } from '@/lib/cn';
import { healthText } from '@/lib/health-styles';
import { hostnameOf } from '../lib/report-utils';
import { IssueList } from './issue-list';
import { SecurityHeadersPanel } from './security-headers-panel';
import { TechnologyStack } from './technology-stack';
import { VitalsPanel } from './vitals-panel';

export function PhoneShot({
  report,
  className,
}: {
  report: ScanReport;
  className?: string;
}) {
  if (!report.screenshot) return null;
  return (
    <figure className={cn('w-44', className)}>
      <Image
        src={report.screenshot}
        alt={`Mobile view of ${hostnameOf(report.url)}`}
        width={412}
        height={915}
        unoptimized
        className="h-auto w-full border border-ink"
      />
      <figcaption className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        Homepage · 412 px wide
      </figcaption>
    </figure>
  );
}

/** Everything for one audit area: summary, area-specific visuals, then the findings. */
export function ModulePanel({
  report,
  result,
  forPrint,
}: {
  report: ScanReport;
  result: ModuleResult;
  /** Print layout: no filters, passed checks expanded. */
  forPrint?: boolean;
}) {
  const { module } = result;
  const hasHeaderPanel = module === 'security' && Boolean(report.securityHeaders);
  const issues = hasHeaderPanel
    ? result.issues.filter((issue) => !SECURITY_HEADER_ISSUE_IDS.has(issue.id))
    : result.issues;
  const state = result.score === null ? null : scoreToHealthState(result.score);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-semibold tracking-tight">
            {MODULES[module].label}
          </h2>
          <p className="max-w-xl text-ink-soft">{moduleDetails[module].summary}</p>
        </div>
        {result.score !== null && state ? (
          <Figure unit="/ 100" className={cn('text-6xl', healthText[state])}>
            {result.score}
          </Figure>
        ) : null}
      </header>

      {module === 'performance' && report.vitals ? (
        <VitalsPanel vitals={report.vitals} />
      ) : null}

      {hasHeaderPanel && report.securityHeaders ? (
        <SecurityHeadersPanel report={report.securityHeaders} interactive={!forPrint} />
      ) : null}

      {module === 'technology' ? (
        <TechnologyStack technologies={report.technologies} />
      ) : null}

      {module === 'mobile' && report.screenshot ? (
        <div className="grid items-start gap-10 lg:grid-cols-[auto_minmax(0,1fr)]">
          <PhoneShot report={report} />
          <IssueList issues={issues} expandPassed={forPrint} />
        </div>
      ) : module === 'technology' ? null : (
        <div className="space-y-4">
          {hasHeaderPanel ? (
            <h3 className="text-2xl font-semibold tracking-tight">
              Other security findings
            </h3>
          ) : null}
          <IssueList issues={issues} expandPassed={forPrint} />
        </div>
      )}
    </div>
  );
}
