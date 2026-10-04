import { DocumentPage } from '@/components/content/document-page';
import { formatLegalDate, siteConfig } from '@/config/site';
import { termsSections } from '@/content/pages/terms';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Terms of use',
  description:
    'The rules for using Website Health Checker: which sites you may scan, fair use, and what we do and do not promise.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <DocumentPage
      eyebrow="Legal"
      title="Terms of use"
      description="The ground rules for using the service, in plain language."
      meta={`Last updated ${formatLegalDate(siteConfig.legal.updated)}`}
      sections={termsSections}
    />
  );
}
