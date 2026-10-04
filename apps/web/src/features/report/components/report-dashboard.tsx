'use client';

import { MODULE_IDS, type ScanReport } from '@whc/shared';
import { useRef, useState } from 'react';
import { Container } from '@/components/ui/container';
import { hostnameOf } from '../lib/report-utils';
import { ModulePanel } from './module-panel';
import { OverviewPanel } from './overview-panel';
import { ReportActions } from './report-actions';
import { ReportSidebar, type ReportTab } from './report-sidebar';

const isTab = (value: string): value is ReportTab =>
  value === 'overview' || (MODULE_IDS as readonly string[]).includes(value);

/** Lets a shared link such as /report/abc#security open on that tab. */
function initialTab(): ReportTab {
  const hash = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
  return isTab(hash) ? hash : 'overview';
}

interface ReportDashboardProps {
  report: ScanReport;
  scanId: string;
  expiresAt: string;
}

/** The report as an app-style dashboard: summary header, section index, one panel at a time. */
export function ReportDashboard({ report, scanId, expiresAt }: ReportDashboardProps) {
  const [tab, setTab] = useState<ReportTab>(initialTab);
  const contentRef = useRef<HTMLDivElement>(null);
  const active = report.modules.find((mod) => mod.module === tab);

  function select(next: ReportTab) {
    setTab(next);
    window.history.replaceState(null, '', `#${next}`);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <Container size="wide" className="py-10 sm:py-14">
      <header className="space-y-6 border-b border-ink pb-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
          Website health report ·{' '}
          {new Date(report.scannedAt).toLocaleDateString(undefined, {
            dateStyle: 'long',
          })}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="min-w-0">
            <h1 className="text-4xl font-semibold tracking-tight break-words sm:text-6xl">
              {hostnameOf(report.url)}
            </h1>
            <p className="mt-2 font-mono text-sm break-all text-ink-soft">{report.url}</p>
          </div>
          <ReportActions report={report} scanId={scanId} />
        </div>
      </header>

      <div className="mt-6 grid gap-x-14 gap-y-6 lg:mt-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <ReportSidebar modules={report.modules} active={tab} onSelect={select} />

        <div ref={contentRef} className="min-w-0 scroll-mt-32">
          {tab === 'overview' || !active ? (
            <OverviewPanel report={report} onSelect={select} />
          ) : (
            <ModulePanel key={active.module} report={report} result={active} />
          )}

          <p className="mt-16 border-t border-line pt-6 text-sm text-ink-faint">
            Reports are not stored — this one is available until{' '}
            {new Date(expiresAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            . Download the PDF or JSON to keep a copy.
          </p>
        </div>
      </div>
    </Container>
  );
}
