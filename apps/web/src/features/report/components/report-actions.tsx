'use client';

import type { ScanReport } from '@whc/shared';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { downloadReportPdf } from '@/features/scanner/api';
import { hostnameOf } from '../lib/report-utils';

const TEXT_ACTION =
  'font-mono text-xs uppercase tracking-[0.14em] text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink';

function saveBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Share / download controls. Hidden when printing. */
export function ReportActions({
  report,
  scanId,
}: {
  report: ScanReport;
  scanId: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pdf, setPdf] = useState<'idle' | 'busy' | 'failed'>('idle');
  const host = hostnameOf(report.url);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the URL is still in the address bar.
    }
  }

  async function savePdf() {
    setPdf('busy');
    try {
      saveBlob(await downloadReportPdf(scanId), `health-report-${host}.pdf`);
      setPdf('idle');
    } catch {
      setPdf('failed');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 print:hidden">
      <button type="button" onClick={copyLink} className={TEXT_ACTION}>
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <button
        type="button"
        onClick={() =>
          saveBlob(
            new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
            `health-report-${host}.json`,
          )
        }
        className={TEXT_ACTION}
      >
        Download JSON
      </button>
      <button
        type="button"
        onClick={savePdf}
        disabled={pdf === 'busy'}
        className={cn(
          'bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60',
        )}
      >
        {pdf === 'busy'
          ? 'Preparing PDF…'
          : pdf === 'failed'
            ? 'PDF failed — retry'
            : 'Download PDF report'}
      </button>
    </div>
  );
}
