import { Reveal } from '@/components/motion/reveal';
import { Container } from '@/components/ui/container';
import { UrlScanForm } from '@/features/scanner/components/url-scan-form';
import { TrustList } from '@/components/ui/trust-list';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-grid absolute inset-0" />
      <Container size="wide" className="relative py-28 text-center sm:py-40">
        <Reveal className="mx-auto max-w-4xl space-y-12">
          <h2 className="text-display font-semibold text-balance">
            How healthy is your website?
          </h2>
          <div className="mx-auto max-w-2xl">
            <UrlScanForm submitLabel="Check now" />
            <TrustList className="mt-2" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
