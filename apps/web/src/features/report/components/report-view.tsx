'use client';

import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useScanJob } from '@/features/scanner/hooks/use-scan-job';
import { hostnameOf } from '../lib/report-utils';
import { ReportDashboard } from './report-dashboard';
import { ScanProgressView } from './scan-progress';

function Message({ title, description }: { title: string; description: string }) {
  return (
    <Container size="narrow" className="space-y-6 py-28 text-center">
      <h1 className="text-headline font-semibold text-balance">{title}</h1>
      <p className="text-lg text-ink-soft text-pretty">{description}</p>
      <ButtonLink href="/#scan" size="lg">
        Scan a website
      </ButtonLink>
    </Container>
  );
}

/** Polls a scan and renders progress, an error, or the finished report. */
export function ReportView({ id }: { id: string }) {
  const { job, error } = useScanJob(id);

  if (error) {
    return (
      <Message
        title={
          error.status === 404
            ? 'This report has expired.'
            : 'We lost contact with the scanner.'
        }
        description={error.message}
      />
    );
  }

  if (!job) {
    return (
      <Container size="narrow" className="py-32 text-center text-ink-soft">
        Loading your report…
      </Container>
    );
  }

  if (job.status === 'failed') {
    return (
      <Message
        title="We couldn’t scan that website."
        description={job.error ?? 'Please try again.'}
      />
    );
  }

  if (job.status === 'complete' && job.report) {
    return (
      <ReportDashboard report={job.report} scanId={job.id} expiresAt={job.expiresAt} />
    );
  }

  return (
    <Container className="py-24 sm:py-32">
      <ScanProgressView hostname={hostnameOf(job.url)} progress={job.progress} />
    </Container>
  );
}
