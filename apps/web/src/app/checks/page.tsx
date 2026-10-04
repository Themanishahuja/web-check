import { DocumentPage } from '@/components/content/document-page';
import { checkSections } from '@/content/pages/checks';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'What does a website health check actually check?',
  description:
    'Every check in a website health scan: SEO, performance, security headers, accessibility, mobile, broken links, content and technology — what, why and how to fix.',
  path: '/checks',
});

export default function ChecksPage() {
  return (
    <DocumentPage
      eyebrow="Checks"
      title="What does a website health check actually check?"
      description="Every area explained: what we look at, why it matters, an example finding, and what you can do about it."
      sections={checkSections}
      cta
    />
  );
}
