import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const farField: CardDef = {
  id: 53,
  name: 'Far Field',
  states: [
    {
      id: 1,
      name: 'Far Field',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/15bd8f4b-4902-4f28-8412-d8dee8ecc885/anim=false,width=450,optimized=true/00023-1054815488.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Inn',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/813f44b3-0bfd-480b-9b86-ce6295480cca/anim=false,width=450,optimized=true/00614-2353157717.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 6,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 3,
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
    {
      id: 4,
      name: 'Innkeeper',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f492dee9-5b14-4e22-ac84-4ec5dfe2a153/anim=false,width=450,optimized=true/C57CDE16AEBCE06DFDDBF8096F8A830104BF5BD412F69716117A14C05E0AF49C.jpeg',
      glory: { amount: 3 },
      actions: [
        {
          id: '53-4-1',
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { [ResourceType.GOLD]: 1 },
                  { [ResourceType.WOOD]: 1 },
                  { [ResourceType.STONE]: 1 },
                  { [ResourceType.IRON]: 1 },
                  { [ResourceType.WEAPON]: 1 },
                  { [ResourceType.GOODS]: 1 },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { [ResourceType.GOLD]: 1 },
                  { [ResourceType.WOOD]: 1 },
                  { [ResourceType.STONE]: 1 },
                  { [ResourceType.IRON]: 1 },
                  { [ResourceType.WEAPON]: 1 },
                  { [ResourceType.GOODS]: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
