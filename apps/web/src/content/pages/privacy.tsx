import { SCAN_LIMITS } from '@whc/shared';
import { A } from '@/components/content/doc-link';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

const { legal, contact } = siteConfig;

export const privacySections: DocSection[] = [
  {
    id: 'summary',
    title: 'The short version',
    body: (
      <>
        <p>
          {siteConfig.name} is built to need as little data about you as possible. In
          plain terms:
        </p>
        <ul>
          <li>
            <strong>No account, no sign-up, no email address.</strong> You paste a URL and
            get a report.
          </li>
          <li>
            <strong>No database.</strong> Your report lives in the memory of our scanning
            server for {SCAN_LIMITS.reportMinutes} minutes so you can read, share and
            download it, then it is deleted. It is never written to disk.
          </li>
          <li>
            <strong>No cookies today.</strong> We do not set cookies or use analytics or
            advertising trackers on the site at the time of writing. See the{' '}
            <A href="/cookies">cookies page</A>.
          </li>
          <li>
            <strong>Standard server logs.</strong> Like any website, our servers record
            technical request data (including your IP address) for security and abuse
            prevention, kept for up to {legal.logRetentionDays} days.
          </li>
          <li>
            <strong>One outside service sees the URL you scan:</strong> Google PageSpeed
            Insights, which we call to measure Core Web Vitals (when enabled).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          This policy applies to {siteConfig.name}, operated by{' '}
          <strong>{legal.entity}</strong>
          {legal.address ? <> ({legal.address})</> : null}. For privacy questions or
          requests, write to <A href={`mailto:${contact.privacy}`}>{contact.privacy}</A>.
        </p>
        <p>
          We act as the data controller for the limited personal data described below
          (mainly IP addresses in server logs).
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect, and why',
    body: (
      <>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Why</th>
              <th>How long</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>The URL you enter</td>
              <td>To run the scan you asked for.</td>
              <td>
                With the report: {SCAN_LIMITS.reportMinutes} minutes, in memory only.
              </td>
            </tr>
            <tr>
              <td>Scan results (the report)</td>
              <td>To show, share and let you download the report.</td>
              <td>
                {SCAN_LIMITS.reportMinutes} minutes, in memory only. Never stored on disk.
              </td>
            </tr>
            <tr>
              <td>IP address and request details (time, page, status, browser)</td>
              <td>Security, debugging and preventing abuse, including rate limiting.</td>
              <td>
                Rate-limit counters: about one minute, in memory. Server logs: up to{' '}
                {legal.logRetentionDays} days.
              </td>
            </tr>
            <tr>
              <td>Messages you email us</td>
              <td>To reply to you.</td>
              <td>As long as needed to handle your request.</td>
            </tr>
          </tbody>
        </table>
        <p>
          We do <strong>not</strong> collect names, email addresses (unless you write to
          us), payment details, precise location, or advertising identifiers.
        </p>
        <p>
          A report is a technical description of the website you scanned. It is not linked
          to you and contains no information about you as a visitor.
        </p>
      </>
    ),
  },
  {
    id: 'legal-bases',
    title: 'Why we are allowed to process it',
    body: (
      <>
        <p>
          Where data protection law such as the GDPR applies, we rely on{' '}
          <strong>legitimate interests</strong>: providing the service you requested and
          keeping it secure and available (server logs, rate limiting). If we later
          introduce cookies or similar technologies that need consent, we will ask for it
          first and you will be able to withdraw it at any time.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who else is involved',
    body: (
      <>
        <h3>Service providers</h3>
        <p>
          We use hosting and content-delivery providers to run the site and the scanner.
          They process request data (including IP addresses) on our behalf and only to
          deliver the service.
        </p>
        <h3>Google PageSpeed Insights</h3>
        <p>
          To measure Core Web Vitals, our scanner can send the URL you entered to Google’s
          PageSpeed Insights API, which loads that page itself and returns performance
          data. Google handles that request under its own{' '}
          <A href="https://policies.google.com/privacy">privacy policy</A>. We do not send
          anything about you with it.
        </p>
        <h3>The website you scan</h3>
        <p>
          The scanner visits the site you entered, like a browser would. That site’s owner
          may see requests from our scanner in their logs. How we identify ourselves is
          described on the <A href="/bot">scanner page</A>.
        </p>
        <h3>Fonts and assets</h3>
        <p>
          Fonts and other site assets are served from our own domain, not from third-party
          CDNs.
        </p>
        <p>
          We do not sell personal data, and we do not share it for advertising purposes.
        </p>
      </>
    ),
  },
  {
    id: 'advertising',
    title: 'Advertising and affiliate links',
    body: (
      <>
        <p>
          The tool is free. We may support it with advertising, affiliate links and
          sponsored tool recommendations. If we introduce any of these, ad and affiliate
          partners may set cookies or collect identifiers. Before that happens we will
          update this policy and the <A href="/cookies">cookies page</A>, and ask for
          consent where the law requires it.
        </p>
        <p>
          Commercial relationships never change a score: scores come from fixed rules
          applied to your site (see the <A href="/methodology">methodology</A>).
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep data',
    body: (
      <ul>
        <li>
          Reports and the URLs in them: {SCAN_LIMITS.reportMinutes} minutes after the scan
          finishes, then deleted from memory. If the scanning server restarts, they are
          gone immediately.
        </li>
        <li>Server logs: up to {legal.logRetentionDays} days.</li>
        <li>Emails to us: only as long as needed to deal with them.</li>
      </ul>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access, correct or delete
          personal data we hold about you, to object to or restrict its processing, and to
          complain to your local data protection authority. California residents have
          similar rights; we do not “sell” or “share” personal information as those terms
          are defined in California law.
        </p>
        <p>
          Because we keep so little, there is often nothing to retrieve beyond server
          logs. To make a request, email{' '}
          <A href={`mailto:${contact.privacy}`}>{contact.privacy}</A>. We may need your IP
          address and the approximate time of your visit to find the relevant log entries.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect data',
    body: (
      <p>
        The site is served over HTTPS. Scan data is kept only in server memory and is
        never written to a database. The scanner is restricted from reaching private
        networks and only fetches public websites. No system is perfectly secure; if you
        believe you have found a vulnerability, please tell us at{' '}
        <A href={`mailto:${contact.security}`}>{contact.security}</A>.
      </p>
    ),
  },
  {
    id: 'children-transfers',
    title: 'Children and international transfers',
    body: (
      <>
        <p>
          The service is intended for people who run or work on websites and is not
          directed at children under 16. We do not knowingly collect personal data from
          children.
        </p>
        <p>
          Our providers may process data in countries other than your own. Where required,
          they rely on recognised safeguards such as standard contractual clauses.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <>
        <p>
          If we change how we handle data we will update this page and its “last updated”
          date. Material changes (such as adding cookies) will be highlighted before they
          take effect.
        </p>
        <p>
          Questions? <A href={`mailto:${contact.privacy}`}>{contact.privacy}</A>.
        </p>
      </>
    ),
  },
];
