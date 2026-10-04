'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/button';
import { ScanProgressView } from '@/features/report/components/scan-progress';
import { ScannerApiError, createScan } from '../api';

/** Creates the scan, then hands over to the live report page. */
export function ScanStarter({ url, hostname }: { url: string; hostname: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // StrictMode mounts effects twice in development; only create one scan per attempt.
    if (started.current) return;
    started.current = true;

    createScan(url)
      .then(({ id }) => router.replace(`/report/${id}`))
      .catch((caught: unknown) => {
        setError(
          caught instanceof ScannerApiError
            ? caught.message
            : 'Something went wrong. Please try again.',
        );
      });
  }, [url, router, attempt]);

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-headline font-semibold text-balance">
          We couldn’t start that scan.
        </h1>
        <p className="mx-auto max-w-xl text-lg text-ink-soft">{error}</p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => {
              started.current = false;
              setError(null);
              setAttempt((count) => count + 1);
            }}
          >
            Try again
          </Button>
          <ButtonLink href="/#scan" variant="secondary">
            Use a different URL
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <ScanProgressView
      hostname={hostname}
      progress={{ stage: 'discover', percent: 1, message: 'Starting your scan…' }}
    />
  );
}
