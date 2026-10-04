import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn('size-7', className)} aria-hidden="true">
      <rect width="28" height="28" rx="8" className="fill-brand-500" />
      <path
        d="M4.5 15h4.6l2.4-6 4 11 2.6-7 1.3 2H23.5"
        fill="none"
        stroke="#16191c"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 font-semibold tracking-tight',
        className,
      )}
      aria-label={`${siteConfig.name} — home`}
    >
      <LogoMark />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
