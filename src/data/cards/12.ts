import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const eastCliffs: CardDef = {
  id: 12,
  name: 'East Cliffs',
  states: [
    {
      id: 1,
      name: 'East Cliffs',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0b355473-abc7-45b7-8454-f9fcc0767d43/width=450,quality=90/PRQ3CTSP15QFNGQN1ZYVTJ0DN0.jpeg',
      productions: [
        {
          [ResourceType.STONE]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Smithy',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0d3343df-4fde-4eee-b800-8520c07e5694/anim=false,width=450,optimized=true/84BDD954A876ACD8519A0A45EA0BE29BEC7220878410F61AB44D8EF5C0AB5425.jpeg',
      productions: [
        {
          [ResourceType.IRON]: 1,
        },
      ],
      glory: { amount: 1 },
      actions: [
        {
          id: '12-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [90],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [1],
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
                [ResourceType.IRON]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Arsenal',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/258b1df4-a27b-44e9-804b-938e4fbbfc2b/anim=false,width=450,optimized=true/1000019686.jpeg',
      productions: [
        {
          [ResourceType.IRON]: 1,
        },
      ],
      glory: { amount: 4 },
      actions: [
        {
          id: '12-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              valuePerElement: {
                amount: 1,
                resource: [ResourceType.WEAPON],
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.PERSON],
                },
              },
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
