import { DocumentPage } from '@/components/content/document-page';
import { botSections } from '@/content/pages/bot';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'About our scanner (WebsiteHealthChecker)',
  description:
    'Seeing WebsiteHealthChecker in your logs? It only visits a site when someone asks us to check it. Here is exactly what it requests and how to block it.',
  path: '/bot',
});

export default function BotPage() {
  return (
    <DocumentPage
      eyebrow="Scanner"
      title="About our scanner"
      description="Found WebsiteHealthChecker in your server logs? Here is who it is, what it does, and how to stop it."
      sections={botSections}
    />
  );
}
