import { quest } from './quest';
import { SCARVES } from './romanceConstants';
import { RESOURCE_STICKERS } from './scienceConstants';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const PINK = SCARVES[2];
const GREEN_BOXES = [1, 2, 3, 4, 5];
const herKnightInPlay: CardSelector = {
  scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
  stickerIds: [PINK],
};
const herKnightPlayed: CardSelector = { scope: [TargetScope.DRAWN], stickerIds: [PINK] };
const herKnightInDiscard: CardSelector = { scope: [TargetScope.DISCARD], stickerIds: [PINK] };

/** "If in play with her knight, destroy both." */
const destroyBoth: ActionEffect[] = [
  { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { ...herKnightInPlay, autoPick: true } },
  { id: 2, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
];

/** Lost in the Wild / Isolde (Foundations 101): the pink scarf. */
export const isolde: CardDef = {
  id: 274,
  name: 'Lost in the Wild',
  states: [
    quest({
      cardId: 274,
      name: 'Lost in the Wild',
      tasks: GREEN_BOXES.map(id => ({ id })),
      taskAction: {
        cost: {
          discard: [
            { tags: [CardTag.LAND], pickNumber: 1 },
            { tags: [CardTag.KNIGHT], pickNumber: 1 },
          ],
        },
        condition: { type: 'not', condition: { type: 'stepsMarked', ids: GREEN_BOXES } },
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.TRACK_ADVANCE,
            cards: { scope: [TargetScope.SELF] },
            steps: { pickNumber: 1, ids: GREEN_BOXES },
          },
        ],
      },
      timer: [11, 12, 13],
      rescue: { condition: { type: 'stepsMarked', ids: GREEN_BOXES } },
      scarf: PINK,
    }),
    {
      id: 2,
      name: 'Isolde',
      tags: [CardTag.PERSON, CardTag.LADY, CardTag.SCARF],
      glory: { amount: 13 },
      actions: [
        {
          id: '274-2-1',
          trigger: Trigger.ON_PLAY,
          condition: { type: 'cardCount', cards: herKnightInPlay, min: 1 },
          actionEffects: destroyBoth,
        },
        {
          // Her knight played while she is in play
          id: '274-2-2',
          trigger: Trigger.ON_PLAY,
          triggeredBy: herKnightPlayed,
          condition: {
            type: 'and',
            conditions: [
              { type: 'not', condition: { type: 'justPlayed' } },
              { type: 'cardCount', cards: herKnightPlayed, min: 1 },
            ],
          },
          actionEffects: destroyBoth,
        },
        {
          id: '274-2-3',
          condition: { type: 'cardCount', cards: herKnightInDiscard, min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: { ...herKnightInDiscard, pickNumber: 1 },
              stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
