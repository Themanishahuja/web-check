'use client';

import { scoreToHealthState } from '@whc/shared';
import { motion } from 'motion/react';
import { CountUp } from '@/components/motion/count-up';
import { cn } from '@/lib/cn';
import { healthFillText } from '@/lib/health-styles';

interface ScoreRingProps {
  score: number;
  /** Pixel size of the ring. */
  size?: number;
  strokeWidth?: number;
  caption?: string;
  className?: string;
}

/** Circular 0-100 score gauge, coloured by health state. */
export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
  caption = '/ 100',
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const state = scoreToHealthState(score);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        healthFillText[state],
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${score} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-line"
        />
        <motion.circle
          key={score}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference * (1 - score / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-ink">
        <CountUp
          to={score}
          className="text-[2.6rem] font-semibold leading-none tracking-tight"
        />
        <span className="mt-1 font-mono text-xs text-ink-faint">{caption}</span>
      </div>
    </div>
  );
}
