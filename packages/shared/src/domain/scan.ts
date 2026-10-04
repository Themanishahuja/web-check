import type { ScanReport } from './report';

/** The five stages every scan moves through (mirrors the public methodology). */
export const SCAN_STAGES = ['discover', 'inspect', 'test', 'score', 'explain'] as const;
export type ScanStage = (typeof SCAN_STAGES)[number];

export type ScanStatus = 'queued' | 'running' | 'complete' | 'failed';

export interface ScanProgress {
  stage: ScanStage;
  /** 0-100 */
  percent: number;
  message: string;
}

/** What the scanner API returns for a scan. */
export interface ScanJob {
  id: string;
  url: string;
  status: ScanStatus;
  progress: ScanProgress;
  createdAt: string;
  /** ISO timestamp after which the report is discarded (no database by design). */
  expiresAt: string;
  report?: ScanReport;
  error?: string;
}

export interface CreateScanResponse {
  id: string;
}

export interface ApiError {
  error: string;
}
