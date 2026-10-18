import { Injectable } from '@nestjs/common';

/**
 * Serialises work per game so concurrent syncs never interleave. In memory: the API runs as a
 * single instance (EDR-029).
 */
@Injectable()
export class GameLock {
  private readonly locks = new Map<string, Promise<unknown>>();

  async run<T>(gameId: string, work: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(gameId) ?? Promise.resolve();
    const run = previous.then(work, work);
    const tail = run.catch(() => undefined);
    this.locks.set(gameId, tail);
    try {
      return await run;
    } finally {
      if (this.locks.get(gameId) === tail) this.locks.delete(gameId);
    }
  }
}
