import { CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const westCanyon: CardDef = {
  id: 61,
  name: 'West Canyon',
  states: [
    {
      id: 1,
      name: 'West Canyon',
      tags: [CardTag.LAND],
      illustration: 'cards/61_1.jpg',
      productions: [
        {
          stone: 1,
        },
        {
          iron: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                stone: 1,
                iron: 1,
                gold: 1,
                wood: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                stone: 3,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 2,
      name: 'Miners',
      tags: [CardTag.PERSON],
      illustration: 'cards/61_2.jpg',
      glory: { amount: 2 },
      productions: [
        {
          stone: 1,
          iron: 1,
        },
      ],
      passives: [
        {
          id: '61-2-1',
          type: PassiveType.COUNT_AS_2,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                weapon: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Forced Labor',
      tags: [CardTag.STATE],
      illustration: 'cards/61_3.jpg',
      glory: { amount: -3 },
      productions: [
        {
          stone: 2,
          iron: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/61_4.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
