/**
 * Scripts that run inside the inspected page. They are plain strings (not
 * functions) so the scanner stays free of DOM typings and bundler transforms.
 */

/** Installed before any page script runs; records vitals as the page loads. */
export const VITALS_COLLECTOR = `
(() => {
  const state = { lcp: 0, lcpElement: '', cls: 0, tbt: 0 };
  window.__whc = state;
  const observe = (type, handler) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(handler)).observe({ type, buffered: true });
    } catch (e) {}
  };
  observe('largest-contentful-paint', (entry) => {
    state.lcp = entry.startTime;
    state.lcpElement = entry.element ? entry.element.tagName.toLowerCase() : '';
  });
  observe('layout-shift', (entry) => { if (!entry.hadRecentInput) state.cls += entry.value; });
  observe('longtask', (entry) => { state.tbt += Math.max(0, entry.duration - 50); });
})();
`;

export const READ_VITALS = `
(() => {
  const paint = performance.getEntriesByName('first-contentful-paint')[0];
  const state = window.__whc;
  return {
    lcpMs: state && state.lcp ? state.lcp : null,
    cls: state ? state.cls : null,
    tbtMs: state ? state.tbt : null,
    fcpMs: paint ? paint.startTime : null,
  };
})()
`;

/** Layout checks that need real rendering at a phone-sized viewport. */
export const MOBILE_LAYOUT_CHECKS = `
(() => {
  const describe = (el) => {
    const id = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
      : '';
    return el.tagName.toLowerCase() + id + cls;
  };
  const isVisible = (el, rect) => {
    if (rect.width === 0 || rect.height === 0) return false;
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0.05;
  };
  const viewportWidth = window.innerWidth;

  // Horizontal overflow
  const root = document.documentElement;
  const overflowPx = Math.max(root.scrollWidth, document.body ? document.body.scrollWidth : 0) - viewportWidth;
  const offenders = [];
  if (overflowPx > 2 && document.body) {
    for (const el of document.body.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth + 2 && isVisible(el, rect)) {
        offenders.push(describe(el));
        if (offenders.length >= 5) break;
      }
    }
  }

  // Touch targets (WCAG 2.2 minimum is 24x24 CSS px; inline text links are exempt)
  const smallTargets = [];
  let smallTargetCount = 0;
  const selector = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link]';
  for (const el of document.querySelectorAll(selector)) {
    const rect = el.getBoundingClientRect();
    if (!isVisible(el, rect)) continue;
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue;
    if (Math.min(rect.width, rect.height) < 24) {
      smallTargetCount += 1;
      if (smallTargets.length < 5) {
        const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30);
        smallTargets.push(describe(el) + ' (' + Math.round(rect.width) + 'x' + Math.round(rect.height) + 'px' + (label ? ', "' + label + '"' : '') + ')');
      }
    }
  }

  // Tiny text
  let smallTextCount = 0;
  const smallText = [];
  let inspected = 0;
  if (document.body) {
    for (const el of document.body.querySelectorAll('*')) {
      inspected += 1;
      if (inspected > 4000) break;
      const hasOwnText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
      if (!hasOwnText) continue;
      const rect = el.getBoundingClientRect();
      if (!isVisible(el, rect)) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 12) {
        smallTextCount += 1;
        if (smallText.length < 4) smallText.push(describe(el) + ' (' + size + 'px)');
      }
    }
  }

  const resources = performance.getEntriesByType('resource');
  const transferBytes = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

  return {
    viewportWidth,
    overflowPx: Math.max(0, Math.round(overflowPx)),
    overflowElements: offenders,
    smallTargetCount,
    smallTargets,
    smallTextCount,
    smallText,
    requestCount: resources.length,
    transferBytes,
  };
})()
`;
