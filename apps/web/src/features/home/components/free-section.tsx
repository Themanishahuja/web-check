import { Reveal } from '@/components/motion/reveal';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CheckIcon } from '@/components/ui/icons';
import { Section } from '@/components/ui/section';
import { freeIncludes } from '../data/content';

export function FreeSection() {
  return (
    <Section className="border-b border-line bg-paper-deep/60">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <Reveal className="space-y-6">
          <Eyebrow>100% Free. Seriously.</Eyebrow>
          <p className="text-[clamp(6rem,3rem+14vw,12rem)] font-semibold leading-[0.85] tracking-[-0.06em]">
            <span className="marker">$0.</span>
          </p>
          <ul className="space-y-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            <li>No subscription.</li>
            <li>No credit card.</li>
            <li>No account required.</li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-sm border border-line bg-surface p-7 font-mono text-sm shadow-[0_24px_48px_-28px_rgb(8_69_82/0.25)] sm:p-9">
            <div className="flex items-center justify-between border-b border-dashed border-ink-faint/60 pb-4 text-xs uppercase tracking-[0.16em] text-ink-faint">
              <span>Free scan</span>
              <span>1 URL</span>
            </div>
            <ul className="space-y-3 py-6">
              {freeIncludes.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <CheckIcon className="size-4 shrink-0 translate-y-0.5 text-good" />
                  <span>{item}</span>
                  <span
                    aria-hidden="true"
                    className="flex-1 translate-y-[-3px] border-b border-dotted border-ink-faint/50"
                  />
                  <span className="text-ink-faint">included</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-dashed border-ink-faint/60 pt-4 text-base font-medium">
              <span>Total</span>
              <span className="text-2xl text-brand-700">$0.00</span>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-20 grid gap-6 border-t border-line pt-12 lg:grid-cols-2 lg:gap-16">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Free doesn’t mean unlimited.
        </h2>
        <p className="text-lg text-ink-soft text-pretty">
          We keep the platform free by limiting scan coverage — the number of pages we
          examine per scan — not by hiding important results behind a paywall. Every
          finding, every recommendation and every score you get is complete.
        </p>
      </Reveal>
    </Section>
  );
}
