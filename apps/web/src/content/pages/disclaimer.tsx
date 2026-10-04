import { A } from '@/components/content/doc-link';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

export const disclaimerSections: DocSection[] = [
  {
    id: 'assessment',
    title: 'A health assessment, not an audit',
    body: (
      <>
        <p>
          {siteConfig.name} gives you a fast, automated picture of how a website is set
          up. It is <strong>not</strong> a penetration test, a security audit, a legal or
          regulatory compliance review, or a substitute for professional advice. A good
          score does not mean a site is secure, accessible, compliant or will perform well
          in search; a poor score does not necessarily mean it is broken.
        </p>
      </>
    ),
  },
  {
    id: 'accuracy',
    title: 'Accuracy and false results',
    body: (
      <>
        <p>
          Automated checks have limits. A report can contain false positives (a problem
          reported that is not a problem for your site) and false negatives (a real
          problem it did not catch). Common reasons:
        </p>
        <ul>
          <li>
            Only a sample of pages is examined, so issues on other pages are not included.
          </li>
          <li>
            Some checks read the HTML a server sends. Content created later by JavaScript
            may be seen differently by visitors or search engines.
          </li>
          <li>
            Sites that block automated tools, or behave differently for bots, can produce
            partial or misleading results.
          </li>
          <li>
            Results are a snapshot of one moment from one location; they can change
            between scans.
          </li>
        </ul>
        <p>
          Always review findings before acting on them, particularly changes to security
          headers, which can break a site if applied without testing.
        </p>
      </>
    ),
  },
  {
    id: 'specific-areas',
    title: 'Notes on specific areas',
    body: (
      <>
        <h3>Security</h3>
        <p>
          We check common configuration signals such as HTTPS, certificates, security
          headers, cookie flags and a few well-known exposed files. We do not test
          application logic, look for injection flaws, or probe for exploits.
        </p>
        <h3>Accessibility</h3>
        <p>
          Automated tools can reliably detect only a portion of accessibility problems.
          Passing every automated check is not proof of conformance with WCAG, the ADA,
          the European Accessibility Act or any other standard. Manual testing with
          assistive technology is still required.
        </p>
        <h3>Performance</h3>
        <p>
          Performance figures are lab measurements (from Google PageSpeed Insights or our
          own browser). Real visitors on different devices and networks will see different
          numbers.
        </p>
        <h3>SEO</h3>
        <p>
          We check technical on-page signals. We do not measure rankings, backlinks,
          keywords or content quality, and nothing here guarantees a position in search
          results.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Use at your own risk',
    body: (
      <p>
        You are responsible for decisions you make using a report. To the extent permitted
        by law we accept no liability for loss or damage arising from reliance on it. See
        the <A href="/terms">terms of use</A>.
      </p>
    ),
  },
  {
    id: 'commercial',
    title: 'Advertising and affiliate disclosure',
    body: (
      <>
        <p>
          The tool is free, and we may earn money from advertising, affiliate links and
          sponsored tool placements. Where a link or recommendation is paid for or earns
          us a commission, we will label it.
        </p>
        <p>
          <strong>Money never changes a score.</strong> Every score comes from fixed rules
          applied to the signals we measure on your site. Advertisers and affiliate
          partners cannot buy, alter or remove a finding. See the{' '}
          <A href="/methodology">methodology</A> for exactly how scores are calculated.
        </p>
      </>
    ),
  },
  {
    id: 'trademarks',
    title: 'Trademarks and third-party names',
    body: (
      <p>
        Product and company names mentioned in reports or on this site (for example
        technologies we detect) belong to their owners. Mentioning them does not imply
        endorsement or affiliation.
      </p>
    ),
  },
];
