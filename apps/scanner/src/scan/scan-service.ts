import { randomUUID } from 'node:crypto';
import type { ScanJob, ScanProgress } from '@whc/shared';
import { config } from '../config.js';
import { ScanError } from '../crawl/crawler.js';
import { runScan } from './run-scan.js';

export class QueueFullError extends Error {}

/**
 * In-memory scan queue + job store. There is deliberately no database:
 * reports are held for `reportTtlMs` and then discarded.
 */
export class ScanService {
  private readonly jobs = new Map<string, ScanJob>();
  private readonly queue: string[] = [];
  private running = 0;
  private readonly sweeper: NodeJS.Timeout;

  constructor() {
    this.sweeper = setInterval(() => this.sweep(), 60_000);
    this.sweeper.unref();
  }

  create(url: string): ScanJob {
    if (this.queue.length >= config.scans.maxQueued) throw new QueueFullError();

    const now = Date.now();
    const job: ScanJob = {
      id: randomUUID(),
      url,
      status: 'queued',
      progress: { stage: 'discover', percent: 0, message: 'Waiting in line…' },
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + config.scans.reportTtlMs).toISOString(),
    };
    this.jobs.set(job.id, job);
    this.queue.push(job.id);
    this.pump();
    return job;
  }

  get(id: string): ScanJob | undefined {
    return this.jobs.get(id);
  }

  stop(): void {
    clearInterval(this.sweeper);
  }

  private pump(): void {
    while (this.running < config.scans.maxConcurrent && this.queue.length > 0) {
      const id = this.queue.shift();
      const job = id ? this.jobs.get(id) : undefined;
      if (!job) continue;
      this.running += 1;
      void this.execute(job).finally(() => {
        this.running -= 1;
        this.pump();
      });
    }
  }

  private async execute(job: ScanJob): Promise<void> {
    job.status = 'running';
    const update = (progress: ScanProgress) => {
      job.progress = progress;
    };

    try {
      job.report = await runScan(job.url, update);
      job.status = 'complete';
      job.progress = { stage: 'explain', percent: 100, message: 'Done' };
    } catch (error) {
      job.status = 'failed';
      job.error =
        error instanceof ScanError
          ? error.message
          : 'Something went wrong while scanning this website. Please try again.';
      if (!(error instanceof ScanError)) console.error('Scan failed', job.url, error);
    } finally {
      // Reset the clock so the report lives for the full TTL after completion.
      job.expiresAt = new Date(Date.now() + config.scans.reportTtlMs).toISOString();
    }
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (
        job.status !== 'queued' &&
        job.status !== 'running' &&
        Date.parse(job.expiresAt) < now
      ) {
        this.jobs.delete(id);
      }
    }
  }
}
