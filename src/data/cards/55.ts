import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const tornado: CardDef = {
  id: 55,
  name: 'Tornado',
  states: [
    {
      id: 1,
      name: 'Tornado',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/581202d4-4c9e-4772-90fc-fce22749a21b/anim=false,width=450,optimized=true/1DFABB2D505230C0DADD5A5718407D050DFC239E337870877F1A23282D62D558.jpeg',
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '55-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                pickNumber: 3,
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
      name: 'Flooding',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/fe2772cd-e681-48b6-94a9-ece26ac1893c/anim=false,width=450,optimized=true/54CE752DC5EE04A3A89C421AFA0027FB37514F468D5982A63A8EC401B0C29E01.jpeg',
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '55-2-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING],
                pickMin: 5,
              },
            },
          ],
        },
        {
          id: '55-2-2',
          trigger: Trigger.END_OF_ROUND,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 4,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 3,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: {
                    scope: [TargetScope.BLOCKED_BY_THIS],
                    tags: [CardTag.BUILDING],
                  },
                },
                {
                  id: 6,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: {
                    scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                    pickNumber: 2,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
