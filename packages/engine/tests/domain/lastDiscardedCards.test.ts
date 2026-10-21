import { makeInstance, makeState } from './fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { ActionEffectType, Phase, TargetScope } from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const MARK = 63;
const defs: Record<number, CardDef> = { 1: { id: 1, name: 'C', states: [{ id: 1, name: 'C' }] } };
const stickerDefs: Record<number, Sticker> = { [MARK]: { id: MARK, label: 'Mark' } };

describe('Cards just discarded, read by an action', () => {
  it('are still the discarded cards once a cost without card is paid', () => {
    const state = makeState({
      phase: Phase.TURN_END,
      discardPile: [3],
      lastDiscardedCards: [3],
      board: [4],
      instances: {
        3: makeInstance({ id: 3, cardId: 1, stateId: 1 }),
        4: makeInstance({ id: 4, cardId: 1, stateId: 1 }),
      },
      stickerStock: { [MARK]: 1 },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, defs, stickerDefs, []);

    agg.cardAction(
      {
        id: 'mark',
        unlimited: true,
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.ADD_STICKER,
            cards: { scope: [TargetScope.DISCARDED], autoPick: true },
            stickers: { ids: [MARK] },
          },
        ],
      },
      4,
    );

    expect(agg.getGameState().instances[3].stickers[1]).toEqual([MARK]);
  });
});
