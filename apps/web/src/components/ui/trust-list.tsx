import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

const DEFAULT_ITEMS = ['100% Free', 'No login', 'No credit card'];

interface TrustListProps {
  items?: string[];
  className?: string;
}

export function TrustList({ items = DEFAULT_ITEMS, className }: TrustListProps) {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-soft',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="inline-flex items-center gap-1.5">
          <CheckIcon className="size-4 text-good" />
          {item}
        </li>
      ))}
    </ul>
  );
}
