import { HealthSignal } from '@/components/ui/health-signal';
import { cn } from '@/lib/cn';
import { heroSignals } from '../data/hero-signals';

/** Decorative drifting health chips behind the hero. Pure CSS, hidden on small screens. */
export function HeroSignals() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      {heroSignals.map((signal) => (
        <div
          key={signal.label}
          className={cn(
            'absolute animate-drift motion-reduce:animate-none',
            signal.position,
          )}
          style={{ animationDelay: signal.delay }}
        >
          <HealthSignal
            state={signal.state}
            label={signal.label}
            className="bg-surface/90 shadow-sm"
          />
        </div>
      ))}
    </div>
  );
}
