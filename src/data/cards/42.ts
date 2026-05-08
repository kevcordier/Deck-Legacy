import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const magistrate: CardDef = {
  id: 42,
  name: 'Magistrate',
  states: [
    {
      id: 1,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/5cec5072-bff2-4680-83c3-831ac4f5150d/450x%3Cauto%3E_so',
      actions: [
        {
          id: '42-1-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [130],
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
                stone: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/98da4eac-3b68-473f-b10e-5a9ebac9a36a/450x%3Cauto%3E_so',
      actions: [
        {
          id: '42-2-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [131],
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
                stone: 2,
                iron: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      glory: { amount: 2 },
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/b47eee3b-c2f7-48b5-bd6c-1443f443bcfc/450x%3Cauto%3E_so',
      actions: [
        {
          id: '42-3-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [132],
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
                stone: 3,
                iron: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Strategist',
      tags: [CardTag.PERSON, CardTag.ELDER],
      glory: { amount: 5 },
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/8d0b0262-520d-4800-a4e4-83eb9d90daf1/450x%3Cauto%3E_so',
      actions: [
        {
          id: '42-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.KNIGHT, CardTag.WALL],
              },
            },
          ],
        },
      ],
    },
  ],
};
