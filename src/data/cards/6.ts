import { ActionEffectType, CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const jungle: CardDef = {
  id: 6,
  name: 'Jungle',
  states: [
    {
      id: 1,
      name: 'Jungle',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d189302c-ea8e-444f-80ab-e64415e97789/anim=false,width=450,optimized=true/00312-841554700.jpeg',
      actions: [
        {
          id: '6-1-1',
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
                [ResourceType.WOOD]: 1,
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Huge Trees',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/56def3aa-dfb9-4cb8-66b9-a7832a433200/anim=false,width=450,optimized=true/311658.jpeg',
      actions: [
        {
          id: '6-2-1',
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
                [ResourceType.WOOD]: 2,
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
      productions: [
        {
          [ResourceType.WOOD]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Deep Jungle',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/9ca7a608-cd9a-4616-cad1-600e58b3ea00/450x%3Cauto%3E_so',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.WOOD]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Treehouses',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8ac9e087-8d36-49b6-8f02-9d422c10faa1/width=450,quality=90/00004-4001576903.jpeg',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOLD]: 1,
          [ResourceType.WOOD]: 2,
        },
      ],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
