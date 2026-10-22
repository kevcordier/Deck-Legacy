import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Pilgrim / Gargoyle Statue (Foundations 68): a side chosen when discovered. */
export const pilgrim: CardDef = {
  id: 241,
  name: 'Pilgrim',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Pilgrim',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '241-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.SELF] },
                },
                {
                  id: 2,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], pickNumber: 1 },
                },
              ],
            },
          ],
        },
        {
          id: '241-1-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], tags: [CardTag.LAND], pickNumber: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Gargoyle Statue',
      tags: [CardTag.ITEM],
      glory: { amount: 3 },
      actions: [
        {
          id: '241-2-1',
          cost: { discard: [{ tags: [CardTag.BUILDING], pickMin: 1, pickMax: 99 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { choice: [{ any: 1 }] },
              repeat: 'valuePerElement',
              valuePerElement: { amount: 1, cards: { scope: [TargetScope.DISCARDED] } },
            },
          ],
        },
      ],
    },
  ],
};
