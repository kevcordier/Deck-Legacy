import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const headquarters: CardDef = {
  id: 4,
  name: 'Headquarters',
  states: [
    {
      id: 1,
      name: 'Headquarters',
      tags: [CardTag.BUILDING],
      illustration: 'cards/4_1.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
                [ResourceType.WOOD]: 1,
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
      name: 'Town Hall',
      tags: [CardTag.BUILDING],
      illustration: 'cards/4_2.jpg',
      glory: { amount: 3 },
      actions: [
        {
          id: '4-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.LAND],
                scope: [TargetScope.DISCARD],
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
                [ResourceType.STONE]: 4,
                [ResourceType.WOOD]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Keep',
      tags: [CardTag.BUILDING],
      illustration: 'cards/4_3.jpg',
      glory: { amount: 7 },
      actions: [
        {
          id: '4-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.LAND, CardTag.BUILDING],
                scope: [TargetScope.DISCARD],
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
                [ResourceType.STONE]: 6,
                [ResourceType.WOOD]: 2,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
    },
    {
      id: 4,
      name: 'Castle',
      tags: [CardTag.BUILDING],
      illustration: 'cards/4_4.jpg',
      glory: { amount: 12 },
      actions: [
        {
          id: '4-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                scope: [TargetScope.DISCARD],
              },
            },
          ],
        },
      ],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
    },
  ],
};
