import { stableJson } from './stableJson';

/** Same value whatever the key order. */
export function sameValue(a: unknown, b: unknown): boolean {
  return stableJson(a) === stableJson(b);
}
