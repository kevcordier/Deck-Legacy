import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const hotSpring: CardDef = {
  id: 112,
  name: 'Hot Spring',
  states: [
    {
      id: 1,
      name: 'Hot Springs',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/d48c648d-197d-427c-bfbc-a74bff279c18/450x%3Cauto%3E_so',
      actions: [
        {
          id: '112-1-1',
          trigger: Trigger.ON_UPGRADE,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [1], pickNumber: 1 },
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOLD]: 2, [ResourceType.STONE]: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Fountain',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/9f7694e2-59e4-4611-a898-e576c82a584e/450x%3Cauto%3E_so_hm',
      glory: { amount: 2 },
      actions: [
        {
          id: '112-2-1',
          trigger: Trigger.ON_UPGRADE,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BOOST_CARD,
              cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WOOD]: 2, [ResourceType.STONE]: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Canals',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/3cb50939-0553-49bb-99b8-694c1ba8c054/450x%3Cauto%3E_so',
      glory: { amount: 5 },
      actions: [
        {
          id: '112-3-1',
          trigger: Trigger.ON_UPGRADE,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [7], pickNumber: 1 },
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [{ cost: {}, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Sweet Water River',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/37c261e8-115d-46c7-8ffe-f9c64dff3624/450x%3Cauto%3E_so_hm',
      glory: { amount: 9 },
    },
  ],
};
