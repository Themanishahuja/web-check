/**
 * Default limits of a free scan. The scanner uses these as defaults (each can be
 * overridden by environment variables) and the public pages quote them, so the
 * documentation cannot drift from the behaviour.
 */
export const SCAN_LIMITS = {
  /** Pages examined per scan (homepage + linked pages). */
  pages: 8,
  /** Unique links checked for breakage per scan. */
  links: 60,
  /** Pages checked with the accessibility engine. */
  accessibilityPages: 3,
  /** Scans one IP address can start per minute. */
  scansPerMinute: 6,
  /** How long a finished report stays available (reports are never stored on disk). */
  reportMinutes: 30,
} as const;
