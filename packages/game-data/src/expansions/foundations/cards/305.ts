import { crossOutProduction } from './crossOutProduction';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Countess Ariadne / Starfall Castle (Foundations 132): a side chosen when discovered. */
export const countessAriadne: CardDef = {
  id: 305,
  name: 'Countess Ariadne',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Countess Ariadne',
      tags: [CardTag.PERSON, CardTag.LADY],
      productions: [{ [ResourceType.GOLD]: 1 }],
      glory: { amount: 5 },
      actions: [
        {
          // When purged, cross out 1 production here instead, still getting the glory in the purge
          id: '305-1-1',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.SAVE_FROM_PURGE,
              cards: { scope: [TargetScope.SELF] },
              keepGlory: true,
            },
            crossOutProduction(2, { scope: [TargetScope.SELF] }),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Starfall Castle',
      tags: [CardTag.BUILDING, CardTag.PERMANENT],
      // Add 1 to the purge number (a purge 8 becomes a purge 9)
      passives: [{ id: '305-2-1', type: PassiveType.ADJUST_PURGE, amount: 1 }],
    },
  ],
};
