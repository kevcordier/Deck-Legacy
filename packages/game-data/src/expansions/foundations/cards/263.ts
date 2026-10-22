import { KNIGHT, LADY, ROMANCE_CARDS } from './romanceConstants';
import { scienceGoal } from './scienceGoal';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const KNIGHTS_OR_LADIES = [CardTag.KNIGHT, CardTag.LADY];

/** "Discard knights or ladies and keep track of how many you have discarded." */
const discardForVirtue = (id: string): CardAction => ({
  id,
  unlimited: true,
  cost: { discard: [{ tags: KNIGHTS_OR_LADIES, pickMin: 1, pickMax: 99 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      value: 1,
      valuePerElement: { amount: 1, cards: { scope: [TargetScope.DISCARDED] } },
    },
  ],
});

const sticker = (stickerIds: number[], cards: ActionEffect['cards']): ActionEffect => ({
  id: 1,
  type: ActionEffectType.ADD_STICKER,
  cards: { scope: [TargetScope.ANY], ...cards },
  stickers: { ids: stickerIds, pickNumber: 1 },
});

/** "At any time": once, as soon as the total is reached. */
const anyTimeGoal = (id: string, total: number, effects: ActionEffect[]): CardAction => ({
  id,
  unlimited: true,
  limitedTime: 1,
  condition: { type: 'accumulation', min: total },
  actionEffects: effects,
});

/** Virtues (Foundations 90): a tally of the knights and ladies discarded, with goals. */
export const virtues: CardDef = {
  id: 263,
  name: 'Virtues',
  states: [
    {
      id: 1,
      name: 'Virtues',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0 },
      actions: [
        discardForVirtue('263-1-1'),
        scienceGoal('263-1-2', 3, [sticker([10], { ...KNIGHT, pickNumber: 1 })]),
        scienceGoal('263-1-3', 6, [sticker([10], { ...KNIGHT, pickNumber: 2 })]),
        scienceGoal('263-1-4', 10, [sticker([1, 2, 3, 4, 5, 6], { ...LADY, pickNumber: 2 })]),
        scienceGoal('263-1-5', 15, [sticker([5], { ...KNIGHT, pickNumber: 2 })]),
        scienceGoal('263-1-6', 24, [sticker([1], { ...KNIGHT, pickNumber: 2 })]),
        scienceGoal('263-1-7', 35, [sticker([7], { ...KNIGHT, pickNumber: 1 })]),
        scienceGoal('263-1-8', 50, [
          // A new tally on the other side
          {
            id: 1,
            type: ActionEffectType.SET_CUMULATED,
            cards: { scope: [TargetScope.SELF] },
            value: 0,
          },
          {
            id: 2,
            type: ActionEffectType.UPGRADE_CARD,
            cards: { scope: [TargetScope.SELF] },
            states: { ids: [2] },
          },
        ]),
      ],
    },
    {
      id: 2,
      name: 'Virtues',
      tags: [CardTag.PERMANENT],
      glory: { amount: 25 },
      actions: [
        discardForVirtue('263-2-1'),
        anyTimeGoal('263-2-2', 10, [
          {
            id: 1,
            type: ActionEffectType.PLAY_CARD,
            cards: { ...KNIGHT, scope: [TargetScope.DISCARD], autoPick: true },
          },
        ]),
        anyTimeGoal('263-2-3', 20, [
          {
            id: 1,
            type: ActionEffectType.PLAY_CARD,
            cards: { ...LADY, scope: [TargetScope.DISCARD], autoPick: true },
          },
        ]),
        anyTimeGoal('263-2-4', 35, [
          {
            id: 1,
            type: ActionEffectType.DISCARD_CARD,
            cards: { scope: [TargetScope.DECK, TargetScope.ENEMY], autoPick: true },
          },
          { id: 2, type: ActionEffectType.SHUFFLE_DECK },
        ]),
        anyTimeGoal('263-2-5', 50, [
          {
            id: 1,
            type: ActionEffectType.DESTROY_CARD,
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY], pickNumber: 1 },
          },
        ]),
        anyTimeGoal('263-2-6', 60, [sticker([17], { tags: KNIGHTS_OR_LADIES, pickNumber: 1 })]),
        anyTimeGoal('263-2-7', 75, [
          {
            id: 1,
            type: ActionEffectType.DISCOVER_CARD,
            cards: { ids: [ROMANCE_CARDS.brotherhood] },
          },
        ]),
      ],
    },
  ],
};
