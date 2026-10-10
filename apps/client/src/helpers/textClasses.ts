/**
 * React Native does not cascade text styles from a `View` to its `Text` children.
 * These helpers let a container declare default text classes (color, font family, size)
 * that the `Text` primitive applies unless it sets its own class for the same category.
 */

export type TextDefaults = {
  color?: string;
  family?: string;
  size?: string;
};

const SIZE_TOKEN = /^text-(xs|sm|base|lg|xl|[2-9]xl|\[[^\]]+\])$/;
const ALIGN_TOKEN = /^text-(left|center|right|justify|start|end|ellipsis|clip|wrap|nowrap)$/;
const FAMILY_TOKEN = /^font-(display|deco|body|body-italic|body-bold|mono|sans|serif)$/;

function tokens(className: string): string[] {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .map(token => token.replace(/^!/, ''));
}

/** Returns which text categories are explicitly set by `className`. */
export function textCategories(className = ''): Required<Record<keyof TextDefaults, boolean>> {
  const result = { color: false, family: false, size: false };
  for (const token of tokens(className)) {
    if (token.includes(':')) continue; // responsive / state variants do not count as a base value
    if (FAMILY_TOKEN.test(token)) result.family = true;
    else if (SIZE_TOKEN.test(token)) result.size = true;
    else if (token.startsWith('text-') && !ALIGN_TOKEN.test(token)) result.color = true;
  }
  return result;
}

/** Prepends each default class whose category is not already present in `className`. */
export function withTextDefaults(className: string | undefined, defaults: TextDefaults): string {
  const present = textCategories(className);
  const prefix = (Object.keys(defaults) as (keyof TextDefaults)[])
    .filter(key => !present[key] && defaults[key])
    .map(key => defaults[key]);
  return [...prefix, className ?? ''].join(' ').trim();
}

/** Merges two sets of defaults: `inner` wins over `outer`, category by category. */
export function mergeTextDefaults(outer: TextDefaults, inner: TextDefaults): TextDefaults {
  return {
    color: inner.color ?? outer.color,
    family: inner.family ?? outer.family,
    size: inner.size ?? outer.size,
  };
}

/** Splits a class string into text defaults (color / family / size) and remaining classes. */
export function extractTextDefaults(className = ''): TextDefaults {
  const defaults: TextDefaults = {};
  for (const token of tokens(className)) {
    if (token.includes(':')) continue;
    if (FAMILY_TOKEN.test(token)) defaults.family = token;
    else if (SIZE_TOKEN.test(token)) defaults.size = token;
    else if (token.startsWith('text-') && !ALIGN_TOKEN.test(token)) defaults.color = token;
  }
  return defaults;
}
