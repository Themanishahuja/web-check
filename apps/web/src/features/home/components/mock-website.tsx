import { Annotation } from '@/components/ui/annotation';
import { BrowserFrame } from '@/components/ui/browser-frame';
import { LockIcon } from '@/components/ui/icons';
import type { AnatomyStep, AnatomyTarget } from '../data/anatomy';

interface MockWebsiteProps {
  step: AnatomyStep;
}

/** A small, fake storefront used to demonstrate each audit module visually. */
export function MockWebsite({ step }: MockWebsiteProps) {
  const props = (target: AnatomyTarget) => ({
    active: step.target === target,
    state: step.state,
    label: step.signal,
  });

  return (
    <div aria-hidden="true">
      <BrowserFrame
        tab={
          <Annotation {...props('title')} className="-mx-1">
            <span className="px-1">Acme Coffee — Fresh beans, delivered weekly</span>
          </Annotation>
        }
        address={
          <Annotation {...props('security')} className="-my-0.5 w-full">
            <span className="flex items-center gap-2 px-2 py-0.5">
              <LockIcon className="size-3.5 text-good" />
              https://acmecoffee.com
            </span>
          </Annotation>
        }
      >
        <div className="space-y-8 p-5 sm:p-7">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold tracking-tight">Acme Coffee</span>
            <span className="flex gap-5 text-ink-soft">
              <span>Shop</span>
              <span>Journal</span>
              <span>About</span>
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Fresh coffee, delivered weekly.
            </p>
            <p className="max-w-sm text-sm text-ink-soft">
              Small-batch beans roasted to order and shipped the same week.
            </p>
          </div>

          <Annotation {...props('image')}>
            <div className="flex h-32 items-end rounded-md bg-paper-deep p-3 sm:h-40">
              <span className="font-mono text-xs text-ink-faint">hero.jpg · 2.4 MB</span>
            </div>
          </Annotation>

          <div className="flex items-center gap-2">
            <Annotation {...props('form')} className="flex-1">
              <div className="rounded-md border border-line px-3 py-2 text-sm text-ink-faint">
                Your email
              </div>
            </Annotation>
            <span className="rounded-md bg-brand-500 px-4 py-2 text-sm text-ink">
              Subscribe
            </span>
          </div>

          <div className="flex gap-6 border-t border-line pt-4 text-sm text-ink-soft">
            <Annotation {...props('link')}>
              <span className="px-1 underline decoration-ink-faint/60">Pricing</span>
            </Annotation>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </BrowserFrame>
    </div>
  );
}
