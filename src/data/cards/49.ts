import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const cityFire: CardDef = {
  id: 49,
  name: 'City Fire',
  states: [
    {
      id: 1,
      name: 'City Fire',
      tags: [CardTag.EVENT],
      negative: true,
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9c2e4545-c6f8-44c3-bf7e-ae4ef2200818/anim=false,width=450,optimized=true/7956D5CAAE8DF5A17204CE929425F0996278C18FDA11B7B5EBEB4BCCF3782D47.jpeg',
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '49-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                tags: [CardTag.BUILDING],
                scope: [TargetScope.DISCARD],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Ashlands',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/19b5f023-3004-486a-abc8-15d6ac466082/anim=false,width=450,optimized=true/TR74NQJ6BGPS2X7T51C9Q6FNJ0.jpeg',
      glory: { amount: -2 },
      upgrade: [
        {
          cost: { resources: [{ gold: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Young Forest',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/86f44a78-5253-43b3-0045-b513f59fc800/anim=false,width=450,optimized=true/312846.jpeg',
      actions: [
        {
          id: '49-3-1',
          endsTurn: true,
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
        inOrder: true,
        steps: [
          {
            id: 1,
            icon: '*',
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [2] },
              },
            ],
          },
          {
            id: 2,
          },
          {
            id: 3,
            icon: '*',
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [2] },
              },
            ],
          },
          {
            id: 4,
          },
          {
            id: 5,
            icon: '*',
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [2] },
              },
            ],
          },
        ],
      },
    },
  ],
};
