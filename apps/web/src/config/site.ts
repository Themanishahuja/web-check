/**
 * Site-wide facts. Everything the legal pages need to name ("who are we, how do
 * you reach us, when did this change") lives here so it is filled in exactly once.
 */
export const siteConfig = {
  name: 'Website Health Checker',
  shortName: 'Health Checker',
  description:
    'Check your website’s SEO, performance, security, accessibility, mobile UX and links in one free scan. No login, no credit card.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  /**
   * TODO(before launch): replace the placeholders below with real details and have
   * the legal pages reviewed by a lawyer. They are written to match how the product
   * actually behaves today, but they are not legal advice.
   */
  legal: {
    /** Legal name of the operator, e.g. "Acme Labs Pvt. Ltd." */
    entity: 'Website Health Checker',
    /** Postal address shown in the privacy policy (optional but expected in some regions). */
    address: null as string | null,
    /** Governing law / courts named in the terms, e.g. "India". */
    jurisdiction: '[Jurisdiction]',
    /** How long server logs (IP address, user agent, requested URL) are kept. */
    logRetentionDays: 30,
    /** Date the legal pages were last revised. */
    updated: '2026-10-04',
  },

  contact: {
    general: 'hello@websitehealthchecker.example',
    privacy: 'privacy@websitehealthchecker.example',
    abuse: 'abuse@websitehealthchecker.example',
    security: 'security@websitehealthchecker.example',
  },

  /** What our scanner sends as its User-Agent (documented on /bot). */
  scanner: {
    userAgentToken: 'WebsiteHealthChecker',
    version: '1.0',
  },

  methodologyVersion: '1.0',
} as const;

export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
