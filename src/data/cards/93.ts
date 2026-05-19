import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallGuild: CardDef = {
  id: 93,
  name: 'Small Guild',
  states: [
    {
      id: 1,
      name: 'Small Guild',
      tags: [CardTag.BUILDING],
      illustration: 'cards/93_1.jpg',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: {
            resources: [{ wood: 2 }],
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON] }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Guild',
      tags: [CardTag.BUILDING],
      illustration: 'cards/93_2.jpg',
      productions: [{ gold: 1 }, { wood: 1 }],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [{ stone: 2 }],
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 2 }],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Guild Hall',
      tags: [CardTag.BUILDING],
      illustration: 'cards/93_3.jpg',
      productions: [{ gold: 1 }, { wood: 1 }, { stone: 1 }],
      glory: { amount: 3 },
      upgrade: [
        {
          cost: {
            resources: [{ stone: 4 }],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Grand Guild Hall',
      tags: [CardTag.BUILDING],
      illustration: 'cards/93_4.jpg',
      productions: [{ gold: 1, wood: 1, stone: 1 }],
      glory: { amount: 0, emptyValues: 3 },
      actions: [
        {
          id: '93-4-1',
          cost: { discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickMin: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: {
                amount: 1,
                cards: { scope: [TargetScope.DISCARDED] },
              },
            },
          ],
        },
      ],
    },
  ],
};
