import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const buildingDiscarded: CardSelector = {
  scope: [TargetScope.DISCARDED],
  tags: [CardTag.BUILDING],
};

/** Church Bells / Eager Custodian (Foundations 67): a side chosen when discovered. */
export const churchBells: CardDef = {
  id: 240,
  name: 'Church Bells',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Church Bells',
      tags: [CardTag.ITEM],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '240-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DECK], tags: [CardTag.PERSON], pickMin: 0, pickMax: 2 },
            },
            { id: 2, type: ActionEffectType.SHUFFLE_DECK },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Eager Custodian',
      tags: [CardTag.PERSON],
      actions: [
        {
          // The building comes back into play and this is discarded in its place.
          id: '240-2-1',
          trigger: Trigger.ON_DISCARD,
          optional: true,
          triggeredBy: buildingDiscarded,
          condition: { type: 'cardCount', cards: buildingDiscarded, min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { ...buildingDiscarded, pickNumber: 1 },
            },
            { id: 2, type: ActionEffectType.DISCARD_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
