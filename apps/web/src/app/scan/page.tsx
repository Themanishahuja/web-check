import type { Metadata } from 'next';
import { parseScanUrl } from '@whc/shared';
import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { ScanStarter } from '@/features/scanner/components/scan-starter';

export const metadata: Metadata = { title: 'Scanning…', robots: { index: false } };

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const parsed = parseScanUrl(url ?? '');
  if (!parsed.ok) redirect('/');

  return (
    <Container className="py-24 sm:py-32">
      <ScanStarter url={parsed.url} hostname={parsed.hostname} />
    </Container>
  );
}
