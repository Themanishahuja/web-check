import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './container';

interface SectionProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children'> {
  children: React.ReactNode;
  containerSize?: 'default' | 'narrow' | 'wide';
  /** Tighter vertical rhythm. */
  compact?: boolean;
}

/** Standard page section: consistent vertical rhythm + container. */
export function Section({
  children,
  containerSize,
  compact,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(compact ? 'py-16 sm:py-20' : 'py-24 sm:py-32', className)}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
