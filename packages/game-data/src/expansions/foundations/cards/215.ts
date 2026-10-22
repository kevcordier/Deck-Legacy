import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const markBox = {
  id: 1,
  type: ActionEffectType.TRACK_ADVANCE,
  cards: { scope: [TargetScope.SELF] },
};

/** Earthquake / Mystical Fog (Foundations 42). */
export const earthquake: CardDef = {
  id: 215,
  name: 'Earthquake',
  states: [
    {
      id: 1,
      name: 'Earthquake',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '215-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                { id: 1, type: ActionEffectType.END_TURN },
                {
                  id: 2,
                  type: ActionEffectType.SEQUENCE,
                  effects: [
                    {
                      id: 1,
                      type: ActionEffectType.DESTROY_CARD,
                      cards: {
                        scope: [TargetScope.ANY],
                        tags: [CardTag.BUILDING],
                        fullyUpgraded: true,
                        pickNumber: 1,
                      },
                    },
                    flipTo(2, 2),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Mystical Fog',
      tags: [CardTag.EVENT, CardTag.PERMANENT],
      negative: true,
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6].map(id => ({ id })) },
      actions: [
        {
          id: '215-2-1',
          trigger: Trigger.START_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 1 },
            },
          ],
        },
        {
          id: '215-2-2',
          endsTurn: true,
          cost: { discard: [{ tags: [CardTag.MAGE], pickNumber: 1 }] },
          actionEffects: [markBox],
        },
        { id: '215-2-3', trigger: Trigger.END_OF_ROUND, actionEffects: [markBox] },
        { id: '215-2-4', trigger: Trigger.ON_TRACK_END, actionEffects: [destroySelf(1)] },
      ],
    },
  ],
};
