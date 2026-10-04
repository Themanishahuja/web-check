'use client';

import { motion } from 'motion/react';
import { Reveal } from '@/components/motion/reveal';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CheckIcon } from '@/components/ui/icons';
import { Section } from '@/components/ui/section';
import { fragmentedTools } from '../data/tools';

const COLUMN_WIDTH = 100;
const VIEWBOX_WIDTH = COLUMN_WIDTH * fragmentedTools.length;
const CENTER_X = VIEWBOX_WIDTH / 2;
const VIEWBOX_HEIGHT = 120;

/** Curve from the centre of tool column `index` down to the single convergence point. */
function convergePath(index: number): string {
  const x = COLUMN_WIDTH * index + COLUMN_WIDTH / 2;
  return `M ${x} 0 C ${x} 60, ${CENTER_X} 50, ${CENTER_X} ${VIEWBOX_HEIGHT}`;
}

export function ToolSprawl() {
  return (
    <Section className="border-b border-line">
      <Reveal className="mx-auto max-w-3xl space-y-5 text-center">
        <Eyebrow>The usual workflow</Eyebrow>
        <h2 className="text-headline font-semibold text-balance">
          Stop checking your website in {fragmentedTools.length} different tools.
        </h2>
        <p className="text-lg text-ink-soft text-pretty">
          Every area of website health normally lives in its own tool, with its own report
          and its own limits. Here it all happens in a single scan.
        </p>
      </Reveal>

      <div className="mx-auto mt-16 max-w-5xl">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
          {fragmentedTools.map((item, index) => (
            <li key={item.tool}>
              <Reveal delay={index * 0.06} className="space-y-1 text-center">
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-ink-faint">
                  {item.checks}
                </p>
                <p className="text-sm font-medium text-ink-soft line-through decoration-ink-faint/60">
                  {item.tool}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>

        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="mt-4 hidden h-28 w-full overflow-visible lg:block"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {fragmentedTools.map((item, index) => (
            <motion.path
              key={item.tool}
              d={convergePath(index)}
              fill="none"
              className="stroke-brand-300"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.4 + index * 0.07 }}
            />
          ))}
        </svg>
        <div
          aria-hidden="true"
          className="mx-auto my-6 h-12 w-px bg-brand-300 lg:hidden"
        />

        <Reveal delay={0.5} className="flex flex-col items-center gap-3">
          <span className="rounded-full border border-line bg-surface px-5 py-2 font-mono text-sm text-ink-soft">
            Your website
          </span>
          <div aria-hidden="true" className="h-8 w-px bg-brand-300" />
          <div className="w-full max-w-xl rounded-3xl border border-brand-100 bg-brand-50 p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-700">
              One health check
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-balance">
              Every important check, together.
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {fragmentedTools.map((item) => (
                <li
                  key={item.checks}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-surface px-3 py-1 text-xs text-ink-soft"
                >
                  <CheckIcon className="size-3.5 text-good" />
                  {item.checks}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
