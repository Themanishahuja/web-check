import { cn } from '@/lib/cn';

interface BrowserFrameProps {
  /** Content of the browser tab (usually the page title). */
  tab?: React.ReactNode;
  /** Content of the address bar. */
  address: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Light browser window used to present real-looking product UI. */
export function BrowserFrame({ tab, address, children, className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgb(22_25_28/0.04),0_24px_48px_-24px_rgb(8_69_82/0.22)]',
        className,
      )}
    >
      <div className="space-y-2.5 border-b border-line bg-paper-deep px-4 pt-3 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-ink-faint/30" />
            <span className="size-2.5 rounded-full bg-ink-faint/30" />
            <span className="size-2.5 rounded-full bg-ink-faint/30" />
          </div>
          {tab ? (
            <div className="min-w-0 flex-1 truncate rounded-t-md bg-surface px-3 py-1 text-xs text-ink-soft">
              {tab}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs text-ink-soft">
          {address}
        </div>
      </div>
      {children}
    </div>
  );
}
