import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const cooperation: CardDef = {
  id: 67,
  name: 'Cooperation',
  states: [
    {
      id: 1,
      name: 'Cooperation',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e8e410b5-e9da-4c1d-94ab-218bcfa51609/anim=false,width=450,optimized=true/01122-2373283931.jpeg',
      tags: [CardTag.EVENT],
      actions: [
        {
          id: '67-1-1',
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickNumber: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
            {
              id: 3,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
            {
              id: 4,
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
      name: 'Favor',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/56f58644-40b9-49da-8f03-bd977c2aebf5/450x%3Cauto%3E_so',
      tags: [CardTag.EVENT],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '67-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
