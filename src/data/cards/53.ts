import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const farField: CardDef = {
  id: 53,
  name: 'Far Field',
  states: [
    {
      id: 1,
      name: 'Far Field',
      tags: [CardTag.LAND],
      illustration: 'cards/53_1.jpg',
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
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
                [ResourceType.GOLD]: 2,
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
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Inn',
      tags: [CardTag.BUILDING],
      illustration: 'cards/53_2.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 6,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 3,
      name: 'Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/53_3.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
    {
      id: 4,
      name: 'Innkeeper',
      tags: [CardTag.PERSON],
      illustration: 'cards/53_4.jpg',
      glory: { amount: 3 },
      actions: [
        {
          id: '53-4-1',
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [{ any: 1 }],
              },
              repeat: 2,
            },
          ],
        },
      ],
    },
  ],
};
