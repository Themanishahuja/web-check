'use client';

import type { HealthState } from '@whc/shared';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { HealthSignal } from './health-signal';

interface AnnotationProps {
  active: boolean;
  state: HealthState;
  label: string;
  children: React.ReactNode;
  className?: string;
}

/** Wraps a piece of UI and, when active, highlights it with a marker and a status label. */
export function Annotation({
  active,
  state,
  label,
  children,
  className,
}: AnnotationProps) {
  return (
    <div className={cn('relative', active && 'z-10', className)}>
      <div
        className={cn(
          'rounded-md transition-[box-shadow,background-color] duration-300 ease-soft',
          active && 'bg-mark/60 ring-2 ring-accent ring-offset-2 ring-offset-surface',
        )}
      >
        {children}
      </div>
      <AnimatePresence>
        {active ? (
          <motion.div
            key="label"
            className="absolute -top-4 right-2 z-20"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
          >
            <HealthSignal state={state} label={label} className="bg-surface shadow-sm" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
