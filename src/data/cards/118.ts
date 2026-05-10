import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const borderingLands: CardDef = {
  id: 118,
  name: 'Bordering Lands',
  states: [
    {
      id: 1,
      name: 'Bordering Lands',
      tags: [CardTag.ENEMY, CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/5e13d03c-1a40-45d8-a2f8-c01119884362/450x%3Cauto%3E_so',
      negative: true,
      actions: [
        {
          id: '118-1-1',
          unlimited: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 4 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resources: { [ResourceType.WEAPON]: 1 },
              resourceScopes: ['upgradeCost'],
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WEAPON]: 10 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Occupation',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/fc71dceb-47d0-424b-920b-344eb30d4071/450x%3Cauto%3E_so',
      actions: [
        {
          id: '118-2-1',
          unlimited: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 4 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resources: { [ResourceType.WEAPON]: 1 },
              resourceScopes: ['upgradeCost'],
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WEAPON]: 9 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Unruly Towns',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/436e3391-0a84-4b5f-b0f6-01013431c0da/450x%3Cauto%3E_so',
      actions: [
        {
          id: '118-3-1',
          unlimited: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 4 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resources: { [ResourceType.WEAPON]: 1 },
              resourceScopes: ['upgradeCost'],
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
        {
          id: '118-3-2',
          trigger: Trigger.ON_UPGRADE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              value: 20,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WEAPON]: 8 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Vassal States',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/5e885504-de72-4cb6-a771-c261ed4311a5/450x%3Cauto%3E_so',
      glory: { amount: 0, emptyValues: 9 },
      actions: [
        {
          id: '118-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
