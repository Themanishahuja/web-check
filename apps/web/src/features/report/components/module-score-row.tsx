import { MODULES, scoreToHealthState, type ModuleId } from '@whc/shared';
import { cn } from '@/lib/cn';
import { healthBar, healthText } from '@/lib/health-styles';

interface ModuleScoreRowProps {
  module: ModuleId;
  /** `null` for informational modules (technology). */
  score: number | null;
  className?: string;
}

/** Label + score + proportional bar for a single module. */
export function ModuleScoreRow({ module, score, className }: ModuleScoreRowProps) {
  const state = score === null ? null : scoreToHealthState(score);
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{MODULES[module].label}</span>
        <span
          className={cn(
            'font-mono text-sm font-medium',
            state ? healthText[state] : 'text-brand-700',
          )}
        >
          {score === null ? 'Detected' : score}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-soft',
            state ? healthBar[state] : 'bg-brand-300',
          )}
          style={{ width: `${score ?? 100}%` }}
        />
      </div>
    </div>
  );
}
