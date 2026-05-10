import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const northPlains: CardDef = {
  id: 114,
  name: 'North Plains',
  states: [
    {
      id: 1,
      name: 'North Plains',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/d723d99f-3c78-4ec6-8815-320923b67aad/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }],
      upgrade: [
        { cost: { resources: [{ stone: 3, gold: 1 }] }, upgradeTo: 2 },
        { cost: { resources: [{ stone: 4 }] }, upgradeTo: 4 },
      ],
    },
    {
      id: 2,
      name: 'Moat',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/a56eb075-d2f3-4693-abfa-dd5de56f975c/450x%3Cauto%3E_so',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 2 },
      actions: [
        {
          id: '114-2-1',
          cost: { discard: [{ scope: [TargetScope.BOARD] }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { weapon: 2 },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ iron: 2, gold: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Moat Bridge',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/e09918e6-4587-4b82-a929-ea5adef3209c/450x%3Cauto%3E_so_hm',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '114-3-1',
          cost: { resources: [{ gold: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { tags: [CardTag.PERSON], scope: [TargetScope.DISCARD] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7aec4cb2-aa6e-4a92-8e4b-b447573d9cdf/anim=false,width=450,optimized=true/2570720676-1.jpeg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
