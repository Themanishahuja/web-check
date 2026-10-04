import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { siteConfig } from '@/config/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'How to reach us about the tool, privacy, security issues, or to ask us to stop scanning your site.',
  path: '/contact',
});

const { contact } = siteConfig;

const channels = [
  {
    title: 'General',
    email: contact.general,
    text: 'Questions, feedback, a finding you think is wrong, or an idea for a new check.',
  },
  {
    title: 'Privacy',
    email: contact.privacy,
    text: 'Questions about how we handle data, or a request to access or delete it.',
  },
  {
    title: 'Security',
    email: contact.security,
    text: 'You found a vulnerability in this website or its scanner. Please tell us privately first and give us reasonable time to fix it.',
  },
  {
    title: 'Scanner abuse and opt-out',
    email: contact.abuse,
    text: 'Our scanner is misbehaving, or you want your domain excluded from scanning. Include the domain and, if relevant, log lines with times.',
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a human."
        description="There is no contact form and no ticket system — just email. We read everything."
      />
      <Container size="wide" className="py-14 sm:py-20">
        <dl className="max-w-3xl divide-y divide-line border-y border-ink">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="grid gap-2 py-6 sm:grid-cols-[12rem_1fr] sm:gap-10"
            >
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint sm:pt-1.5">
                {channel.title}
              </dt>
              <dd className="space-y-2">
                <a
                  href={`mailto:${channel.email}`}
                  className="text-xl font-medium underline decoration-brand-500 decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  {channel.email}
                </a>
                <p className="text-ink-soft">{channel.text}</p>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </>
  );
}
