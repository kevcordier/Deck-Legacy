import { slugify } from './slugify';

/** Path of a kingdom's game page: `/game/{slug}-{id}`. */
export function kingdomPath(kingdom: { readonly id: string; readonly name: string }): string {
  return `/game/${slugify(kingdom.name)}-${kingdom.id}`;
}
