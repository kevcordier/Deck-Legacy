import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const barn: CardDef = {
  id: 94,
  name: 'Barn',
  states: [
    {
      id: 1,
      name: 'Barn',
      tags: [CardTag.BUILDING],
      illustration: 'cards/94_1.jpg',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: {
            resources: [{ wood: 3 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Large Barn',
      tags: [CardTag.BUILDING],
      illustration: 'cards/94_2.jpg',
      productions: [{ gold: 1 }, { wood: 1 }],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [{ wood: 6 }],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Countryside',
      tags: [CardTag.LAND],
      illustration: 'cards/94_3.jpg',
      productions: [{ gold: 1, wood: 1 }],
      glory: { amount: 3 },
      actions: [
        {
          id: '94-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              deck: 'draw',
              position: 'bottom',
              cards: {
                scope: [TargetScope.BOARD],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [{ wood: 6 }],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Thriving Countryside',
      tags: [CardTag.LAND],
      illustration: 'cards/94_4.jpg',
      productions: [{ gold: 2, wood: 1 }],
      glory: { amount: 5 },
      actions: [
        {
          id: '94-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              deck: 'draw',
              position: 'bottom',
              cards: {
                scope: [TargetScope.BOARD, TargetScope.DISCARD],
              },
            },
          ],
        },
      ],
    },
  ],
};
