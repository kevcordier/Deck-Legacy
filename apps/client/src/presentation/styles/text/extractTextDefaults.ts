import type { TextDefaults } from './TextDefaults';
import { splitClassTokens } from './splitClassTokens';
import { ALIGN_TOKEN, FAMILY_TOKEN, SIZE_TOKEN } from './textClassConstants';

/** Splits a class string into text defaults (color / family / size) and remaining classes. */
export function extractTextDefaults(className = ''): TextDefaults {
  const defaults: TextDefaults = {};
  for (const token of splitClassTokens(className)) {
    if (token.includes(':')) continue;
    if (FAMILY_TOKEN.test(token)) defaults.family = token;
    else if (SIZE_TOKEN.test(token)) defaults.size = token;
    else if (token.startsWith('text-') && !ALIGN_TOKEN.test(token)) defaults.color = token;
  }
  return defaults;
}
