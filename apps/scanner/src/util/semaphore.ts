/** Limits how many async tasks run at once; the rest wait in FIFO order. */
export class Semaphore {
  private available: number;
  private readonly waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.available = permits;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.available > 0) this.available -= 1;
    else await new Promise<void>((resolve) => this.waiting.push(resolve));

    try {
      return await task();
    } finally {
      const next = this.waiting.shift();
      if (next) next();
      else this.available += 1;
    }
  }
}
