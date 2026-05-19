import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const boulder: CardDef = {
  id: 110,
  name: 'Boulder',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Boulder',
      tags: [CardTag.LAND],
      illustration: 'cards/110_1.jpg',
      productions: [{ stone: 1 }],
      upgrade: [
        {
          cost: { resources: [{ iron: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Boulders',
      tags: [CardTag.LAND],
      illustration: 'cards/110_2.jpg',
      productions: [{ stone: 2 }],
      glory: { amount: 1 },
    },
    {
      id: 3,
      name: 'Mushrooms',
      tags: [CardTag.LAND],
      illustration: 'cards/110_3.jpg',
      productions: [{ goods: 1 }],
      upgrade: [
        {
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 2 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Mushrooms',
      tags: [CardTag.LAND],
      illustration: 'cards/110_4.jpg',
      productions: [{ goods: 1 }],
      actions: [
        {
          id: '110-4-1',
          unlimited: true,
          cost: { discard: [{ tags: [CardTag.PERSON] }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { goods: 2 },
            },
          ],
        },
      ],
    },
  ],
};
