import { ChevronDownIcon } from '@/components/ui/icons';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { faqs } from '../data/content';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

/** Native <details> accordion: accessible and works without JavaScript. */
export function FaqSection() {
  return (
    <Section className="border-b border-line" containerSize="narrow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SectionHeading eyebrow="FAQ" title="Questions, answered plainly." />

      <div className="mt-14 border-t border-ink/80">
        {faqs.map((faq) => (
          <details key={faq.question} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDownIcon className="size-5 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="pr-10 pb-6 text-ink-soft text-pretty">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
