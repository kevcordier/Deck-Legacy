import type { TextDefaults } from './TextDefaults';
import { textCategories } from './textCategories';

/** Prepends each default class whose category is not already present in `className`. */
export function withTextDefaults(className: string | undefined, defaults: TextDefaults): string {
  const present = textCategories(className);
  const prefix = (Object.keys(defaults) as (keyof TextDefaults)[])
    .filter(key => !present[key] && defaults[key])
    .map(key => defaults[key]);
  return [...prefix, className ?? ''].join(' ').trim();
}
