import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const raid: CardDef = {
  id: 116,
  name: 'Raid',
  states: [
    {
      id: 1,
      name: 'Raid',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/83621fed-b9f4-4c52-85bd-16907fceecbc/450x%3Cauto%3E_so_hm',
      actions: [
        {
          id: '116-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
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
                weapon: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Looting',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/97e6bffd-60a3-4597-b19e-c2b39d2c2520/450x%3Cauto%3E_so',
      actions: [
        {
          id: '116-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
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
                weapon: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Pillaging',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/0016c3ca-71d8-4dba-99c4-1fcf29b4da6b/450x%3Cauto%3E_so',
      glory: { amount: 3 },
      actions: [
        {
          id: '116-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
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
                weapon: 5,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Plundering',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4840fa0b-1410-4f29-9556-2ddb5de024a0/450x%3Cauto%3E_so',
      glory: { amount: 5 },
      actions: [
        {
          id: '116-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
              },
            },
            {
              id: 3,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { goods: 1 },
                  { weapon: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
