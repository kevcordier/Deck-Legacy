import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const assassin: CardDef = {
  id: 48,
  name: 'Assassin',
  states: [
    {
      id: 1,
      name: 'Assassin',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a34eebe4-d52c-4f21-811c-688ff14c440b/anim=false,width=450,optimized=true/J48J5DR9Z0YSGWZYXZHYJGXKV0.jpeg',
      passives: [
        {
          id: '1',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            type: Trigger.ON_PLAY,
            cards: {
              scope: [TargetScope.DRAWN],
              tags: [CardTag.PERSON],
            },
            actions: [
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.TRIGGER_SOURCE],
                },
                states: [2],
              },
            ],
          },
        },
      ],
      actions: [
        {
          id: '48_2_3',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [2],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Enemy soldier',
      tags: [CardTag.ENEMY],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3361d0f0-6e63-4aed-b043-1651218b5aac/anim=false,width=450,optimized=true/generator_import_1774550952553_7.jpeg',
      negative: true,
      glory: {
        amount: -2,
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '48_2_1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING, CardTag.LAND],
              },
            },
          ],
        },
        {
          id: '48_2_2',
          trigger: Trigger.END_OF_ROUND,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.BLOCKED],
              },
            },
          ],
        },
        {
          id: '48_2_3',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
    },
  ],
};
