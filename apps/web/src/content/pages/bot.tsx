import { SCAN_LIMITS } from '@whc/shared';
import { A } from '@/components/content/doc-link';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

const { scanner, contact } = siteConfig;
const userAgent = `${scanner.userAgentToken}/${scanner.version} (+${siteConfig.url}/bot)`;

export const botSections: DocSection[] = [
  {
    id: 'what-it-is',
    title: 'What this is',
    body: (
      <>
        <p>
          If you found <code>{scanner.userAgentToken}</code> in your server logs, this
          page explains who it is. It is the automated visitor behind {siteConfig.name}, a
          free tool that checks a website’s SEO, performance, security configuration,
          accessibility, links and more.
        </p>
        <p>
          <strong>It never roams the web.</strong> It only visits a site when a person
          types that site’s address into our scanner and presses “Check now”. There is no
          background crawling, no indexing, and no list of sites we revisit.
        </p>
      </>
    ),
  },
  {
    id: 'identification',
    title: 'How to recognise it',
    body: (
      <>
        <p>Most requests identify themselves with this User-Agent:</p>
        <p>
          <code>{userAgent}</code>
        </p>
        <p>
          One step loads the homepage in a headless Chrome browser to measure rendering,
          mobile layout and accessibility. That browser uses Chrome’s standard headless
          User-Agent (it contains <code>HeadlessChrome</code>) and comes from the same
          server addresses.
        </p>
      </>
    ),
  },
  {
    id: 'requests',
    title: 'Exactly what it requests',
    body: (
      <>
        <p>A single scan makes these requests to your site, all read-only:</p>
        <ul>
          <li>
            Your homepage and up to {SCAN_LIMITS.pages - 1} other internal pages it links
            to (or lists in your sitemap).
          </li>
          <li>
            <code>/robots.txt</code> and your sitemap, to report on them.
          </li>
          <li>
            The CSS, JavaScript and image files your homepage references (mostly{' '}
            <code>HEAD</code> requests, plus the stylesheets themselves).
          </li>
          <li>
            Up to {SCAN_LIMITS.links} of the links found on those pages, including links
            to other sites, to detect broken ones.
          </li>
          <li>
            One request to a random, non-existent path, to check that missing pages return
            a proper 404.
          </li>
          <li>
            A plain <code>http://</code> request (to see whether it redirects to HTTPS)
            and a TLS handshake (to read the certificate and protocol).
          </li>
          <li>
            Two requests for well-known sensitive files, <code>/.env</code> and{' '}
            <code>/.git/HEAD</code>. They are only reported as exposed if the response
            clearly looks like such a file, and nothing from the response is stored beyond
            that yes/no result.
          </li>
          <li>
            A headless browser load of your homepage (and up to{' '}
            {SCAN_LIMITS.accessibilityPages - 1} more pages for accessibility checks),
            which fetches the same resources a normal visitor’s browser would.
          </li>
        </ul>
        <p>
          It does <strong>not</strong> log in, submit forms, click buttons, guess URLs,
          test passwords or attempt to exploit anything.
        </p>
      </>
    ),
  },
  {
    id: 'politeness',
    title: 'How gently it behaves',
    body: (
      <ul>
        <li>
          One scan at a time per request, with at most a few simultaneous connections.
        </li>
        <li>Every request has a timeout, and responses are capped in size.</li>
        <li>
          Each visitor to our site can start about {SCAN_LIMITS.scansPerMinute} scans per
          minute, and the total number of scans running at once is limited.
        </li>
        <li>
          It only fetches public websites; private and internal addresses are blocked.
        </li>
      </ul>
    ),
  },
  {
    id: 'robots',
    title: 'Robots.txt',
    body: (
      <>
        <p>
          Because every scan is started by a person who asked us to look at a specific
          address, the scanner behaves like a browser acting for that person: it reads
          your <code>robots.txt</code> in order to <em>report</em> on it (for example,
          whether it blocks search engines) but does not use it to refuse to load pages
          that the person asked about.
        </p>
        <p>If you do not want to be scanned at all, use one of the options below.</p>
      </>
    ),
  },
  {
    id: 'opt-out',
    title: 'Blocking it, or opting out',
    body: (
      <>
        <ul>
          <li>
            <strong>Block it yourself.</strong> Deny requests whose User-Agent contains{' '}
            <code>{scanner.userAgentToken}</code> in your firewall, CDN or web server.
          </li>
          <li>
            <strong>Ask us to block your domain.</strong> Email{' '}
            <A href={`mailto:${contact.abuse}`}>{contact.abuse}</A> with the domain. We
            will stop scans of it (including its subdomains) and tell you when it is done.
          </li>
        </ul>
        <p>
          If you think the scanner is misbehaving, please tell us right away at the same
          address, with the approximate time and your server’s log lines. We take that
          seriously and will act quickly.
        </p>
      </>
    ),
  },
];
