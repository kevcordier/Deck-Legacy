import { flipTo } from './flipTo';
import { highestMarked } from './highestMarked';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const GROW_HOUSES = 330;
const GLORY = [5, 10, 15, 20, 30, 40, 50, 70];

/** Grow Houses (Foundations 139): becomes the Liberation. */
export const growHouses: CardDef = {
  id: 312,
  name: 'Grow Houses',
  states: [
    {
      id: 1,
      name: 'Grow Houses',
      tags: [CardTag.PERMANENT],
      ...highestMarked(GLORY, () => ({
        destroy: { tags: [CardTag.PERSON, CardTag.BUILDING, CardTag.LAND], pickNumber: 1 },
      })),
      actions: [
        {
          id: '312-1-1',
          endsTurn: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          // When complete, you may turn this
          id: '312-1-2',
          unlimited: true,
          condition: {
            type: 'cardCount',
            cards: { ids: [GROW_HOUSES], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
            max: 0,
          },
          actionEffects: [flipTo(1, 2)],
        },
      ],
    },
    {
      id: 2,
      name: 'Liberation',
      tags: [CardTag.PERMANENT],
      glory: { amount: 200 },
      actions: [
        {
          // End of round: destroy all cards of the kingdom with 6 or more production
          id: '312-2-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.ANY], having: { minProduction: 6 }, autoPick: true },
            },
          ],
        },
        {
          // When purged, destroy 2 negative cards that are not permanent
          id: '312-2-2',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [
                  TargetScope.DECK,
                  TargetScope.DISCARD,
                  TargetScope.BOARD,
                  TargetScope.ENEMY,
                ],
                pickNumber: 2,
              },
            },
          ],
        },
      ],
    },
  ],
};
