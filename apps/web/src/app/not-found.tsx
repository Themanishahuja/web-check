import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <Container size="wide" className="py-28 sm:py-40">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        Error 404
      </p>
      <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tighter text-balance sm:text-7xl">
        That page doesn’t exist.
      </h1>
      <p className="mt-6 max-w-xl text-xl text-ink-soft">
        It may have moved, or the link may be wrong. Ironically, finding broken links is
        what we do.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/#scan" size="lg">
          Scan a website
        </ButtonLink>
        <ButtonLink href="/how-it-works" variant="secondary" size="lg">
          How it works
        </ButtonLink>
      </div>
    </Container>
  );
}
