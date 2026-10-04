import { A } from '@/components/content/doc-link';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

export const aboutSections: DocSection[] = [
  {
    id: 'why',
    title: 'Why this exists',
    body: (
      <>
        <p>
          To find out how healthy a website is, you normally open a speed tester, an SEO
          tool, a security-header scanner, an accessibility checker, a link checker and a
          technology detector. Each has its own report, its own jargon and its own free
          limits. Then you have to put the pieces together yourself.
        </p>
        <p>
          {siteConfig.name} does that in one step:{' '}
          <strong>one URL, one scan, one report.</strong>
        </p>
      </>
    ),
  },
  {
    id: 'principles',
    title: 'How we think about it',
    body: (
      <>
        <p>
          Every finding must answer three questions, in language a non-technical owner can
          follow:
        </p>
        <ul>
          <li>
            <strong>What’s wrong?</strong>
          </li>
          <li>
            <strong>Why does it matter?</strong>
          </li>
          <li>
            <strong>How do I fix it?</strong>
          </li>
        </ul>
        <p>
          Scores are computed from fixed rules, so the same site gets the same result and
          every number can be explained. There is no AI guesswork in them. The full method
          is on the <A href="/methodology">methodology page</A>.
        </p>
      </>
    ),
  },
  {
    id: 'free',
    title: 'Free, and honest about it',
    body: (
      <>
        <p>
          The tool is free, with no account and no card. To keep it that way we limit how
          much of a site each scan covers, and we may earn money from advertising or
          affiliate links. We label anything paid, and money never changes a score — see
          the <A href="/disclaimer#commercial">disclosure</A>.
        </p>
        <p>
          We also try to be clear about what a health check is not: it is no substitute
          for a penetration test, an accessibility audit or legal advice.
        </p>
      </>
    ),
  },
  {
    id: 'get-in-touch',
    title: 'Get in touch',
    body: (
      <p>
        Found a wrong finding, or have an idea? We would like to hear it. See the{' '}
        <A href="/contact">contact page</A>.
      </p>
    ),
  },
];
