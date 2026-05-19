import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const distantMountain: CardDef = {
  id: 2,
  name: 'Distant Mountain',
  states: [
    {
      id: 1,
      name: 'Distant Mountain',
      tags: [CardTag.LAND],
      illustration: 'cards/2_1.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Rocky Area',
      tags: [CardTag.LAND],
      illustration: 'cards/2_2.jpg',
      actions: [
        {
          id: '2-2-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.STONE]: 2,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
      productions: [
        {
          [ResourceType.STONE]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Quarry',
      tags: [CardTag.LAND],
      illustration: 'cards/2_3.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.STONE]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Shallow Mine',
      tags: [CardTag.LAND],
      illustration: 'cards/2_4.jpg',
      glory: { amount: 3 },
      actions: [
        {
          id: '2-4-1',
          cost: {
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [84, 85] },
            },
          ],
        },
      ],
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 1,
        },
      ],
    },
  ],
};
