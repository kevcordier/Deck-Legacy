import type { TFunction } from 'i18next';

export function tCardName(t: TFunction, stateName = ''): string {
  return t(`names.${stateName}`, { ns: 'cards' });
}
