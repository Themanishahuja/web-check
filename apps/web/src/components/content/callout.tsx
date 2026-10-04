import { cn } from '@/lib/cn';

/** A short, set-apart note. A heavy left rule — no box, no icon. */
export function Callout({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn('border-l-2 border-ink py-1 pl-5', className)}>
      {title ? (
        <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
          {title}
        </p>
      ) : null}
      <div className="text-ink">{children}</div>
    </aside>
  );
}
