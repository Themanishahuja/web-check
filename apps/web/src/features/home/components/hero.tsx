import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/motion/reveal';
import { UrlScanForm } from '@/features/scanner/components/url-scan-form';
import { HeroSignals } from './hero-signals';
import { TrustList } from '@/components/ui/trust-list';

export function Hero() {
  return (
    <section
      id="scan"
      className="relative scroll-mt-16 overflow-hidden border-b border-line"
    >
      <div aria-hidden="true" className="bg-grid absolute inset-0" />
      <HeroSignals />

      <Container size="wide" className="relative py-24 text-center sm:py-32 lg:py-40">
        <Reveal className="mx-auto max-w-5xl space-y-6">
          <Eyebrow>One URL · Complete website health</Eyebrow>
          <h1 className="text-display font-semibold text-balance">
            Everything your website needs to be healthy.
            <span className="mt-1 block">
              <span className="marker">In one free check.</span>
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-ink-soft text-pretty">
            SEO. Performance. Security. Accessibility. Mobile UX. Broken links.
            Technology.
            <br className="hidden sm:block" /> One scan. One report. No jumping between
            tools.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mx-auto mt-12 max-w-2xl">
          <UrlScanForm />
          <TrustList className="mt-2" />
        </Reveal>
      </Container>
    </section>
  );
}
