import { Reveal } from '@/components/motion/reveal';
import { CheckIcon } from '@/components/ui/icons';
import { comparisonRows } from '../data/content';

/** Neutral side-by-side of the usual workflow versus a single scan. */
export function ComparisonTable() {
  return (
    <Reveal className="mx-auto max-w-3xl">
      <table className="w-full text-left">
        <caption className="sr-only">
          Typical workflow compared with a single scan
        </caption>
        <thead>
          <tr className="border-b border-ink/80 font-mono text-xs uppercase tracking-wider text-ink-faint">
            <th scope="col" className="py-3 pr-4 font-medium">
              Typical workflow
            </th>
            <th scope="col" className="py-3 font-medium text-brand-700">
              Our approach
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row) => (
            <tr key={row.ours} className="border-b border-line">
              <td className="py-4 pr-4 text-ink-soft">{row.typical}</td>
              <td className="py-4 font-medium">
                <span className="inline-flex items-center gap-2">
                  <CheckIcon className="size-4 text-good" />
                  {row.ours}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}
