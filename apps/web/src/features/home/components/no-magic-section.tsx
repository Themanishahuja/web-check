'use client';

import { motion } from 'motion/react';
import { Reveal } from '@/components/motion/reveal';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { pipelineSteps } from '../data/content';

/** The rule-engine pipeline, from raw HTML to an actionable result. */
export function NoMagicSection() {
  return (
    <Section className="border-b border-line bg-paper-deep/60" containerSize="wide">
      <SectionHeading
        eyebrow="Built from real checks"
        title="No magic. No guesswork."
        description="Our results are generated from actual website signals and defined audit rules."
      />

      <div className="relative mt-20">
        <motion.div
          aria-hidden="true"
          className="absolute top-[5px] right-0 left-0 hidden h-px origin-left bg-brand-300 lg:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2 }}
        />
        <ol className="grid gap-10 lg:grid-cols-6 lg:gap-6">
          {pipelineSteps.map((step, index) => (
            <li key={step.label}>
              <Reveal delay={0.15 + index * 0.1} className="relative space-y-3">
                <span className="block size-[11px] rounded-full border-2 border-brand-500 bg-paper" />
                <p className="font-mono text-xs text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="text-lg font-semibold leading-tight tracking-tight">
                  {step.label}
                </p>
                <code className="inline-block rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink-soft">
                  {step.example}
                </code>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
