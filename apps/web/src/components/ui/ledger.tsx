import { cn } from '@/lib/cn';

/**
 * A row of figures separated by hairlines, like the summary line of a financial
 * statement. Cells sit on a `bg-line` grid with 1px gaps, so rules stay crisp
 * however the cells wrap.
 */
export function Ledger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <dl className={cn('grid gap-px border-y border-ink bg-line', className)}>
      {children}
    </dl>
  );
}

interface LedgerCellProps {
  label: string;
  children: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}

export function LedgerCell({ label, children, note, className }: LedgerCellProps) {
  return (
    <div className={cn('flex flex-col bg-paper px-5 py-5', className)}>
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </dt>
      <dd className="mt-3 flex-1">{children}</dd>
      {note ? <p className="mt-3 text-sm text-ink-soft">{note}</p> : null}
    </div>
  );
}

/** Large tabular figure used inside ledger cells. */
export function Figure({
  children,
  unit,
  className,
}: {
  children: React.ReactNode;
  unit?: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-5xl leading-none font-semibold tracking-tight tabular-nums',
        className,
      )}
    >
      {children}
      {unit ? (
        <span className="ml-1.5 text-xl font-normal text-ink-faint">{unit}</span>
      ) : null}
    </p>
  );
}
