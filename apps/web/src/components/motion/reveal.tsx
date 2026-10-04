'use client';

import { motion } from 'motion/react';
import type { ComponentPropsWithoutRef } from 'react';

interface RevealProps extends Omit<
  ComponentPropsWithoutRef<typeof motion.div>,
  'initial' | 'whileInView'
> {
  /** Seconds to wait before animating — use for staggering siblings. */
  delay?: number;
  /** Vertical offset (px) to travel from. */
  y?: number;
}

/** Fade + rise into view once, when scrolled to. */
export function Reveal({ delay = 0, y = 16, transition, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay, ...transition }}
      {...props}
    />
  );
}
