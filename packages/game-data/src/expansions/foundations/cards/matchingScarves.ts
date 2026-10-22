import { ROMANCE_CARDS, SCARVES } from './romanceConstants';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardSelector, Condition } from '@deck-legacy/engine/domain/types';

const IN_PLAY = [TargetScope.BOARD, TargetScope.PERMANENTS];

const knightWith = (scarf: number): CardSelector => ({
  scope: IN_PLAY,
  tags: [CardTag.KNIGHT],
  stickerIds: [scarf],
});
const lady = (ladyId: number): CardSelector => ({ scope: IN_PLAY, ids: [ladyId] });

/** A knight and his lady (matching scarves) are both in play. */
const pairInPlay = (index: number): Condition => ({
  type: 'and',
  conditions: [
    { type: 'cardCount', cards: knightWith(SCARVES[index]), min: 1 },
    { type: 'cardCount', cards: lady(ROMANCE_CARDS.ladies[index]), min: 1 },
  ],
});

/** Some knight and his lady are in play. */
export const anyPairInPlay: Condition = {
  type: 'or',
  conditions: SCARVES.map((_, index) => pairInPlay(index)),
};

/**
 * "Discard 1 knight and 1 lady with matching scarves": one option per scarf (only those in play),
 * the pair discarded, then `effects`. Options numbered 1–6 in scarf order.
 */
export function matchingScarves(effects: ActionEffect[]): ActionEffect[] {
  return SCARVES.map((scarf, index) => ({
    id: index + 1,
    type: ActionEffectType.SEQUENCE,
    condition: pairInPlay(index),
    effects: [
      {
        id: 1,
        type: ActionEffectType.DISCARD_CARD,
        cards: { ...knightWith(scarf), pickNumber: 1 },
      },
      {
        id: 2,
        type: ActionEffectType.DISCARD_CARD,
        cards: { ...lady(ROMANCE_CARDS.ladies[index]), autoPick: true },
      },
      ...effects,
    ],
  }));
}
