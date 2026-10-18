import type { TextDefaults } from './TextDefaults';

/** Merges two sets of defaults: `inner` wins over `outer`, category by category. */
export function mergeTextDefaults(outer: TextDefaults, inner: TextDefaults): TextDefaults {
  return {
    color: inner.color ?? outer.color,
    family: inner.family ?? outer.family,
    size: inner.size ?? outer.size,
  };
}
