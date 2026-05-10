import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const barn: CardDef = {
  id: 94,
  name: 'Barn',
  states: [
    {
      id: 1,
      name: 'Barn',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/5b8a13e0-9a18-42f7-907d-9bf2cf5e7ea6/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: {
            resources: [{ wood: 3 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Large Barn',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f2c82139-8253-45b5-83bf-a7eb9f371044/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }, { wood: 1 }],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [{ wood: 6 }],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Countryside',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4a04066b-d7e7-4d5b-9caa-3c69ce049689/450x%3Cauto%3E_so',
      productions: [{ gold: 1, wood: 1 }],
      glory: { amount: 3 },
      actions: [
        {
          id: '94-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              deck: 'draw',
              position: 'bottom',
              cards: {
                scope: [TargetScope.BOARD],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [{ wood: 6 }],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Thriving Countryside',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/13fd3cc7-b0c1-4fc6-b2a4-904fd2ed253d/450x%3Cauto%3E_so',
      productions: [{ gold: 2, wood: 1 }],
      glory: { amount: 5 },
      actions: [
        {
          id: '94-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              deck: 'draw',
              position: 'bottom',
              cards: {
                scope: [TargetScope.BOARD, TargetScope.DISCARD],
              },
            },
          ],
        },
      ],
    },
  ],
};
