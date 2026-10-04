import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

/** Small mono label that sits above headlines. */
export function Eyebrow({ className, ...props }: ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={cn(
        'font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand-700',
        className,
      )}
      {...props}
    />
  );
}
