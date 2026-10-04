'use client';

import { MODULE_IDS, MODULES, type ModuleId } from '@whc/shared';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { CheckIcon } from '@/components/ui/icons';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';
import { moduleDetails } from '@/content/module-details';

const INNER_RADIUS = 27;
const NODE_RADIUS = 43;

function polar(index: number, radius: number) {
  const angle = (index / MODULE_IDS.length) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
}

function ModulePreview({ module }: { module: ModuleId }) {
  const detail = moduleDetails[module];
  return (
    <motion.div
      key={module}
      className="space-y-3 text-center"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      aria-live="polite"
    >
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
        Your website
      </p>
      <h3 className="text-2xl font-semibold tracking-tight">{MODULES[module].label}</h3>
      <p className="text-sm text-ink-soft text-pretty">{detail.summary}</p>
      <ul className="space-y-1 text-left text-xs text-ink-soft">
        {detail.checks.map((check) => (
          <li key={check} className="flex gap-2">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-good" />
            {check}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function ModuleWheel() {
  const [active, setActive] = useState<ModuleId>('seo');

  return (
    <Section className="border-b border-line">
      <SectionHeading
        eyebrow="One website. Every important check."
        title="Eight areas of health, one report."
        description="Select an area to see what sits behind it."
      />

      <Reveal className="mt-16">
        {/* Wheel — tablet and up */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[40rem] sm:block">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r={NODE_RADIUS}
              fill="none"
              className="stroke-line"
              strokeWidth={0.25}
              strokeDasharray="1 1.4"
            />
            {MODULE_IDS.map((id, index) => {
              const from = polar(index, INNER_RADIUS);
              const to = polar(index, NODE_RADIUS);
              return (
                <line
                  key={id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  strokeWidth={0.35}
                  className={cn(
                    'transition-[stroke] duration-300',
                    active === id ? 'stroke-brand-500' : 'stroke-line',
                  )}
                />
              );
            })}
            <circle
              cx="50"
              cy="50"
              r={INNER_RADIUS}
              className="fill-surface stroke-line"
              strokeWidth={0.3}
            />
          </svg>

          <div
            className="absolute flex items-center justify-center p-4"
            style={{
              left: `${50 - INNER_RADIUS}%`,
              top: `${50 - INNER_RADIUS}%`,
              width: `${INNER_RADIUS * 2}%`,
              height: `${INNER_RADIUS * 2}%`,
            }}
          >
            <ModulePreview module={active} />
          </div>

          {MODULE_IDS.map((id, index) => {
            const { x, y } = polar(index, NODE_RADIUS);
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                onMouseEnter={() => setActive(id)}
                onFocus={() => setActive(id)}
                aria-pressed={isActive}
                className={cn(
                  '-translate-x-1/2 -translate-y-1/2 absolute whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-[background-color,color,border-color] duration-300',
                  isActive
                    ? 'border-brand-500 bg-brand-500 text-ink'
                    : 'border-line bg-surface text-ink hover:border-brand-500',
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {MODULES[id].label}
              </button>
            );
          })}
        </div>

        {/* Stacked — phones */}
        <div className="space-y-6 sm:hidden">
          <div className="flex flex-wrap justify-center gap-2">
            {MODULE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                aria-pressed={active === id}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300',
                  active === id
                    ? 'border-brand-500 bg-brand-500 text-ink'
                    : 'border-line bg-surface text-ink',
                )}
              >
                {MODULES[id].label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <ModulePreview module={active} />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
