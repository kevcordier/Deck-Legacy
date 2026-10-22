import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, GOODS } = ResourceType;

/** Young Painter (Foundations 114): becomes Michelangelo. */
export const youngPainter: CardDef = {
  id: 287,
  name: 'Young Painter',
  states: [
    {
      id: 1,
      name: 'Young Painter',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '287-1-1',
          cost: { resources: [{ [GOLD]: 1 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [GOODS]: 1 } },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [GOODS]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Painter',
      tags: [CardTag.PERSON],
      productions: [{ [GOODS]: 1 }],
      upgrade: [{ cost: { resources: [{ [GOODS]: 4 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Michelangelo',
      tags: [CardTag.PERSON],
      productions: [{ [GOODS]: 2 }],
      glory: { amount: 7 },
      actions: [
        {
          id: '287-3-1',
          endsTurn: true,
          cost: { resources: [{ [GOODS]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.ANY],
                tags: [CardTag.BUILDING],
                withoutStickerIds: [10],
                pickNumber: 1,
              },
              stickers: { ids: [10] },
            },
          ],
        },
      ],
    },
  ],
};
