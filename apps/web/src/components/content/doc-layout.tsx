import { Container } from '@/components/ui/container';

export interface DocSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

/**
 * Long-form document: a sticky table of contents on the left, numbered sections on
 * the right. Used by the legal pages, the methodology and the checks reference.
 */
export function DocLayout({ sections }: { sections: DocSection[] }) {
  return (
    <Container
      size="wide"
      className="grid gap-x-16 gap-y-10 py-14 sm:py-20 lg:grid-cols-[14rem_minmax(0,1fr)]"
    >
      <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
          On this page
        </p>
        <ol className="mt-4 space-y-0.5 border-l border-line">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="-ml-px flex gap-3 border-l-2 border-transparent py-1.5 pl-4 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <span className="font-mono text-xs text-ink-faint tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-3xl space-y-16">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <p className="font-mono text-xs text-ink-faint tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-2 mb-6 border-t border-ink pt-5 text-3xl font-semibold tracking-tight text-balance">
              {section.title}
            </h2>
            <div className="prose-doc">{section.body}</div>
          </section>
        ))}
      </div>
    </Container>
  );
}
