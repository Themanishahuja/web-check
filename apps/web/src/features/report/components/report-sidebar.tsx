import { MODULES, scoreToHealthState, type ModuleResult } from '@whc/shared';
import { cn } from '@/lib/cn';
import { healthBar } from '@/lib/health-styles';

export type ReportTab = 'overview' | ModuleResult['module'];

interface ReportSidebarProps {
  modules: ModuleResult[];
  active: ReportTab;
  onSelect: (tab: ReportTab) => void;
}

/** Section index: a ruled column on desktop, underlined tabs on small screens. */
export function ReportSidebar({ modules, active, onSelect }: ReportSidebarProps) {
  const items: Array<{ id: ReportTab; label: string; score: number | null }> = [
    { id: 'overview', label: 'Overview', score: null },
    ...modules.map((mod) => ({
      id: mod.module,
      label: MODULES[mod.module].label,
      score: mod.score,
    })),
  ];

  return (
    <nav
      aria-label="Report sections"
      className="sticky top-16 z-30 -mx-5 overflow-x-auto border-b border-line bg-paper px-5 sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:self-start lg:overflow-visible lg:border-b-0 lg:bg-transparent lg:p-0 print:hidden"
    >
      <ul className="flex gap-6 lg:flex-col lg:gap-0 lg:border-l lg:border-line">
        {items.map((item) => {
          const isActive = item.id === active;
          const state = item.score === null ? null : scoreToHealthState(item.score);
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center justify-between gap-6 border-b-2 py-3 text-sm whitespace-nowrap transition-colors duration-150 lg:-ml-px lg:border-b-0 lg:border-l-2 lg:py-2.5 lg:pl-4',
                  isActive
                    ? 'border-ink font-semibold text-ink'
                    : 'border-transparent text-ink-soft hover:text-ink',
                )}
              >
                <span>{item.label}</span>
                {state ? (
                  <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
                    <span
                      className={cn('size-1.5', healthBar[state])}
                      aria-hidden="true"
                    />
                    {item.score}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
