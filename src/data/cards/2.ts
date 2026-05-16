import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const distantMountain: CardDef = {
  id: 2,
  name: 'Distant Mountain',
  states: [
    {
      id: 1,
      name: 'Distant Mountain',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4a52da24-b882-474b-acf9-9b8f1ae2bcf5/450x%3Cauto%3E_so',
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
      name: 'Rocky Area',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/91754d5e-54e3-40d3-942f-445a3724bde0/450x%3Cauto%3E_so',
      actions: [
        {
          id: '2-2-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.STONE]: 2,
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
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
      productions: [
        {
          [ResourceType.STONE]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Quarry',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/bb398332-8a0d-4a6f-9757-82ad98d69f24/width=450,quality=90/SNE1X41SFDY147PY0HN1068XE0?sig=CfDJ8J868rbHQQlNuTOL2qbAsuS8128hQnVA7sW5n5sZVPhGH2YDUXnnme4xI7TjGw-qRgzDiJBA--GXM99V3FTYUVvxCM8sYgmsLgYNWzOG2f0Ks2cQukChYnEmwwbmclxgcTESIbHGkrqYsnVk4hyTNjDBkAAtTgjAmzr9I_E8vHQgQBwB2aNWcUhFfCpF1xUDj5MWqDgUh78TN74N2O66lfXzlS8LHXLA7mt3j41ZbkWUZig-QR-e__koTOILBoV4C0aCtAuTke4fAJqBV04wKmFqo7rgpmvUNIeH-QDCGcJM&exp=2026-09-16T11:38:25.jpeg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.STONE]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Shallow Mine',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b4c3bd3b-0202-4f39-8c35-e329d17eb41d/width=450,quality=90/2026-02-05-125447_flux_0.jpeg',
      glory: { amount: 3 },
      actions: [
        {
          id: '2-4-1',
          cost: {
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [84, 85] },
            },
          ],
        },
      ],
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 1,
        },
      ],
    },
  ],
};
