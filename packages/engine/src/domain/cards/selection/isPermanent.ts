import { CardTag } from '../../enums';
import type { CardState } from '../../types';

/** A permanent card state: kept out of the deck, always active (`CardTag.PERMANENT`). */
export function isPermanent(state: CardState | undefined): boolean {
  return state?.tags?.includes(CardTag.PERMANENT) ?? false;
}
