import type { Metadata } from 'next';
import { ReportView } from '@/features/report/components/report-view';

export const metadata: Metadata = {
  title: 'Website health report',
  robots: { index: false },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportView id={id} />;
}
