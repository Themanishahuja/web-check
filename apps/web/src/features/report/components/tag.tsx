import { cn } from '@/lib/cn';

export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

const TEXT: Record<Tone, string> = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  neutral: 'text-ink-faint',
};

const MARK: Record<Tone, string> = {
  good: 'bg-good-fill',
  warn: 'bg-warn-fill',
  bad: 'bg-bad-fill',
  neutral: 'bg-ink-faint/50',
};

/**
 * Status label: a small square and mono capitals. Colour carries meaning only here —
 * no pills, no tinted backgrounds.
 */
export function Tag({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em]',
        TEXT[tone],
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0', MARK[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}

export const toneText = TEXT;
export const toneMark = MARK;
