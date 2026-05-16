import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const manor: CardDef = {
  id: 95,
  name: 'Manor',
  states: [
    {
      id: 1,
      name: 'Manor',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/d8a1dc1f-c255-4fc8-b1c5-a911ba623d0e/450x%3Cauto%3E_so',
      productions: [{ gold: 6 }],
      actions: [
        {
          id: '95-1-1',
          trigger: Trigger.ON_PRODUCE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resources: { [ResourceType.GOLD]: 1 },
              resourceScopes: ['production'],
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WOOD]: 3 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Large Manor',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/3da3d65f-dc6d-4e2e-87b6-ed6ab5d8648e/450x%3Cauto%3E_so',
      productions: [{ gold: 6 }],
      actions: [
        {
          id: '95-2-1',
          trigger: Trigger.ON_PRODUCE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resources: { [ResourceType.GOLD]: 1 },
              resourceScopes: ['production'],
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.STONE]: 3 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Noble Residence',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/eba3e6ab-e555-4f1f-ae5a-4df71e74890c/450x%3Cauto%3E_so',
      productions: [{ gold: 6 }],
      actions: [
        {
          id: '95-3-1',
          trigger: Trigger.ON_PRODUCE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resources: { [ResourceType.GOLD]: 1 },
              resourceScopes: ['production'],
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.STONE]: 4 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Grand Residence',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/50acc3a7-5d3f-47ec-ca87-9bddf84eed00/450x%3Cauto%3E_so',
      glory: { amount: 5 },
      productions: [{ gold: 3 }],
      actions: [
        {
          id: '95-4-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [116] },
            },
          ],
        },
      ],
    },
  ],
};
