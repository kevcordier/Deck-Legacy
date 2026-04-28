import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const lordAethan: CardDef = {
  id: 46,
  name: 'Lord Aethan',
  chooseState: true,
  states: [
    {
      id: 1,
      name: 'Lord Aethan',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/ea19c73f-5103-4e87-9135-ebba1530888f/anim=false,width=450,optimized=true/CAVVJ09KPSKPD10ERFWCBG9SF0.jpeg',
      glory: { amount: 2 },
      productions: [{ gold: 1, wood: 1, stone: 1 }],
      actions: [
        {
          id: '46-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [80],
              },
            },
          ],
        },
        {
          id: '46-1-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [81],
              },
            },
          ],
        },
        {
          id: '46-1-3',
          unlimited: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          {
            id: 1,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { gold: 2 },
              },
            ],
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { gold: 2 },
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { wood: 2 },
              },
            ],
          },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { wood: 2 },
              },
            ],
          },
          {
            id: 5,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { stone: 2 },
              },
            ],
          },
          {
            id: 6,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { goods: 1 },
              },
            ],
          },
          {
            id: 7,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { weapon: 1 },
              },
            ],
          },
          {
            id: 8,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { iron: 1 },
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Lord Nimrod',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f0c503a6-4b62-4870-9971-445a456b8a54/anim=false,width=450,optimized=true/00424-2217828578.jpeg',
      glory: { amount: 5 },
      productions: [{ weapon: 1 }],
      actions: [
        {
          id: '46-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [133, 134],
              },
              pickNumber: 2,
            },
          ],
        },
        {
          id: '46-2-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          {
            id: 9,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { gold: 2 },
              },
            ],
          },
          {
            id: 10,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { stone: 2 },
              },
            ],
          },
          {
            id: 11,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { iron: 2 },
              },
            ],
          },
          {
            id: 12,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { weapon: 2 },
              },
            ],
          },
          {
            id: 13,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { weapon: 2 },
              },
            ],
          },
          {
            id: 14,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { weapon: 3 },
              },
            ],
          },
          {
            id: 15,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { wood: 1 },
              },
            ],
          },
          {
            id: 16,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { iron: 1 },
              },
            ],
          },
        ],
      },
    },
  ],
};
