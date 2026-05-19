import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const wildGrass: CardDef = {
  id: 1,
  name: 'Wild Grass',
  states: [
    {
      id: 1,
      name: 'Wild Grass',
      tags: [CardTag.LAND],
      illustration: 'cards/1_1.jpg',
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
      name: 'Plains',
      tags: [CardTag.LAND],
      illustration: 'cards/1_2.jpg',
      actions: [
        {
          id: '1-2-1',
          cost: {
            discard: [
              {
                scope: [TargetScope.FRIENDLY],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.GOLD]: 2,
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
          [ResourceType.GOLD]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Farmlands',
      tags: [CardTag.LAND],
      illustration: 'cards/1_3.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Food Barns',
      tags: [CardTag.BUILDING],
      illustration: 'cards/1_4.jpg',
      glory: { amount: 3 },
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
