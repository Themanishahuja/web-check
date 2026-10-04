import { Container } from '@/components/ui/container';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Small line under the description, e.g. "Last updated 4 October 2026". */
  meta?: string;
}

/** Opening block for secondary pages: mono kicker, large title, short intro, heavy rule. */
export function PageHero({ eyebrow, title, description, meta }: PageHeroProps) {
  return (
    <div className="border-b border-ink">
      <Container size="wide" className="py-16 sm:py-24">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-tighter text-balance sm:text-7xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-xl text-ink-soft text-pretty">
            {description}
          </p>
        ) : null}
        {meta ? <p className="mt-6 font-mono text-xs text-ink-faint">{meta}</p> : null}
      </Container>
    </div>
  );
}
