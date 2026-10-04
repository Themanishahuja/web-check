import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path starting with "/", used for the canonical URL. */
  path: string;
  /** Keep legal boilerplate out of the spotlight without hiding it. */
  noindex?: boolean;
}

/** Consistent title / description / canonical / social tags for a public page. */
export function pageMetadata({
  title,
  description,
  path,
  noindex,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: `${title} · ${siteConfig.name}`,
      description,
      url: path,
    },
    twitter: { card: 'summary', title: `${title} · ${siteConfig.name}`, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
