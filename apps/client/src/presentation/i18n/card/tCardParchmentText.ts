import { ICON_PASSTHROUGH } from './iconPassthrough';
import type { TFunction } from 'i18next';

export function tCardParchmentText(t: TFunction, cardId = 0): string {
  return t(`texts.${cardId}`, { ns: 'cards', ...ICON_PASSTHROUGH });
}
