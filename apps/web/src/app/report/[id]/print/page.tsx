import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PrintView } from '@/features/report/components/print-view';

export const metadata: Metadata = {
  title: 'Report (print view)',
  robots: { index: false },
};

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Container size="default" className="py-10 print:max-w-none print:p-0">
      <PrintView id={id} />
    </Container>
  );
}
