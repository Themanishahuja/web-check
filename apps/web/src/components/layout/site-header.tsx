import Link from 'next/link';
import { mainNav } from '@/config/navigation';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';

export function SiteHeader() {
  return (
    <header className="print:hidden sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur-sm">
      <Container size="wide" className="flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/#scan" size="sm">
          Check website
        </ButtonLink>
      </Container>
    </header>
  );
}
