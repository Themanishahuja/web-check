import type { HealthState } from '@whc/shared';

export interface HeroSignal {
  label: string;
  state: HealthState;
  /** Tailwind positioning classes (lg+ only). */
  position: string;
  /** Animation offset so the chips never move in sync. */
  delay: string;
}

export const heroSignals: HeroSignal[] = [
  { label: '<title> found', state: 'good', position: 'left-[4%] top-[16%]', delay: '0s' },
  {
    label: 'HTTPS valid',
    state: 'good',
    position: 'right-[5%] top-[12%]',
    delay: '-2.5s',
  },
  { label: 'LCP 3.4s', state: 'warn', position: 'left-[2%] top-[58%]', delay: '-5s' },
  {
    label: '404 /old-page',
    state: 'bad',
    position: 'right-[3%] top-[52%]',
    delay: '-1.5s',
  },
  {
    label: 'alt text missing ×4',
    state: 'warn',
    position: 'left-[9%] bottom-[8%]',
    delay: '-6.5s',
  },
  {
    label: 'sitemap.xml ok',
    state: 'good',
    position: 'right-[9%] bottom-[10%]',
    delay: '-3.5s',
  },
];
