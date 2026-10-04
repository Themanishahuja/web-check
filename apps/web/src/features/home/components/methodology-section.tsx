'use client';

import { useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/cn';
import { methodologySteps } from '../data/content';

/** Five-stage process; the open stage expands to explain what happens. */
export function MethodologySection() {
  const [open, setOpen] = useState<string>(methodologySteps[0].id);

  return (
    <Section className="border-b border-line">
      <div className="grid gap-14 lg:grid-cols-[2fr_3fr] lg:gap-20">
        <SectionHeading
          align="left"
          eyebrow="Our methodology"
          title="Not just a score. An actual audit."
          description="Every score has a reason behind it. This is how a URL becomes a report you can trust."
        />

        <ol className="border-t border-ink/80">
          {methodologySteps.map((step, index) => {
            const isOpen = open === step.id;
            return (
              <li key={step.id} className="border-b border-line">
                <Reveal delay={index * 0.05} y={10}>
                  <button
                    type="button"
                    onClick={() => setOpen(step.id)}
                    onMouseEnter={() => setOpen(step.id)}
                    aria-expanded={isOpen}
                    aria-controls={`method-${step.id}`}
                    className="flex w-full items-baseline gap-5 py-5 text-left"
                  >
                    <span
                      className={cn(
                        'font-mono text-sm transition-colors duration-300',
                        isOpen ? 'text-brand-700' : 'text-ink-faint',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span className="block text-2xl font-semibold tracking-tight">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-ink-soft">{step.summary}</span>
                    </span>
                  </button>
                  <div
                    id={`method-${step.id}`}
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-500 ease-soft',
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pr-4 pb-6 pl-12 text-ink-soft text-pretty">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
