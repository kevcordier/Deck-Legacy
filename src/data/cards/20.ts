import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const volcanicEruption: CardDef = {
  id: 20,
  name: 'Volcanic Eruption',
  states: [
    {
      id: 1,
      name: 'Volcanic Eruption',
      negative: true,
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c0a9fb7a-78c2-452f-a2f4-947f4c527cd8/anim=false,width=450,optimized=true/38CERAJFMBW55EYDDDX8W2T1M0.jpeg',
      passives: [
        {
          id: '20-1-1',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            id: '20-1-1',
            type: Trigger.ON_PLAY,
            cards: {
              scope: [TargetScope.DRAWN],
              tags: [CardTag.LAND],
            },
            actions: [
              {
                id: 1,
                type: ActionEffectType.DESTROY_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.TRIGGER_SOURCE],
                },
                states: { ids: [2] },
              },
            ],
          },
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
          id: '20-3-1',
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
