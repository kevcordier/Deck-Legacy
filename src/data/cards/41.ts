import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const traveler: CardDef = {
  id: 41,
  name: 'Traveller',
  states: [
    {
      id: 1,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/a6cb6d65-ae66-489a-a393-cf5933d72d09/450x%3Cauto%3E_so',
      actions: [
        {
          id: '41-1-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [126],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 2,
          cost: {
            resources: [
              {
                goods: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/fe9474c2-3883-4f82-8917-9e843df01e2a/450x%3Cauto%3E_so',
      actions: [
        {
          id: '41-2-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [127],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 3,
          cost: {
            resources: [
              {
                goods: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f10bdf41-55fd-46e3-bb5e-2eeaf2b7a59e/450x%3Cauto%3E_so',
      actions: [
        {
          id: '41-3-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [128],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 4,
          cost: {
            resources: [
              {
                goods: 5,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      glory: { amount: 2 },
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/81e55ee1-a93c-46ef-ab17-23ebfd1b2003/450x%3Cauto%3E_so',
      actions: [
        {
          id: '41-4-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [129],
              },
            },
          ],
        },
        {
          id: '41-4-2',
          cost: {
            discard: [
              {
                tags: [CardTag.LAND],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                gold: 1,
                wood: 1,
                stone: 1,
                weapon: 1,
                goods: 1,
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                gold: 1,
                wood: 1,
                stone: 1,
                weapon: 1,
                goods: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
