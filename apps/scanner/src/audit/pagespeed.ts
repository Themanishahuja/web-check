import { config } from '../config.js';

export interface PageSpeedResult {
  performanceScore: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
  /** Real-user INP (p75, ms) from Chrome UX Report, when Google has field data. */
  inpMs: number | null;
}

interface PsiAudit {
  numericValue?: number;
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: { performance?: { score?: number | null } };
    audits?: Record<string, PsiAudit | undefined>;
  };
  loadingExperience?: {
    metrics?: Record<string, { percentile?: number } | undefined>;
  };
}

/** Lab + field performance data from Google PageSpeed Insights. Returns null on any failure. */
export async function fetchPageSpeed(url: string): Promise<PageSpeedResult | null> {
  if (!config.pageSpeed.enabled) return null;

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('strategy', 'mobile');
  endpoint.searchParams.set('category', 'performance');
  if (config.pageSpeed.apiKey) endpoint.searchParams.set('key', config.pageSpeed.apiKey);

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(config.pageSpeed.timeoutMs),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as PsiResponse;
    const audits = data.lighthouseResult?.audits ?? {};
    const score = data.lighthouseResult?.categories?.performance?.score;

    return {
      performanceScore: typeof score === 'number' ? Math.round(score * 100) : null,
      lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
      cls: audits['cumulative-layout-shift']?.numericValue ?? null,
      tbtMs: audits['total-blocking-time']?.numericValue ?? null,
      fcpMs: audits['first-contentful-paint']?.numericValue ?? null,
      inpMs:
        data.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT_MS?.percentile ??
        data.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile ??
        null,
    };
  } catch {
    return null;
  }
}
