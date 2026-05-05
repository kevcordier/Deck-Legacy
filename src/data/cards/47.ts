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

export const plague: CardDef = {
  id: 47,
  name: 'Plague',
  states: [
    {
      id: 1,
      name: 'Plague',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/cc470830-9713-4645-a665-57af495f5009/anim=false,width=450,optimized=true/1833339934731181DE4503C0B9B24912ECD7C31F74CE592F4DAE2CA4B3CE342F.jpeg',
      negative: true,
      glory: {
        amount: -2,
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '47_1_1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                tags: [CardTag.PERSON],
                scope: [TargetScope.DISCARD],
                pickNumber: 2,
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
          id: '47_2_1',
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
          id: '47_2_2',
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
          id: '47_2_3',
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
