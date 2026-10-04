import { DocumentPage } from '@/components/content/document-page';
import { aboutSections } from '@/content/pages/about';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'Why we built one free tool that checks SEO, performance, security, accessibility, links and more in a single scan.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <DocumentPage
      eyebrow="About"
      title="One URL. One scan. One report."
      description="Why we built a single health check instead of asking you to juggle seven tools."
      sections={aboutSections}
      cta
    />
  );
}
