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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/b886d51e-f8f8-4033-9637-614d27c96896/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/253e8e41-55ea-4d22-9938-d943ba104bb0/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/3df1ddad-1dac-4e69-93af-9e8f672dba4b/450x%3Cauto%3E_so',
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
