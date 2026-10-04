import { A } from '@/components/content/doc-link';
import type { DocSection } from '@/components/content/doc-layout';
import { siteConfig } from '@/config/site';

export const cookieSections: DocSection[] = [
  {
    id: 'today',
    title: 'What we use today',
    body: (
      <>
        <p>
          <strong>
            {siteConfig.name} does not set any cookies, and does not use analytics,
            advertising or tracking scripts, at the time of writing.
          </strong>
        </p>
        <table>
          <thead>
            <tr>
              <th>Technology</th>
              <th>Used?</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cookies</td>
              <td>No</td>
              <td>No first-party or third-party cookies are set.</td>
            </tr>
            <tr>
              <td>Local / session storage</td>
              <td>No</td>
              <td>
                Nothing is saved in your browser. Report links carry the report ID in the
                address.
              </td>
            </tr>
            <tr>
              <td>Analytics or advertising trackers</td>
              <td>No</td>
              <td>None are loaded.</td>
            </tr>
            <tr>
              <td>Third-party fonts or CDNs</td>
              <td>No</td>
              <td>Fonts are served from our own domain.</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'what-may-change',
    title: 'What may change',
    body: (
      <>
        <p>
          Because the service is free, we may in future add advertising, affiliate links
          or privacy-friendly analytics. Some of those use cookies or similar
          technologies. If we do:
        </p>
        <ul>
          <li>we will list every cookie here (name, provider, purpose, duration);</li>
          <li>
            we will ask for your consent before setting any that are not strictly
            necessary, in regions where that is required;
          </li>
          <li>you will be able to change or withdraw your choice at any time;</li>
          <li>
            we will update our <A href="/privacy">privacy policy</A> first.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-controls',
    title: 'Your browser controls',
    body: (
      <p>
        You can always block or delete cookies in your browser settings, or use a browser
        with tracking protection. Doing so will not stop you from using the service.
      </p>
    ),
  },
];
