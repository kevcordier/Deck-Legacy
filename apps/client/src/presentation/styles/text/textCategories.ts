import type { TextDefaults } from './TextDefaults';
import { splitClassTokens } from './splitClassTokens';
import { ALIGN_TOKEN, FAMILY_TOKEN, SIZE_TOKEN } from './textClassConstants';

/** Returns which text categories are explicitly set by `className`. */
export function textCategories(className = ''): Required<Record<keyof TextDefaults, boolean>> {
  const result = { color: false, family: false, size: false };
  for (const token of splitClassTokens(className)) {
    if (token.includes(':')) continue; // responsive / state variants do not count as a base value
    if (FAMILY_TOKEN.test(token)) result.family = true;
    else if (SIZE_TOKEN.test(token)) result.size = true;
    else if (token.startsWith('text-') && !ALIGN_TOKEN.test(token)) result.color = true;
  }
  return result;
}
