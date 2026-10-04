import { PageHero } from '@/components/layout/page-hero';
import { CtaBand } from './cta-band';
import { DocLayout, type DocSection } from './doc-layout';

interface DocumentPageProps {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string;
  sections: DocSection[];
  /** Show the "check your website" band at the end. */
  cta?: boolean;
}

/** Standard long-form page: hero, table of contents + numbered sections, optional CTA. */
export function DocumentPage({
  eyebrow,
  title,
  description,
  meta,
  sections,
  cta,
}: DocumentPageProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} meta={meta} />
      <DocLayout sections={sections} />
      {cta ? <CtaBand /> : null}
    </>
  );
}
