import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

/** Link for prose: internal paths use Next's router, everything else is a plain anchor. */
export function A({ href = '', ...props }: ComponentPropsWithoutRef<'a'>) {
  if (href.startsWith('/')) return <Link href={href} {...props} />;
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      {...props}
    />
  );
}
