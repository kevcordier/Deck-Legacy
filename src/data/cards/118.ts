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
      illustration: 'cards/118_1.jpg',
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
      illustration: 'cards/118_2.jpg',
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
      illustration: 'cards/118_3.jpg',
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
      illustration: 'cards/118_4.jpg',
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
