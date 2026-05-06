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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/04320a87-5b0d-4f19-871b-42b1982fdeee/450x%3Cauto%3E_so',
      tags: [CardTag.BUILDING],
      productions: [{ weapon: 1 }],
      glory: { amount: 4 },
      passives: [
        {
          id: 'set_game_parameter',
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
