import { CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const townBorder: CardDef = {
  id: 113,
  name: 'Town Border',
  states: [
    {
      id: 1,
      name: 'Town Border',
      tags: [CardTag.LAND],
      illustration: 'cards/113_1.jpg',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: { resources: [{ wood: 3, gold: 1 }] },
          upgradeTo: 2,
        },
        {
          cost: { resources: [{ stone: 4 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Watchtower',
      illustration: 'cards/113_2.jpg',
      tags: [CardTag.BUILDING],
      productions: [{ weapon: 1 }],
      glory: { amount: 4 },
      passives: [
        {
          id: '113-2-1',
          type: PassiveType.SET_GAME_PARAMETER,
          parameters: {
            displayedDrawDeckCards: 2,
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Inner Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/113_3.jpg',
      productions: [{ weapon: 1 }],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      upgrade: [
        {
          cost: { resources: [{ stone: 4, wood: 2 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Double Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/113_4.jpg',
      productions: [{ weapon: 2 }],
      glory: {
        valuePerElement: {
          amount: 4,
          cards: { tags: [CardTag.WALL], scope: [TargetScope.ANY, TargetScope.SELF] },
        },
        amount: 0,
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
