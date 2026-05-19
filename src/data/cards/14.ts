import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const lake: CardDef = {
  id: 14,
  name: 'Lake',
  states: [
    {
      id: 1,
      name: 'Lake',
      tags: [CardTag.LAND],
      illustration: 'cards/14_1.jpg',
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
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 2,
      name: "Fisherman's Cabin",
      tags: [CardTag.BUILDING],
      illustration: 'cards/14_2.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 1 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Fishing Boat',
      tags: [CardTag.SEAFARING],
      illustration: 'cards/14_3.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      glory: { amount: 1 },
      actions: [
        {
          id: '14-3-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [75],
              },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Lighthouse',
      tags: [CardTag.BUILDING],
      illustration: 'cards/14_4.jpg',
      glory: { amount: 5 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '14-4-1',
          unlimited: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DECK],
              },
            },
          ],
        },
      ],
    },
  ],
};
