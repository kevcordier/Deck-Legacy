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
      illustration: 'cards/116_1.jpg',
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
      illustration: 'cards/116_2.jpg',
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
              repeat: 2,
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
      illustration: 'cards/116_3.jpg',
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
              repeat: 2,
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
      illustration: 'cards/116_4.jpg',
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
              repeat: 3,
            },
          ],
        },
      ],
    },
  ],
};
