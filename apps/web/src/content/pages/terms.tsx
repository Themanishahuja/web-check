import { SCAN_LIMITS } from '@whc/shared';
import { A } from '@/components/content/doc-link';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

const { legal, contact } = siteConfig;

export const termsSections: DocSection[] = [
  {
    id: 'acceptance',
    title: 'Agreement',
    body: (
      <>
        <p>
          These terms govern your use of {siteConfig.name} (the “service”), operated by{' '}
          {legal.entity}. By using the service you agree to them. If you do not agree,
          please do not use it.
        </p>
        <p>
          Please also read our <A href="/privacy">privacy policy</A> and{' '}
          <A href="/disclaimer">disclaimer</A>, which form part of this agreement.
        </p>
      </>
    ),
  },
  {
    id: 'the-service',
    title: 'What the service does',
    body: (
      <>
        <p>
          You enter a website address. Our scanner visits that site, examines a limited
          number of its pages, and produces a report on SEO, performance, security
          configuration, accessibility, mobile readiness, links, content and technology.
          The service is free, needs no account, and is provided as an informational
          assessment only.
        </p>
      </>
    ),
  },
  {
    id: 'permission',
    title: 'Which sites you may scan',
    body: (
      <>
        <p>
          You may scan websites that you own or operate, or that you have permission to
          assess, or that are publicly accessible and which you are examining for a
          legitimate purpose such as evaluating a vendor or competitor’s public pages.
        </p>
        <p>
          The scanner performs only ordinary, non-intrusive requests of the kind a browser
          makes, plus a small number of clearly documented checks (see the{' '}
          <A href="/bot">scanner page</A>
          ). It does not log in, submit forms, guess passwords or attempt to exploit
          anything. You are responsible for making sure that scanning a particular site is
          lawful for you.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            use the service to attack, overload, probe for vulnerabilities to exploit, or
            harass any website or person;
          </li>
          <li>
            circumvent or try to get around rate limits, scan limits or other protections,
            including with automated or distributed requests;
          </li>
          <li>
            submit addresses of private networks, internal systems or services you are not
            entitled to reach;
          </li>
          <li>
            scrape, copy or resell the service, its reports or its data at scale, or
            present our output as your own product;
          </li>
          <li>interfere with the operation or security of the service;</li>
          <li>use the service in breach of any law.</li>
        </ul>
        <p>
          We may block addresses or accounts of traffic that breaks these rules, without
          notice.
        </p>
      </>
    ),
  },
  {
    id: 'limits',
    title: 'Fair use and limits',
    body: (
      <>
        <p>
          To keep the service free and available to everyone, each scan is limited.
          Currently a scan examines up to {SCAN_LIMITS.pages} pages and checks up to{' '}
          {SCAN_LIMITS.links} links, and one address can start about{' '}
          {SCAN_LIMITS.scansPerMinute} scans per minute. Reports are kept for{' '}
          {SCAN_LIMITS.reportMinutes} minutes. These limits can change.
        </p>
      </>
    ),
  },
  {
    id: 'reports',
    title: 'Your reports',
    body: (
      <>
        <p>
          Reports describe the site you scanned. You may use, share and download them for
          any lawful purpose, including sending them to clients or colleagues. Reports are
          not stored: once they expire we cannot recover them, so download what you need
          to keep.
        </p>
        <p>
          We (and our licensors) own the service, its design, text, software and scoring
          methodology. Open-source components remain under their own licences.
        </p>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-party services and sites',
    body: (
      <p>
        Parts of a report may rely on third parties (for example Google PageSpeed Insights
        for Core Web Vitals). Links to other websites are provided for convenience; we do
        not control and are not responsible for them. Where we recommend a product, the
        recommendation is explained in our{' '}
        <A href="/disclaimer#commercial">advertising and affiliate disclosure</A>.
      </p>
    ),
  },
  {
    id: 'warranty',
    title: 'No warranty',
    body: (
      <>
        <p>
          The service and its reports are provided{' '}
          <strong>“as is” and “as available”</strong>. We do not promise that results are
          complete, accurate or free of false positives or negatives, that a site is
          secure, accessible, legally compliant or will rank in search, or that the
          service will be uninterrupted. See the <A href="/disclaimer">disclaimer</A> for
          details.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <>
        <p>
          To the fullest extent permitted by law, {legal.entity} is not liable for any
          indirect, incidental, special or consequential loss, or for loss of profits,
          data or goodwill, arising from your use of, or inability to use, the service or
          from decisions you make based on a report. Because the service is free, our
          total liability for any claim is limited to the greater of the amount you paid
          us (zero) and a nominal sum permitted by applicable law.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot be excluded by law, such
          as for fraud or for death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Your responsibility',
    body: (
      <p>
        You are responsible for how you use the service and for the sites you choose to
        scan. You agree to compensate us for claims and costs arising from your breach of
        these terms or from scanning a site you were not entitled to scan.
      </p>
    ),
  },
  {
    id: 'changes-termination',
    title: 'Changes, suspension and termination',
    body: (
      <p>
        We may change, limit, suspend or discontinue the service or these terms at any
        time. We will update the “last updated” date when the terms change; continuing to
        use the service after that means you accept the new terms. You can stop using the
        service at any time.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and contact',
    body: (
      <>
        <p>
          These terms are governed by the laws of {legal.jurisdiction}, and the courts
          there have jurisdiction, without affecting any mandatory consumer rights you
          have where you live.
        </p>
        <p>
          Questions about these terms:{' '}
          <A href={`mailto:${contact.general}`}>{contact.general}</A>.
        </p>
      </>
    ),
  },
];
