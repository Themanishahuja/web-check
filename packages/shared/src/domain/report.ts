import type { ModuleId } from './modules';
import type { Severity } from './severity';

/** One finding. Always answers: what's wrong, why it matters, how to fix it. */
export interface Issue {
  id: string;
  module: ModuleId;
  severity: Severity;
  title: string;
  why: string;
  fix: string;
  /** Pages / URLs where the issue was found. */
  affected?: string[];
}

export interface ModuleResult {
  module: ModuleId;
  /** 0-100, or null for informational modules (e.g. technology). */
  score: number | null;
  issues: Issue[];
}

export interface DetectedTechnology {
  name: string;
  category: string;
}

export type SecurityHeaderStatus = 'good' | 'warn' | 'bad' | 'info';

export type SecurityHeaderCategory =
  'protection' | 'isolation' | 'hardening' | 'monitoring' | 'disclosure';

/** One HTTP security header, as found (or not) on the homepage response. */
export interface SecurityHeaderCheck {
  id: string;
  category: SecurityHeaderCategory;
  /** `absent` for headers that should NOT be sent (they leak information). */
  expected: 'present' | 'absent';
  /** Plain-language explanation of what the header does. */
  description: string;
  /** What can go wrong when the header is missing or weak. */
  risk: string;
  /** Canonical header name, e.g. "Strict-Transport-Security". */
  header: string;
  /** Plain-language name, e.g. "Forces HTTPS". */
  label: string;
  status: SecurityHeaderStatus;
  present: boolean;
  /** Raw header value, when present. */
  value: string | null;
  summary: string;
  /** What to do, when the header is missing or weak. */
  recommendation: string | null;
}

export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityHeaderReport {
  grade: SecurityGrade;
  /** 0-100, weighted share of header protections in place. */
  score: number;
  checks: SecurityHeaderCheck[];
  /** Response headers that reveal server software (e.g. Server, X-Powered-By). */
  disclosure: Array<{ header: string; value: string }>;
}

/** Core Web Vitals + related timings. */
export interface WebVitals {
  /** Where the numbers came from; affects how they should be read. */
  source: 'pagespeed' | 'browser';
  lcpMs: number | null;
  cls: number | null;
  /** Total Blocking Time — lab proxy for interaction responsiveness. */
  tbtMs: number | null;
  fcpMs: number | null;
  /** Real-user Interaction to Next Paint (p75), when Google has field data. */
  inpMs: number | null;
}

export interface ScanCoverage {
  /** Maximum pages a free scan examines. */
  pageLimit: number;
  /** URLs listed in the site's sitemap (0 if none). */
  sitemapUrls: number;
  linksFound: number;
  linksChecked: number;
}

export interface ScanReport {
  url: string;
  scannedAt: string;
  durationMs: number;
  overallScore: number;
  modules: ModuleResult[];
  scannedPages: string[];
  technologies: DetectedTechnology[];
  vitals?: WebVitals;
  securityHeaders?: SecurityHeaderReport;
  /** How much of the site this (free, limited) scan actually covered. */
  coverage?: ScanCoverage;
  /** Mobile viewport screenshot of the homepage, as a JPEG data URL. */
  screenshot?: string;
  /** Honest coverage notes, e.g. checks that could not be performed for this scan. */
  notes: string[];
}
