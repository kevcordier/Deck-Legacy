import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const lagoon: CardDef = {
  id: 64,
  name: 'Lagoon',
  states: [
    {
      id: 1,
      name: 'Lagoon',
      tags: [CardTag.LAND],
      illustration: 'cards/64_1.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
                [ResourceType.GOODS]: 1,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Raft',
      illustration: 'cards/64_2.jpg',
      tags: [CardTag.SEAFARING],
      upgrade: [
        {
          cost: {},
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 3,
      name: 'Sea Gate Wall',
      illustration: 'cards/64_3.jpg',
      tags: [CardTag.BUILDING, CardTag.WALL],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: {
        amount: 3,
      },
      actions: [
        {
          id: '64-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.SEAFARING],
                scope: [TargetScope.DISCARD],
              },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Lush Island',
      tags: [CardTag.LAND, CardTag.SEAFARING],
      illustration: 'cards/64_4.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
          [ResourceType.GOODS]: 1,
        },
      ],
      glory: {
        amount: 1,
      },
    },
  ],
};
