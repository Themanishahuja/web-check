'use client';

import { MODULES } from '@whc/shared';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { HealthSignal } from '@/components/ui/health-signal';
import { cn } from '@/lib/cn';
import { anatomySteps } from '../data/anatomy';
import { MockWebsite } from './mock-website';

const STEP_COUNT = anatomySteps.length;
/** Scroll distance (in viewport heights) allotted to each step. */
const VH_PER_STEP = 70;

/** Scroll-driven demo: a sticky fake website is inspected one module at a time. */
export function AnatomySection() {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = Math.min(
      STEP_COUNT - 1,
      Math.max(0, Math.floor(progress * (STEP_COUNT + 0.5))),
    );
    setIndex((current) => (current === next ? current : next));
  });

  const step = anatomySteps[index] ?? anatomySteps[0];
  if (!step) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="anatomy-heading"
      className="relative border-b border-line"
      style={{ height: `${(STEP_COUNT + 1) * VH_PER_STEP}vh` }}
    >
      <div className="sticky top-16 flex min-h-[calc(100dvh-4rem)] items-center py-10">
        <Container
          size="wide"
          className="grid items-center gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <Eyebrow>What we check</Eyebrow>
              <h2
                id="anatomy-heading"
                className="text-headline font-semibold text-balance"
              >
                Watch a website get audited.
              </h2>
            </div>

            <div className="min-h-44 border-l-2 border-brand-500 pl-6" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.module}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="font-mono text-xs text-ink-faint">
                    {String(index + 1).padStart(2, '0')} /{' '}
                    {String(STEP_COUNT).padStart(2, '0')}
                  </p>
                  <h3 className="text-3xl font-semibold tracking-tight">
                    {MODULES[step.module].label}
                  </h3>
                  <p className="text-ink-soft text-pretty">{step.looksAt}</p>
                  <HealthSignal state={step.state} label={step.signal} />
                </motion.div>
              </AnimatePresence>
            </div>

            <ol className="flex gap-2" aria-label="Progress">
              {anatomySteps.map((item, i) => (
                <li
                  key={item.module}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-300',
                    i <= index ? 'bg-brand-500' : 'bg-line',
                  )}
                >
                  <span className="sr-only">{MODULES[item.module].label}</span>
                </li>
              ))}
            </ol>
          </div>

          <MockWebsite step={step} />
        </Container>
      </div>
    </section>
  );
}
