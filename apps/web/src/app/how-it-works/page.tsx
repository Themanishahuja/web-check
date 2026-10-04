import { CtaBand } from '@/components/content/cta-band';
import { A } from '@/components/content/doc-link';
import { StageList } from '@/components/content/stage-list';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import {
  howItWorksStages,
  reportContents,
  scanFacts,
} from '@/content/pages/how-it-works';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'How it works',
  description:
    'Enter a URL and get a complete website health report. See the five steps — discover, inspect, test, score, explain — and exactly what a free scan covers.',
  path: '/how-it-works',
});

const LINK =
  'underline decoration-brand-500 decoration-2 underline-offset-4 hover:decoration-ink';

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Discover. Inspect. Test. Score. Explain."
        description="What happens between pressing “Check now” and reading your report."
      />
      <StageList stages={howItWorksStages} />

      <Container
        size="wide"
        className="grid gap-x-16 gap-y-14 py-16 sm:py-24 lg:grid-cols-2"
      >
        <section aria-labelledby="in-report">
          <h2 id="in-report" className="text-3xl font-semibold tracking-tight">
            What you get
          </h2>
          <ul className="mt-6 divide-y divide-line border-y border-ink">
            {reportContents.map((item) => (
              <li key={item} className="py-3 text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="free-scan">
          <h2 id="free-scan" className="text-3xl font-semibold tracking-tight">
            What a free scan covers
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-ink">
            {scanFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-6 py-3"
              >
                <dt className="text-ink-soft">{fact.label}</dt>
                <dd className="font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-ink-soft">
            Limits keep the tool free for everyone. Details are in the{' '}
            <A href="/methodology#limitations" className={LINK}>
              methodology
            </A>
            ; how we treat your data is in the{' '}
            <A href="/privacy" className={LINK}>
              privacy policy
            </A>
            .
          </p>
        </section>
      </Container>

      <CtaBand />
    </>
  );
}
