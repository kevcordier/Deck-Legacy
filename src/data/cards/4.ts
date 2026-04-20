import { ActionType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const headquarters: CardDef = {
  id: 4,
  name: 'Headquarters',
  states: [
    {
      id: 1,
      name: 'Headquarters',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5a04b232-0a88-4b5c-97ae-399aa109b3d4/width=450,quality=90/1P7KP4HEYR2NJQ5T54PVHXF4A0.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e33f38e6-50a1-45b8-832a-7d1c07d405cb/width=450,quality=90/5M4AR3T0ACAWE2Q7TEEK1ZFK80.jpeg',
      glory: 3,
      actions: [
        {
          id: '4-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.PLAY_CARD,
              cards: {
                tags: [CardTag.LAND],
                scope: TargetScope.DISCARD,
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/83d38c62-35ff-41e5-917c-df91b3b7c4e0/width=450,quality=90/9BBA545BFEBB64D6E822FBC2DBDBB43070FFC4E76475DAB0A070380A9A229A41.jpeg',
      glory: 7,
      actions: [
        {
          id: '4-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.PLAY_CARD,
              cards: {
                tags: [CardTag.LAND, CardTag.BUILDING],
                scope: TargetScope.DISCARD,
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/39e939dc-f7c2-449c-bbd5-2d3e33d5dc5e/width=450,quality=90/00049-2184064133.jpeg',
      glory: 12,
      actions: [
        {
          id: '4-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.PLAY_CARD,
              cards: {
                scope: TargetScope.DISCARD,
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
