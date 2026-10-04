'use client';

import { useScanJob } from '@/features/scanner/hooks/use-scan-job';
import { PrintReport } from './print-report';

/**
 * Document view of a finished report, loaded by the scanner's headless browser to
 * produce the PDF. It sets data-report-ready once everything is on screen.
 */
export function PrintView({ id }: { id: string }) {
  const { job, error } = useScanJob(id);

  if (error || job?.status === 'failed') {
    return <p data-report-error="true">This report is not available.</p>;
  }
  if (!job || job.status !== 'complete' || !job.report) {
    return <p className="text-ink-soft">Preparing report…</p>;
  }
  return <PrintReport report={job.report} />;
}
