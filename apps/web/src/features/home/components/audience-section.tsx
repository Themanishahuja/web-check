import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { audiences } from '../data/content';

export function AudienceSection() {
  return (
    <Section className="border-b border-line bg-paper-deep/60">
      <SectionHeading
        eyebrow="Who it’s for"
        title="Built for developers, agencies and business owners."
      />

      <Reveal className="mt-16 grid divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {audiences.map((audience, index) => (
          <div key={audience.title} className="space-y-3 px-0 py-8 md:px-8 md:py-10">
            <p className="font-mono text-xs text-ink-faint">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="text-2xl font-semibold tracking-tight">{audience.title}</h3>
            <p className="text-ink-soft text-pretty">{audience.description}</p>
          </div>
        ))}
      </Reveal>

      <div className="mt-12 flex justify-center">
        <ButtonLink href="/#scan" size="lg">
          Check your website — free
        </ButtonLink>
      </div>
    </Section>
  );
}
