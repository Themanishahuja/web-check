import { Container } from '@/components/ui/container';

export interface Stage {
  title: string;
  summary: string;
  /** What happens in this stage, as short bullet points. */
  details: string[];
  /** A small mono excerpt that shows what the stage looks like. */
  example: string;
}

/** Numbered stages: giant numeral, explanation, and a mono "what it looks like" excerpt. */
export function StageList({ stages }: { stages: Stage[] }) {
  return (
    <Container size="wide" className="py-6 sm:py-10">
      <ol className="divide-y divide-line border-b border-ink">
        {stages.map((stage, index) => (
          <li
            key={stage.title}
            className="grid gap-x-12 gap-y-6 py-12 lg:grid-cols-[7rem_minmax(0,1fr)_minmax(0,22rem)]"
          >
            <p className="text-6xl leading-none font-semibold tracking-tighter text-ink-faint tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </p>

            <div className="space-y-4">
              <h2 className="text-4xl font-semibold tracking-tight">{stage.title}</h2>
              <p className="text-xl text-ink-soft text-pretty">{stage.summary}</p>
              <ul className="list-disc space-y-2 pl-5 text-ink-soft marker:text-ink-faint">
                {stage.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>

            <pre
              className="self-start overflow-x-auto border-l-2 border-ink bg-paper-deep/60 px-5 py-4 font-mono text-xs leading-relaxed text-ink-soft"
              aria-label={`Example output of the ${stage.title} stage`}
            >
              {stage.example}
            </pre>
          </li>
        ))}
      </ol>
    </Container>
  );
}
