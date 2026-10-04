'use client';

import type { ScanJob } from '@whc/shared';
import { useEffect, useState } from 'react';
import { ScannerApiError, getScan } from '../api';

const POLL_INTERVAL_MS = 1200;
/** Consecutive network failures tolerated before giving up (scanner restarts, flaky wifi…). */
const MAX_NETWORK_FAILURES = 4;

interface ScanJobState {
  job: ScanJob | null;
  error: ScannerApiError | null;
}

/** Polls the scanner until the job completes or fails. */
export function useScanJob(id: string): ScanJobState {
  const [state, setState] = useState<ScanJobState>({ job: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    async function poll() {
      try {
        const job = await getScan(id, controller.signal);
        failures = 0;
        setState({ job, error: null });
        if (job.status === 'queued' || job.status === 'running') {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const apiError =
          error instanceof ScannerApiError
            ? error
            : new ScannerApiError('Something went wrong. Please try again.', 0);
        failures += 1;
        if (apiError.status === 0 && failures < MAX_NETWORK_FAILURES) {
          timer = setTimeout(poll, POLL_INTERVAL_MS * 2);
          return;
        }
        setState((current) => ({ ...current, error: apiError }));
      }
    }

    void poll();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  return state;
}
