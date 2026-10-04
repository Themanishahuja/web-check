import type { ApiError, CreateScanResponse, ScanJob } from '@whc/shared';

const BASE_URL = (process.env.NEXT_PUBLIC_SCANNER_URL ?? 'http://localhost:4100').replace(
  /\/$/,
  '',
);

export class ScannerApiError extends Error {
  constructor(
    message: string,
    /** HTTP status, or 0 when the scanner could not be reached. */
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, init);
  } catch {
    throw new ScannerApiError(
      'We couldn’t reach the scanning service. Please try again in a moment.',
      0,
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Partial<ApiError> | null;
    const message =
      response.status === 429
        ? 'You’re scanning too quickly. Please wait a minute and try again.'
        : (body?.error ?? 'Something went wrong. Please try again.');
    throw new ScannerApiError(message, response.status);
  }
  return (await response.json()) as T;
}

export function createScan(url: string): Promise<CreateScanResponse> {
  return request<CreateScanResponse>('/scans', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

export function getScan(id: string, signal?: AbortSignal): Promise<ScanJob> {
  return request<ScanJob>(`/scans/${encodeURIComponent(id)}`, {
    signal,
    cache: 'no-store',
  });
}

/** Asks the scanner to render the finished report as a PDF and returns the file. */
export async function downloadReportPdf(id: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/scans/${encodeURIComponent(id)}/pdf`);
  } catch {
    throw new ScannerApiError(
      'We couldn’t reach the scanning service. Please try again.',
      0,
    );
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Partial<ApiError> | null;
    throw new ScannerApiError(
      body?.error ?? 'We couldn’t prepare the PDF. Please try again.',
      response.status,
    );
  }
  return response.blob();
}
