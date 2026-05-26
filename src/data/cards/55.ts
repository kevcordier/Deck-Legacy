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
      illustration: 'cards/55_1.jpg',
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
                scope: [
                  TargetScope.DISCARD,
                  TargetScope.BOARD,
                  TargetScope.DRAWN,
                  TargetScope.FRIENDLY,
                ],
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
      illustration: 'cards/55_2.jpg',
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '55-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING],
                pickNumber: 5,
              },
            },
          ],
        },
        {
          id: '55-2-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: {
                    scope: [TargetScope.BLOCKED_BY_THIS, TargetScope.BOARD],
                  },
                },
                {
                  id: 2,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: {
                    scope: [
                      TargetScope.DISCARD,
                      TargetScope.BOARD,
                      TargetScope.DRAWN,
                      TargetScope.FRIENDLY,
                    ],
                    pickNumber: 2,
                  },
                },
              ],
            },
            {
              id: 2,
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
