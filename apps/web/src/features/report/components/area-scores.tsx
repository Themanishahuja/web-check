import {
  MODULES,
  scoreToHealthState,
  type ModuleId,
  type ModuleResult,
} from '@whc/shared';
import { cn } from '@/lib/cn';
import { healthBar, healthText } from '@/lib/health-styles';
import { countBySeverity } from '../lib/report-utils';

interface AreaScoresProps {
  modules: ModuleResult[];
  technologyCount: number;
  /** When provided, rows become buttons that open that area. */
  onSelect?: (module: ModuleId) => void;
}

const GRID =
  'grid items-center gap-x-6 sm:grid-cols-[minmax(0,1.1fr)_3.5rem_minmax(0,1fr)_minmax(0,1.3fr)]';

function findingsText(result: ModuleResult, technologyCount: number): string {
  if (result.score === null) return `${technologyCount} detected`;
  const counts = countBySeverity(result.issues);
  const toFix = counts.critical + counts.high + counts.medium + counts.low;
  if (toFix === 0) return 'All clear';
  const important = counts.critical + counts.high;
  return important > 0 ? `${important} important · ${toFix} to fix` : `${toFix} to fix`;
}

/** One line per audit area: name, score, bar and a findings summary. */
export function AreaScores({ modules, technologyCount, onSelect }: AreaScoresProps) {
  return (
    <div className="border-t border-ink">
      <div
        className={cn(
          GRID,
          'hidden border-b border-line py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint sm:grid',
        )}
      >
        <span>Area</span>
        <span className="text-right">Score</span>
        <span />
        <span>Findings</span>
      </div>

      <ul className="divide-y divide-line border-b border-ink">
        {modules.map((result) => {
          const state = result.score === null ? null : scoreToHealthState(result.score);
          const row = (
            <>
              <span className="font-medium">{MODULES[result.module].label}</span>
              <span
                className={cn(
                  'text-right font-mono text-lg font-medium tabular-nums',
                  state ? healthText[state] : 'text-ink-faint',
                )}
              >
                {result.score ?? '—'}
              </span>
              <span className="hidden h-1.5 bg-line sm:block" aria-hidden="true">
                <span
                  className={cn(
                    'block h-full',
                    state ? healthBar[state] : 'bg-ink-faint/30',
                  )}
                  style={{ width: `${result.score ?? 0}%` }}
                />
              </span>
              <span className="text-sm text-ink-soft sm:text-base">
                {findingsText(result, technologyCount)}
              </span>
            </>
          );

          return (
            <li key={result.module}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(result.module)}
                  className={cn(
                    GRID,
                    'w-full grid-cols-[1fr_auto] py-4 text-left transition-colors duration-150 hover:bg-paper-deep/50 sm:grid-cols-[minmax(0,1.1fr)_3.5rem_minmax(0,1fr)_minmax(0,1.3fr)]',
                  )}
                >
                  {row}
                </button>
              ) : (
                <div className={cn(GRID, 'grid-cols-[1fr_auto] py-4')}>{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
