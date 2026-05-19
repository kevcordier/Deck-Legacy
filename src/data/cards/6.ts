import { ActionEffectType, CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const jungle: CardDef = {
  id: 6,
  name: 'Jungle',
  states: [
    {
      id: 1,
      name: 'Jungle',
      tags: [CardTag.LAND],
      illustration: 'cards/6_1.jpg',
      actions: [
        {
          id: '6-1-1',
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
                [ResourceType.WOOD]: 1,
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Huge Trees',
      tags: [CardTag.LAND],
      illustration: 'cards/6_2.jpg',
      actions: [
        {
          id: '6-2-1',
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
                [ResourceType.WOOD]: 2,
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
      productions: [
        {
          [ResourceType.WOOD]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Deep Jungle',
      tags: [CardTag.LAND],
      illustration: 'cards/6_3.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.WOOD]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Treehouses',
      tags: [CardTag.BUILDING],
      illustration: 'cards/6_4.jpg',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOLD]: 1,
          [ResourceType.WOOD]: 2,
        },
      ],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
