import { SCAN_STAGES, type ScanProgress } from '@whc/shared';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

const STAGE_LABELS: Record<(typeof SCAN_STAGES)[number], string> = {
  discover: 'Discover',
  inspect: 'Inspect',
  test: 'Test',
  score: 'Score',
  explain: 'Explain',
};

interface ScanProgressViewProps {
  hostname: string;
  progress: ScanProgress;
}

/** Live view of the five scan stages while the scanner works. */
export function ScanProgressView({ hostname, progress }: ScanProgressViewProps) {
  const activeIndex = SCAN_STAGES.indexOf(progress.stage);

  return (
    <div className="mx-auto max-w-2xl space-y-10 text-center">
      <div className="space-y-4">
        <Eyebrow>Scanning</Eyebrow>
        <h1 className="text-headline font-semibold text-balance break-words">
          {hostname}
        </h1>
        <p className="text-lg text-ink-soft" aria-live="polite">
          {progress.message}
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        aria-label="Scan progress"
        className="h-2 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-700 ease-soft"
          style={{ width: `${Math.max(progress.percent, 3)}%` }}
        />
      </div>

      <ol className="grid grid-cols-5 gap-2">
        {SCAN_STAGES.map((stage, index) => {
          const done = index < activeIndex || progress.percent >= 100;
          const active = index === activeIndex && !done;
          return (
            <li key={stage} className="space-y-2">
              <span
                className={cn(
                  'mx-auto flex size-8 items-center justify-center rounded-full border font-mono text-xs transition-colors duration-300',
                  done && 'border-brand-500 bg-brand-500 text-ink',
                  active && 'border-brand-500 bg-brand-50 text-brand-700',
                  !done && !active && 'border-line text-ink-faint',
                )}
              >
                {done ? <CheckIcon className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  'block text-xs',
                  active || done ? 'font-medium text-ink' : 'text-ink-faint',
                )}
              >
                {STAGE_LABELS[stage]}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="text-sm text-ink-faint">This usually takes 10–40 seconds.</p>
    </div>
  );
}
