import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { WOOD, IRON, GOODS, SCIENCE } = ResourceType;
const EVENT = [CardTag.EVENT];

/** Stage Preparations (Foundations 146): Performance, Forbidden Knowledge, Shut Down. */
export const stagePreparations: CardDef = {
  id: 319,
  name: 'Stage Preparations',
  states: [
    {
      id: 1,
      name: 'Stage Preparations',
      tags: EVENT,
      upgrade: [{ cost: { resources: [{ [WOOD]: 2, [IRON]: 3 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Performance',
      tags: EVENT,
      actions: [
        {
          // Discard up to 5 persons to look at that many next undiscovered cards: re-arrange, destroy 1
          id: '319-2-1',
          cost: { discard: [{ tags: [CardTag.PERSON], pickMin: 1, pickMax: 5 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ORDER_CARDS,
              valuePerElement: { amount: 1, cards: { scope: [TargetScope.DISCARDED] } },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [SCIENCE]: 4 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Forbidden Knowledge',
      tags: EVENT,
      actions: [
        {
          id: '319-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                scope: [TargetScope.BOX],
                withoutTags: [CardTag.PERMANENT],
                firstOnly: true,
              },
            },
            flipTo(2, 4),
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Shut Down',
      tags: EVENT,
      negative: true,
      actions: [
        {
          id: '319-4-1',
          cost: { resources: [{ [GOODS]: 2 }] },
          actionEffects: [flipTo(1, 1)],
        },
      ],
    },
  ],
};
