import { cn } from '@/lib/cn';
import { Eyebrow } from './eyebrow';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2';
  className?: string;
}

/** Eyebrow + headline + supporting copy. The standard opener for every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl space-y-5',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading className="text-headline font-semibold text-balance">{title}</Heading>
      {description ? (
        <p className="text-lg text-ink-soft text-pretty">{description}</p>
      ) : null}
    </div>
  );
}
