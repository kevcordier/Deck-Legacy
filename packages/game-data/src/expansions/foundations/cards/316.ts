import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { WOOD, IRON, GOODS, SCIENCE } = ResourceType;
const forEachBox = { amount: 1, markedSteps: true };

/** Simple Workshop (Foundations 143): becomes the Inventor Workshop. */
export const workshop: CardDef = {
  id: 316,
  name: 'Simple Workshop',
  states: [
    {
      id: 1,
      name: 'Simple Workshop',
      tags: [CardTag.BUILDING],
      productions: [{ [GOODS]: 1 }],
      upgrade: [{ cost: { resources: [{ [IRON]: 2, [WOOD]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Scientific Workshop',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 1, [GOODS]: 1 }],
      glory: { amount: 2 },
      upgrade: [{ cost: { resources: [{ [SCIENCE]: 2, [IRON]: 2, [WOOD]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Inventor Workshop',
      tags: [CardTag.BUILDING, CardTag.INVENTION],
      // 2 glory per invention: those in play while this is in play, otherwise the kingdom's
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 2,
          cards: {
            scope: [TargetScope.ANY, TargetScope.SELF],
            tags: [CardTag.INVENTION],
            inPlayWhenInPlay: true,
          },
        },
      },
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6, 7].map(id => ({ id })) },
      passives: [
        {
          // Counts as 1 more invention for each box
          id: '316-3-1',
          type: PassiveType.COUNT_AS,
          cards: { tags: [CardTag.INVENTION] },
          valuePerElement: forEachBox,
        },
      ],
      actions: [
        {
          id: '316-3-1',
          cost: {
            discard: [{ tags: [CardTag.PERSON], produces: [SCIENCE, GOODS], pickNumber: 1 }],
          },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
