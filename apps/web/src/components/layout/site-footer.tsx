import Link from 'next/link';
import { footerGroups } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink print:hidden">
      <Container
        size="wide"
        className="grid gap-12 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]"
      >
        <div className="max-w-xs space-y-4">
          <Logo />
          <p className="text-sm text-ink-soft">
            One URL, one scan, one report. A website health assessment — not a replacement
            for professional security testing.
          </p>
        </div>

        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <Container
        size="wide"
        className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-5"
      >
        <p className="font-mono text-xs text-ink-faint">
          © {new Date().getFullYear()} {siteConfig.legal.entity}
        </p>
        <p className="font-mono text-xs text-ink-faint">
          Free · No login · No stored reports
        </p>
      </Container>
    </footer>
  );
}
