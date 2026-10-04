'use client';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container size="wide" className="py-28 sm:py-40">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        Something went wrong
      </p>
      <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tighter text-balance sm:text-7xl">
        We hit a problem loading this page.
      </h1>
      <p className="mt-6 max-w-xl text-xl text-ink-soft">
        It is not you. Please try again; if it keeps happening, let us know via the
        contact page.
      </p>
      <div className="mt-10">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </Container>
  );
}
