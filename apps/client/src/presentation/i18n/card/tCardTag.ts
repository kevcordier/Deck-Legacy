import type { TFunction } from 'i18next';

export function tCardTag(t: TFunction, tag: string): string {
  return t(`tags.${tag}`, { ns: 'cards' });
}
