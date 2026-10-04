import { chromium, type Browser } from 'playwright';
import { config } from '../config.js';
import { Semaphore } from '../util/semaphore.js';

let browserPromise: Promise<Browser> | null = null;
const slots = new Semaphore(config.browser.maxConcurrent);

function launch(): Promise<Browser> {
  const promise = chromium.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-background-networking',
      ...(config.browser.noSandbox ? ['--no-sandbox'] : []),
    ],
  });
  promise
    .then((browser) =>
      browser.on('disconnected', () => {
        if (browserPromise === promise) browserPromise = null;
      }),
    )
    .catch(() => {
      if (browserPromise === promise) browserPromise = null;
    });
  return promise;
}

/** Runs `task` with the shared Chromium instance, limiting concurrent browser work. */
export function withBrowser<T>(task: (browser: Browser) => Promise<T>): Promise<T> {
  return slots.run(async () => {
    browserPromise ??= launch();
    return task(await browserPromise);
  });
}

export async function closeBrowser(): Promise<void> {
  const current = browserPromise;
  browserPromise = null;
  if (current) await (await current.catch(() => null))?.close().catch(() => undefined);
}
