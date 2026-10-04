import {
  MODULES,
  MODULE_IDS,
  REPEAT_DECAY,
  SCAN_LIMITS,
  SEVERITIES,
  SEVERITY_PENALTY,
  calculateModuleScore,
  type Issue,
} from '@whc/shared';
import { A } from '@/components/content/doc-link';
import { Callout } from '@/components/content/callout';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

/** A worked example computed with the real scoring function, so the page cannot drift from it. */
function exampleScore(): {
  score: number;
  issues: Array<{ severity: Issue['severity']; count: number }>;
} {
  const plan = [
    { severity: 'high', count: 2 },
    { severity: 'low', count: 3 },
  ] as const;
  const issues: Issue[] = plan.flatMap(({ severity, count }) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${severity}-${index}`,
      module: 'seo' as const,
      severity,
      title: '',
      why: '',
      fix: '',
    })),
  );
  return { score: calculateModuleScore(issues), issues: [...plan] };
}

const scored = MODULE_IDS.filter((id) => MODULES[id].scored);

export const methodologySections: DocSection[] = [
  {
    id: 'principles',
    title: 'Principles',
    body: (
      <>
        <p>
          A score is only useful if you can see why it is what it is. Three rules shape
          everything below:
        </p>
        <ul>
          <li>
            <strong>Deterministic.</strong> The same site produces the same findings.
            Scores come from fixed rules, not from a model’s opinion. There is no AI in
            the scoring.
          </li>
          <li>
            <strong>Explainable.</strong> Every finding says what is wrong, why it matters
            and how to fix it. Every score can be traced to the findings behind it.
          </li>
          <li>
            <strong>Honest about limits.</strong> We say what we did not check, and we do
            not claim more than a website health check can deliver.
          </li>
        </ul>
        <p className="font-mono text-sm">
          Methodology version {siteConfig.methodologyVersion}
        </p>
      </>
    ),
  },
  {
    id: 'what-we-test',
    title: 'What we test',
    body: (
      <>
        <p>
          Eight areas. Seven are scored and combined into the overall health score;
          technology detection is informational. The <A href="/checks">checks page</A>{' '}
          lists every check in each area.
        </p>
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Counts toward overall score</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {MODULE_IDS.map((id) => (
              <tr key={id}>
                <td>{MODULES[id].label}</td>
                <td>{MODULES[id].scored ? 'Yes' : 'No — informational'}</td>
                <td>{MODULES[id].scored ? `${MODULES[id].weight}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          The overall score is the weighted average of the {scored.length} scored areas.
          Performance, SEO and security carry the most weight because they affect the most
          visitors.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-test',
    title: 'How we test',
    body: (
      <>
        <p>Each scan moves through five stages:</p>
        <ol>
          <li>
            <strong>Discover.</strong> We fetch your homepage, follow redirects, read{' '}
            <code>robots.txt</code> and your sitemap, and find up to {SCAN_LIMITS.pages}{' '}
            pages to examine.
          </li>
          <li>
            <strong>Inspect.</strong> We parse each page’s HTML, measure its CSS,
            JavaScript and images, read response headers, inspect the TLS certificate, and
            load your homepage in a real browser.
          </li>
          <li>
            <strong>Test.</strong> Hundreds of small rules run against those signals.
          </li>
          <li>
            <strong>Score.</strong> Findings become scores using the formula below.
          </li>
          <li>
            <strong>Explain.</strong> Findings are sorted by severity and written up in
            plain language.
          </li>
        </ol>
        <h3>Tools we rely on</h3>
        <ul>
          <li>
            <strong>Chromium (via Playwright)</strong> renders the page for layout,
            tap-target and Core Web Vitals measurements.
          </li>
          <li>
            <strong>axe-core</strong>, the open-source accessibility engine, checks the
            rendered page against WCAG 2.0, 2.1 and 2.2 (A and AA) rules on up to{' '}
            {SCAN_LIMITS.accessibilityPages} pages.
          </li>
          <li>
            <strong>Google PageSpeed Insights</strong> supplies throttled mobile Core Web
            Vitals and real-user interaction data when available; otherwise we measure in
            our own browser and say so in the report.
          </li>
          <li>
            <strong>Our own rule engine</strong> covers SEO, security headers, links,
            content and technology detection.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'scoring',
    title: 'How scoring works',
    body: (
      <>
        <p>
          Every area starts at <strong>100</strong>. Each failed check subtracts points
          according to its severity:
        </p>
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Points per failed check</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {SEVERITIES.filter((severity) => severity !== 'passed').map((severity) => (
              <tr key={severity}>
                <td>
                  {severity[0]?.toUpperCase()}
                  {severity.slice(1)}
                </td>
                <td>{SEVERITY_PENALTY[severity]}</td>
                <td>
                  {
                    {
                      critical:
                        'Likely to cause serious harm or block visitors and search engines.',
                      high: 'A significant problem that affects many visitors.',
                      medium: 'Worth fixing; noticeable but not severe.',
                      low: 'A small improvement or best-practice gap.',
                      passed: '',
                    }[severity]
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Diminishing returns</h3>
        <p>
          The n-th failure within the same severity costs {REPEAT_DECAY}
          <sup>n−1</sup> of the base penalty. One badly neglected area still scores low,
          but a long list of similar small problems cannot drag an area to zero on its
          own.
        </p>
        <Example />
        <h3>The Security score</h3>
        <p>
          Security blends two views equally: general findings (HTTPS, certificate,
          cookies, exposed files, mixed content) and the security-header score below. That
          way the number shown for Security and the header grade always tell the same
          story.
        </p>
        <h3>Reading a score</h3>
        <ul>
          <li>
            <strong>90–100</strong> Excellent
          </li>
          <li>
            <strong>75–89</strong> Good
          </li>
          <li>
            <strong>50–74</strong> Needs attention
          </li>
          <li>
            <strong>Below 50</strong> Poor
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'security-headers',
    title: 'The security header grade',
    body: (
      <>
        <p>
          We look at 19 response headers. Seven core protections decide the grade; the
          rest show how thorough your setup is but are not graded, because some (like
          cross-origin isolation headers) can break legitimate sites and should be adopted
          deliberately.
        </p>
        <table>
          <thead>
            <tr>
              <th>Core header</th>
              <th>Share of the grade</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Content-Security-Policy', 25],
              ['Strict-Transport-Security', 20],
              ['X-Frame-Options (or CSP frame-ancestors)', 15],
              ['X-Content-Type-Options', 10],
              ['Referrer-Policy', 10],
              ['Permissions-Policy', 10],
              ['Cross-Origin-Opener-Policy', 10],
            ].map(([name, weight]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          A weak-but-present header earns partial credit (for example a CSP that allows{' '}
          <code>unsafe-inline</code>). The percentage maps to a grade: 95+ A+, 85+ A, 70+
          B, 55+ C, 35+ D, otherwise F. A site not served over HTTPS is graded F.
        </p>
      </>
    ),
  },
  {
    id: 'not-tested',
    title: 'What we do not test',
    body: (
      <>
        <ul>
          <li>Penetration testing or vulnerability exploitation of any kind.</li>
          <li>Pages behind a login, or anything that needs a form to be submitted.</li>
          <li>Application logic, business rules or payment flows.</li>
          <li>
            Search rankings, backlinks, keywords or the quality and accuracy of your
            content.
          </li>
          <li>
            Legal compliance, such as GDPR, the ADA or the European Accessibility Act.
            Automated accessibility testing finds only part of what a human review would.
          </li>
        </ul>
        <Callout title="In short">
          This is a website <em>health</em> check. It tells you where to look first, not
          whether you are finished.
        </Callout>
      </>
    ),
  },
  {
    id: 'limitations',
    title: 'Known limitations',
    body: (
      <ul>
        <li>
          <strong>A sample, not the whole site.</strong> Up to {SCAN_LIMITS.pages} pages
          and {SCAN_LIMITS.links} links per scan keep the service free and fast.
        </li>
        <li>
          <strong>Some checks read server HTML.</strong> Content added later by JavaScript
          (for example an H1 created in the browser) may be reported as missing even
          though search engines can see it.
        </li>
        <li>
          <strong>Lab data.</strong> Performance numbers are measurements from one place
          at one time.
        </li>
        <li>
          <strong>Bot protection.</strong> Sites that challenge or block automated tools
          can return partial results. We treat “forbidden” and “too many requests”
          responses as not broken.
        </li>
        <li>
          <strong>Single-page apps.</strong> Pages reached only by in-app navigation may
          not be discovered.
        </li>
      </ul>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to the method',
    body: (
      <p>
        When we add, remove or re-weight a check, we update this page and its version
        number ({siteConfig.methodologyVersion} now). Scores from different versions are
        not strictly comparable. Questions or disagreements with a finding are welcome at{' '}
        <A href={`mailto:${siteConfig.contact.general}`}>{siteConfig.contact.general}</A>.
      </p>
    ),
  },
];

function Example() {
  const { score } = exampleScore();
  return (
    <Callout title="Worked example">
      An area with 2 high and 3 low failures loses 15 × (1 + {REPEAT_DECAY}) + 3 × (1 +{' '}
      {REPEAT_DECAY} + {(REPEAT_DECAY ** 2).toFixed(2)}) ≈ {(100 - score).toFixed(0)}{' '}
      points, so it scores <strong>{score}</strong>.
    </Callout>
  );
}
