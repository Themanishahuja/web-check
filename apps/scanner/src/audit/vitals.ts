import type { WebVitals } from '@whc/shared';
import type { BrowserAudit } from '../browser/inspect.js';
import type { PageSpeedResult } from './pagespeed.js';

/**
 * Picks the most trustworthy Core Web Vitals available:
 * Google PageSpeed Insights (throttled mobile lab run + real-user INP) when it
 * answered, otherwise the unthrottled measurement from our own browser.
 */
export function buildVitals(
  pageSpeed: PageSpeedResult | null,
  browser: BrowserAudit | null,
): WebVitals | null {
  if (pageSpeed && pageSpeed.lcpMs !== null) {
    return {
      source: 'pagespeed',
      lcpMs: pageSpeed.lcpMs,
      cls: pageSpeed.cls,
      tbtMs: pageSpeed.tbtMs,
      fcpMs: pageSpeed.fcpMs,
      inpMs: pageSpeed.inpMs,
    };
  }
  if (browser && browser.vitals.lcpMs !== null) {
    return { source: 'browser', ...browser.vitals, inpMs: null };
  }
  return null;
}
