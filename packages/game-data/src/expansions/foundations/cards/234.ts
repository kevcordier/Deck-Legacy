import { hasStepsLeft } from './hasStepsLeft';
import { SCIENCE_CARDS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Aerostats / Air Balloons (Foundations 61). */
export const aerostats: CardDef = {
  id: 234,
  name: 'Aerostats',
  states: [
    {
      id: 1,
      name: 'Aerostats',
      tags: [CardTag.INVENTION],
      productions: [{ [ResourceType.GOODS]: 2 }],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '234-1-1',
          condition: hasStepsLeft(SCIENCE_CARDS.aerostats),
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 1 },
              stickers: { ids: [6] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOODS]: 3, [ResourceType.GOLD]: 6 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Air Balloons',
      tags: [CardTag.INVENTION],
      productions: [{ [ResourceType.GOODS]: 2 }],
      glory: { amount: 6 },
      actions: [
        {
          // shortcut: the cards kept stay in their order; reordering needs its own screen
          id: '234-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { topOfDeck: 5, pickMin: 0, pickMax: 5 },
            },
          ],
        },
      ],
    },
  ],
};
