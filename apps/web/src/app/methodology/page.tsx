import { DocumentPage } from '@/components/content/document-page';
import { methodologySections } from '@/content/pages/methodology';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Our methodology: how scores are calculated',
  description:
    'What we test, how we test it, how every score is calculated, and what we deliberately do not claim. No AI scoring — fixed, explainable rules.',
  path: '/methodology',
});

export default function MethodologyPage() {
  return (
    <DocumentPage
      eyebrow="Methodology"
      title="Not just a score. An actual audit."
      description="What we test, how we test it, how scoring works, and what we do not claim."
      sections={methodologySections}
      cta
    />
  );
}
