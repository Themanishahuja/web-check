import type { DetectedTechnology } from '@whc/shared';

export function TechnologyStack({
  technologies,
}: {
  technologies: DetectedTechnology[];
}) {
  const groups = new Map<string, string[]>();
  for (const tech of technologies) {
    groups.set(tech.category, [...(groups.get(tech.category) ?? []), tech.name]);
  }

  if (groups.size === 0) {
    return (
      <p className="border-y border-line py-5 text-ink-soft">
        We couldn’t identify specific technologies from the signals this site exposes.
      </p>
    );
  }

  return (
    <dl className="divide-y divide-line border-y border-ink">
      {[...groups.entries()].map(([category, names]) => (
        <div key={category} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-8">
          <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint sm:pt-1">
            {category}
          </dt>
          <dd className="text-lg font-medium">{names.join(', ')}</dd>
        </div>
      ))}
    </dl>
  );
}
