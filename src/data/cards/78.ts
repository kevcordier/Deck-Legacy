import { ActionEffectType, CardTag, ResourceType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const treasureHunt: CardDef = {
  id: 78,
  name: 'Treasure Hunt',
  states: [
    {
      id: 1,
      name: 'Treasure Hunt',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/5073c53a-42eb-4047-8471-28f99fa720ae/450x%3Cauto%3E_so',
      tags: [CardTag.SEAFARING],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Pirate Cove',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/5e6b4b00-50f9-4d66-a2e7-94a331a32ddd/450x%3Cauto%3E_so',
      actions: [
        {
          id: '78-2-1',
          trigger: Trigger.END_OF_TURN,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [94],
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
                [ResourceType.WEAPON]: 1,
                [ResourceType.IRON]: 1,
              },
            ],
            discard: [
              {
                pickNumber: 2,
                tags: [CardTag.PERSON],
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Treasure Map',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f676f0c5-9ddf-43b2-888d-49b462f1fe0c/450x%3Cauto%3E_so',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 5 },
      upgrade: [
        {
          cost: {
            discard: [
              {
                pickNumber: 2,
                tags: [CardTag.SEAFARING],
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Pirate Treasure',
      tags: [CardTag.ITEM, CardTag.LOOT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/b9801fa1-e4c1-47d8-997b-425b5dde9c12/450x%3Cauto%3E_so',
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      glory: { amount: 15 },
    },
  ],
};
