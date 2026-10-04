'use client';

import { MODULES, scoreToHealthState, type ModuleId } from '@whc/shared';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { BrowserFrame } from '@/components/ui/browser-frame';
import { LockIcon } from '@/components/ui/icons';
import { ScoreRing } from '@/components/ui/score-ring';
import { cn } from '@/lib/cn';
import { healthText } from '@/lib/health-styles';
import { IssueItem } from '@/features/report/components/issue-item';
import { ModuleScoreRow } from '@/features/report/components/module-score-row';
import { demoModules, demoOverallScore, demoTechnologies } from '../data/demo-report';
import { moduleDetails } from '@/content/module-details';

/** Interactive sample report: pick a module on the left, see its findings on the right. */
export function DashboardPreview() {
  const [active, setActive] = useState<ModuleId>('seo');
  const result = demoModules.find((item) => item.module === active) ?? demoModules[0];
  if (!result) return null;

  const state = result.score === null ? null : scoreToHealthState(result.score);

  return (
    <Reveal>
      <BrowserFrame
        tab="Website health report"
        address={
          <>
            <LockIcon className="size-3.5 text-good" />
            <span>yourwebsite.com</span>
            <span className="text-ink-faint">· sample report</span>
          </>
        }
      >
        <div className="grid lg:grid-cols-[19rem_1fr]">
          <div className="border-b border-line p-6 lg:border-r lg:border-b-0">
            <div className="flex items-center gap-5">
              <ScoreRing
                score={demoOverallScore}
                size={112}
                strokeWidth={9}
                caption="/ 100"
              />
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
                  Website health
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Overall score across 7 scored modules
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-1">
              {demoModules.map((item, index) => (
                <li key={item.module}>
                  <Reveal delay={0.15 + index * 0.06} y={8}>
                    <button
                      type="button"
                      onClick={() => setActive(item.module)}
                      onMouseEnter={() => setActive(item.module)}
                      aria-pressed={active === item.module}
                      className={cn(
                        'w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-200',
                        active === item.module ? 'bg-brand-50' : 'hover:bg-paper-deep/70',
                      )}
                    >
                      <ModuleScoreRow module={item.module} score={item.score} />
                    </button>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            key={active}
            className="min-h-[26rem] p-6 sm:p-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {MODULES[active].label}
                </h3>
                <p className="mt-1 max-w-md text-sm text-ink-soft">
                  {moduleDetails[active].summary}
                </p>
              </div>
              <p
                className={cn(
                  'font-mono text-3xl font-semibold',
                  state ? healthText[state] : 'text-brand-700',
                )}
              >
                {result.score ?? '—'}
              </p>
            </div>

            <div className="mt-6 divide-y divide-line border-t border-line pt-6">
              {result.score === null ? (
                <ul className="grid gap-3 pt-2 sm:grid-cols-2">
                  {demoTechnologies.map((tech) => (
                    <li
                      key={tech.name}
                      className="flex items-baseline justify-between gap-3 rounded-lg border border-line px-4 py-3"
                    >
                      <span className="font-medium">{tech.name}</span>
                      <span className="font-mono text-xs text-ink-faint">
                        {tech.category}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                result.issues.map((issue) => <IssueItem key={issue.id} issue={issue} />)
              )}
            </div>
          </motion.div>
        </div>
      </BrowserFrame>
    </Reveal>
  );
}
