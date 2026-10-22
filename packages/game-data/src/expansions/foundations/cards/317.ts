import { RESOURCE_STICKERS } from './scienceConstants';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef, Condition } from '@deck-legacy/engine/domain/types';

const IRRIGATION = 335;
const BOOSTED = [1, 2, 6];

/** The card is in play (its sticker effects do not fire again once it is discarded). */
const inPlay: Condition = {
  type: 'cardCount',
  cards: {
    ids: [IRRIGATION],
    scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.SELF],
  },
  min: 1,
};

/** Irrigation / Mine Shaft (Foundations 144): a side chosen when discovered. */
export const irrigation: CardDef = {
  id: 317,
  name: 'Irrigation',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Irrigation',
      tags: [CardTag.LAND, CardTag.INVENTION],
      actions: [
        {
          // Whenever sticker gold / wood / goods is added here, discard to boost that production
          id: '317-1-1',
          trigger: Trigger.ON_STICKER_ADDED,
          condition: {
            type: 'and',
            conditions: [inPlay, { type: 'stickerAdded', ids: BOOSTED }],
          },
          actionEffects: [
            { id: 1, type: ActionEffectType.DISCARD_CARD, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.SELF] },
              stickers: { lastAdded: true, ids: BOOSTED, pickNumber: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Mine Shaft',
      tags: [CardTag.BUILDING, CardTag.INVENTION],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      actions: [
        {
          // When a resource sticker is added here, discard and mark 1 box to add any 1 here
          id: '317-2-1',
          trigger: Trigger.ON_STICKER_ADDED,
          condition: {
            type: 'and',
            conditions: [
              inPlay,
              { type: 'stickerAdded', ids: RESOURCE_STICKERS },
              {
                type: 'cardCount',
                cards: { ids: [IRRIGATION], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
                min: 1,
              },
            ],
          },
          actionEffects: [
            { id: 1, type: ActionEffectType.DISCARD_CARD, cards: { scope: [TargetScope.SELF] } },
            { id: 2, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 3,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.SELF] },
              stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
