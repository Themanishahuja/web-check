import { Container } from '@/components/ui/container';
import { TrustList } from '@/components/ui/trust-list';
import { UrlScanForm } from '@/features/scanner/components/url-scan-form';

/** Closing call to action for content pages. */
export function CtaBand({ title = 'How healthy is your website?' }: { title?: string }) {
  return (
    <section className="border-t border-ink">
      <Container size="wide" className="py-20 text-center sm:py-28">
        <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
          {title}
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <UrlScanForm submitLabel="Check now" />
          <TrustList className="mt-2" />
        </div>
      </Container>
    </section>
  );
}
