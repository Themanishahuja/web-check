import { DocumentPage } from '@/components/content/document-page';
import { formatLegalDate, siteConfig } from '@/config/site';
import { disclaimerSections } from '@/content/pages/disclaimer';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Disclaimer',
  description:
    'A website health check is an automated assessment, not a security audit, compliance review or guarantee. Read what it can and cannot tell you.',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <DocumentPage
      eyebrow="Legal"
      title="Disclaimer"
      description="What a health check can tell you, what it cannot, and how we handle advertising."
      meta={`Last updated ${formatLegalDate(siteConfig.legal.updated)}`}
      sections={disclaimerSections}
    />
  );
}
