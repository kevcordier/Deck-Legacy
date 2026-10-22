import { BLESSED } from './churchConstants';
import { PassiveType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { Passive, Resources } from '@deck-legacy/engine/domain/types';

/** "Blessed cards have + X / Y production". */
export const blessedProduction = (id: string, choices: Resources[]): Passive => ({
  id,
  type: PassiveType.ADD_PRODUCTION_CHOICE,
  cards: { ...BLESSED, scope: [TargetScope.ANY] },
  choices,
});
