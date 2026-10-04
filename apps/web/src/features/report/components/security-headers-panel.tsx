'use client';

import type {
  SecurityHeaderCategory,
  SecurityHeaderCheck,
  SecurityHeaderReport,
  SecurityHeaderStatus,
} from '@whc/shared';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { healthBar, healthText } from '@/lib/health-styles';
import { gradeState } from '../lib/report-utils';
import { Tag, type Tone } from './tag';

const CATEGORIES: Array<{ id: SecurityHeaderCategory; title: string; blurb: string }> = [
  {
    id: 'protection',
    title: 'Core protections',
    blurb: 'The seven headers that decide your grade. Every site should send these.',
  },
  {
    id: 'isolation',
    title: 'Cross-origin isolation',
    blurb: 'Keep other websites from reaching into yours.',
  },
  {
    id: 'hardening',
    title: 'Extra hardening',
    blurb: 'Smaller safeguards that close remaining gaps.',
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    blurb: 'Make sure you hear about problems browsers detect.',
  },
  {
    id: 'disclosure',
    title: 'Information leaks',
    blurb: 'These should NOT be sent — they tell attackers what you run.',
  },
];

const LABEL = 'font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint';

function statusLabel(check: SecurityHeaderCheck): string {
  if (check.expected === 'absent') return check.status === 'good' ? 'Hidden' : 'Exposed';
  return { good: 'In place', warn: 'Weak', bad: 'Missing', info: 'Not set' }[
    check.status
  ];
}

const toneOf = (status: SecurityHeaderStatus): Tone =>
  status === 'info' ? 'neutral' : status;

function HeaderRow({
  check,
  showAll,
}: {
  check: SecurityHeaderCheck;
  showAll?: boolean;
}) {
  const attention = check.status !== 'good';
  const absentExpected = check.expected === 'absent';

  return (
    <li className="grid gap-x-8 gap-y-3 py-5 lg:grid-cols-[7.5rem_minmax(0,1.15fr)_minmax(0,1fr)] print:break-inside-avoid">
      <div>
        <Tag tone={toneOf(check.status)}>{statusLabel(check)}</Tag>
      </div>

      <div className="min-w-0 space-y-1">
        <p className="font-mono text-sm font-medium break-all">{check.header}</p>
        <p className="text-sm text-ink-faint">{check.label}</p>
        <p className="pt-1 text-sm text-ink-soft">
          <span className={LABEL}>What it does </span>
          <br />
          {check.description}
        </p>
      </div>

      <div className="min-w-0 space-y-3 text-sm">
        <div className="border-l-2 border-line pl-3">
          <p className={LABEL}>Current value</p>
          <p
            className={cn(
              'mt-1 max-h-24 overflow-auto font-mono text-xs break-all',
              check.value ? 'text-ink-soft' : 'text-ink-faint',
            )}
            title={check.value ?? undefined}
          >
            {check.value ?? (absentExpected ? 'Not sent' : 'Not set')}
          </p>
        </div>
        <p className="text-ink-soft">{check.summary}</p>
        {attention || showAll ? (
          <>
            {attention ? (
              <p className="text-ink-soft">
                <span className={cn(LABEL, 'text-warn')}>
                  {absentExpected ? 'Why it matters' : 'If this stays missing'}
                </span>
                <br />
                {check.risk}
              </p>
            ) : null}
            {check.recommendation ? (
              <p className="text-ink-soft">
                <span className={LABEL}>Fix</span>
                <br />
                {check.recommendation}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </li>
  );
}

/** Security-header scanner: grade, a 19-header checklist, and what every header means. */
export function SecurityHeadersPanel({
  report,
  interactive = true,
}: {
  report: SecurityHeaderReport;
  /** The PDF shows every header and has no filter. */
  interactive?: boolean;
}) {
  const [onlyIssues, setOnlyIssues] = useState(false);
  const state = gradeState(report.grade);
  const total = report.checks.length;
  const count = (status: SecurityHeaderStatus) =>
    report.checks.filter((check) => check.status === status).length;
  const good = count('good');

  const segments: Array<{ status: SecurityHeaderStatus; label: string; fill: string }> = [
    { status: 'good', label: 'in the right state', fill: healthBar.good },
    { status: 'warn', label: 'weak / exposed', fill: healthBar.warn },
    { status: 'bad', label: 'missing', fill: healthBar.bad },
    { status: 'info', label: 'optional, not set', fill: 'bg-ink-faint/40' },
  ];
  const present = segments.filter((segment) => count(segment.status) > 0);

  return (
    <section aria-labelledby="headers-heading" className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-ink pt-6">
          <p
            className={cn(
              'text-8xl leading-[0.8] font-semibold tracking-tighter',
              healthText[state],
            )}
            aria-label={`Grade ${report.grade}`}
          >
            {report.grade}
          </p>
          <div className="min-w-0 flex-1 basis-80">
            <h3 id="headers-heading" className="text-2xl font-semibold tracking-tight">
              Security headers: {good} of {total} in the right state
            </h3>
            <p className="mt-1 text-ink-soft">
              Headers are instructions your server sends with every page that tell
              browsers how to protect your visitors. The grade is based on the 7 core
              protections; the rest show how thorough your setup is.
            </p>
          </div>
          <p className="font-mono text-3xl font-medium tabular-nums">
            {report.score}
            <span className="text-base text-ink-faint"> / 100</span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex h-1.5 gap-px bg-line" aria-hidden="true">
            {present.map((segment) => (
              <span
                key={segment.status}
                className={cn('h-full', segment.fill)}
                style={{ width: `${(count(segment.status) / total) * 100}%` }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.7rem] uppercase tracking-wider text-ink-soft">
            {present.map((segment) => (
              <li key={segment.status} className="inline-flex items-center gap-2">
                <span className={cn('size-1.5', segment.fill)} />
                {count(segment.status)} {segment.label}
              </li>
            ))}
          </ul>
        </div>

        {interactive ? (
          <div
            className="flex gap-6 border-b border-line"
            role="group"
            aria-label="Filter headers"
          >
            {[
              { value: false, label: `All ${total}` },
              { value: true, label: `Needs attention (${total - good})` },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setOnlyIssues(option.value)}
                aria-pressed={onlyIssues === option.value}
                className={cn(
                  '-mb-px border-b-2 pb-2 text-sm font-medium transition-colors duration-150',
                  onlyIssues === option.value
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-soft hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {CATEGORIES.map((category) => {
        const inCategory = report.checks.filter(
          (check) => check.category === category.id,
        );
        const items = inCategory.filter(
          (check) => !interactive || !onlyIssues || check.status !== 'good',
        );
        if (items.length === 0) return null;

        return (
          <div key={category.id} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6">
              <h4 className="text-xl font-semibold tracking-tight">{category.title}</h4>
              <p className="font-mono text-xs tabular-nums text-ink-faint">
                {inCategory.filter((check) => check.status === 'good').length} /{' '}
                {inCategory.length}
              </p>
            </div>
            <p className="text-sm text-ink-soft">{category.blurb}</p>
            <ul className="divide-y divide-line border-y border-ink">
              {items.map((check) => (
                <HeaderRow key={check.id} check={check} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
