import { cva, type VariantProps } from 'class-variance-authority';
import type { HealthState } from '@whc/shared';
import { cn } from '@/lib/cn';
import { CheckIcon, CrossIcon, WarnIcon } from './icons';

const signalStyles = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-medium',
  {
    variants: {
      state: {
        good: 'border-good/20 bg-good-soft text-good',
        warn: 'border-warn/25 bg-warn-soft text-warn',
        bad: 'border-bad/20 bg-bad-soft text-bad',
      } satisfies Record<HealthState, string>,
    },
  },
);

const stateIcon = { good: CheckIcon, warn: WarnIcon, bad: CrossIcon } as const;

interface HealthSignalProps extends VariantProps<typeof signalStyles> {
  state: HealthState;
  label: string;
  className?: string;
}

/** Compact status chip: icon + label, coloured by health state. */
export function HealthSignal({ state, label, className }: HealthSignalProps) {
  const StateIcon = stateIcon[state];
  return (
    <span className={cn(signalStyles({ state }), className)}>
      <StateIcon className="size-3.5" />
      {label}
    </span>
  );
}
