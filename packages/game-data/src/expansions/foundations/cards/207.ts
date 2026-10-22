import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** Bad Omen / Flooding (Foundations 34): the side is chosen when discovered, for good. */
export const badOmen: CardDef = {
  id: 207,
  name: 'Bad Omen',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Bad Omen',
      tags: [CardTag.GOAL, CardTag.OMEN, CardTag.PERMANENT],
      glory: {
        amount: 0,
        valuePerElement: { amount: -3, cards: { scope: [TargetScope.ANY, TargetScope.ENEMY] } },
      },
    },
    {
      id: 2,
      name: 'Flooding',
      tags: [CardTag.EVENT],
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '207-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.BUILDING], pickNumber: 5 },
            },
          ],
        },
        {
          // A building played while this is in play, 5 blocked buildings at most
          id: '207-2-2',
          trigger: Trigger.ON_PLAY,
          triggeredBy: { scope: [TargetScope.DRAWN], tags: [CardTag.BUILDING] },
          condition: {
            type: 'and',
            conditions: [
              { type: 'not', condition: { type: 'justPlayed' } },
              { type: 'cardCount', cards: { scope: [TargetScope.BLOCKED_BY_THIS] }, max: 4 },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.DRAWN], tags: [CardTag.BUILDING], pickNumber: 1 },
            },
          ],
        },
        {
          id: '207-2-3',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.SEQUENCE,
                  effects: [
                    {
                      id: 1,
                      type: ActionEffectType.DESTROY_CARD,
                      cards: { scope: [TargetScope.BLOCKED_BY_THIS], pickNumber: 1 },
                    },
                    {
                      id: 2,
                      type: ActionEffectType.DESTROY_CARD,
                      cards: { scope: [TargetScope.SELF] },
                    },
                  ],
                },
                {
                  id: 2,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: { scope: [TargetScope.ANY, TargetScope.FRIENDLY], pickNumber: 2 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
