import { environment } from './environment/environment';

/**
 * Shuffles. A game started with a seed (EDR-051) shuffles deterministically from the seed and a
 * salt naming the shuffle, so the server can recompute every shuffle; older games use
 * `environment.random` (`Math.random` in a `GameSession`).
 */

/** 32-bit FNV-1a hash of a string. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.codePointAt(i) ?? 0;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32: small, fast, deterministic PRNG returning floats in [0, 1). */
function mulberry32(state: number): () => number {
  let a = state;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle. With a `seed`, the result only depends on the seed, the salt and the
 * shuffled values: the same shuffle of the same cards always gives the same order.
 */
export function shuffle<T extends number | string>(arr: T[], seed?: string, salt = ''): T[] {
  const random =
    seed === undefined ? environment.random : mulberry32(hash(`${seed}|${salt}|${arr.join(',')}`));
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
