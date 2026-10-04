import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { ComparisonTable } from './comparison-table';
import { DashboardPreview } from './dashboard-preview';

export function EverythingSection() {
  return (
    <Section className="border-b border-line" containerSize="wide">
      <SectionHeading
        eyebrow="Everything. In one place."
        title="Why use 7 different tools when one scan can check them together?"
        description="Pick any area below to see the kind of findings a real report contains."
      />
      <div className="mt-16">
        <DashboardPreview />
      </div>
      <div className="mt-24">
        <ComparisonTable />
      </div>
    </Section>
  );
}
