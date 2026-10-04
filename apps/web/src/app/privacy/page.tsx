import { DocumentPage } from '@/components/content/document-page';
import { formatLegalDate, siteConfig } from '@/config/site';
import { privacySections } from '@/content/pages/privacy';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Privacy policy',
  description:
    'We need no account, store no reports and set no cookies. This policy explains the little data we do process and why.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <DocumentPage
      eyebrow="Legal"
      title="Privacy policy"
      description="No account, no database, no cookies. Here is the small amount of data we do handle, and why."
      meta={`Last updated ${formatLegalDate(siteConfig.legal.updated)}`}
      sections={privacySections}
    />
  );
}
