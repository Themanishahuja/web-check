import { DocumentPage } from '@/components/content/document-page';
import { formatLegalDate, siteConfig } from '@/config/site';
import { cookieSections } from '@/content/pages/cookies';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Cookies',
  description:
    'Website Health Checker sets no cookies today. Here is what we use and what may change.',
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <DocumentPage
      eyebrow="Legal"
      title="Cookies"
      description="Short answer: we do not set any. Here is the full picture."
      meta={`Last updated ${formatLegalDate(siteConfig.legal.updated)}`}
      sections={cookieSections}
    />
  );
}
