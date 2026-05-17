import { ActionEffectType, CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const sawMill: CardDef = {
  id: 85,
  name: 'Saw Mill',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Saw Mill',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/33e02052-9238-464a-b0b2-0d382f1f9671/450x%3Cauto%3E_so',
      glory: { amount: 3 },
      productions: [{ [ResourceType.WOOD]: 3 }],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.WOOD]: 3 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Wood Industry',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/9a4d5554-0ade-4dc8-8458-4d8f9af3c513/450x%3Cauto%3E_so',
      tags: [CardTag.BUILDING],
      glory: { amount: 3 },
      productions: [{ [ResourceType.WOOD]: 4 }],
      actions: [
        {
          id: '85-2-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [91],
              },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Wood Export',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/bf22e559-972b-4261-93d7-1de238ac3586/450x%3Cauto%3E_so',
      tags: [CardTag.BUILDING],
      glory: { amount: 4 },
      productions: [{ [ResourceType.GOODS]: 2 }],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.GOLD]: 4 }],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Wood Shipment',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/90d55c8e-e16d-4761-842e-6ddcb9fa0472/450x%3Cauto%3E_so',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      glory: { amount: 6 },
      productions: [{ [ResourceType.WOOD]: 2 }, { [ResourceType.GOODS]: 2 }],
      passives: [
        CardPassives[PassiveType.STAY_IN_PLAY],
        {
          id: '85-4-1',
          type: PassiveType.RESOURCE_EQUIVALENCE,
          resources: {
            [ResourceType.WOOD]: 1,
            [ResourceType.GOODS]: 1,
          },
        },
      ],
    },
  ],
};
