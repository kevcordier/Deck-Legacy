import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** City Ablaze (Foundations 27, 29): blocks every building in play, also those played later. */
export const cityAblaze: CardDef = {
  id: 200,
  name: 'City Ablaze',
  states: [
    {
      id: 1,
      name: 'City Ablaze',
      tags: [CardTag.EVENT],
      negative: true,
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '200-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.BUILDING], autoPick: true },
            },
          ],
        },
        {
          id: '200-1-2',
          trigger: Trigger.ON_PLAY,
          triggeredBy: { scope: [TargetScope.DRAWN], tags: [CardTag.BUILDING] },
          condition: { type: 'not', condition: { type: 'justPlayed' } },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.DRAWN], tags: [CardTag.BUILDING], autoPick: true },
            },
          ],
        },
        {
          id: '200-1-3',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 4 },
                },
                {
                  id: 2,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: { scope: [TargetScope.BLOCKED_BY_THIS], pickNumber: 1 },
                },
              ],
            },
            { id: 2, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '200-1-4',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
