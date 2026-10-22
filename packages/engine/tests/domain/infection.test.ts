import { makeInstance, makeState } from './fixtures';
import { RemoveStickerStrategy } from '@engine/domain/cardAction/RemoveStickerStrategy';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const INFECTED = 61;
const MARKED = 63;

const personDef: CardDef = {
  id: 1,
  name: 'Person',
  states: [{ id: 1, name: 'Person', tags: [CardTag.PERSON], productions: [{ gold: 9 }] }],
};
const defs = { 1: personDef };
const stickerDefs: Record<number, Sticker> = {
  [INFECTED]: { id: INFECTED, label: 'Infected' },
  [MARKED]: { id: MARKED, label: 'Infected, marked' },
};

const state = () =>
  makeState({
    board: [1, 2, 3],
    instances: {
      1: makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [INFECTED] } }),
      2: makeInstance({ id: 2, cardId: 1, stateId: 1, stickers: { 1: [INFECTED, MARKED] } }),
      3: makeInstance({ id: 3, cardId: 1, stateId: 1 }),
    },
    stickerStock: { [INFECTED]: 5 },
  });

describe('Cards selected by their stickers', () => {
  it('keeps the cards carrying one of the stickers', () => {
    const ids = cardSelector(
      { scope: [TargetScope.BOARD], stickerIds: [INFECTED] },
      99,
      state(),
      defs,
      stickerDefs,
    );
    expect(ids).toEqual([1, 2]);
  });

  it('keeps the cards carrying none of the stickers', () => {
    const ids = cardSelector(
      { scope: [TargetScope.BOARD], stickerIds: [INFECTED], withoutStickerIds: [MARKED] },
      99,
      state(),
      defs,
      stickerDefs,
    );
    expect(ids).toEqual([1]);
  });
});

describe('Infection stickers', () => {
  it('infects every person in play, whatever its production (no rule of nine)', () => {
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.ADD_STICKER,
        cards: {
          scope: [TargetScope.BOARD],
          tags: [CardTag.PERSON],
          withoutStickerIds: [INFECTED],
          autoPick: true,
        },
        stickers: { ids: [INFECTED] },
      },
      99,
      state(),
      defs,
      stickerDefs,
    );
    expect(resolved.instanceIds).toEqual([3]);
    expect(resolved.stickerIds).toEqual([INFECTED]);
  });

  it('cures a person: the chosen stickers are taken off, whatever the stock', () => {
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.REMOVE_STICKER,
        cards: { ids: [2] },
        stickers: { ids: [INFECTED, MARKED] },
      },
      99,
      state(),
      defs,
      stickerDefs,
    );
    expect(resolved.stickerIds).toEqual([INFECTED, MARKED]);

    const cured = new RemoveStickerStrategy().apply(state(), resolved);
    expect(cured.instances[2].stickers[1]).toEqual([]);
    expect(cured.instances[1].stickers[1]).toEqual([INFECTED]);
  });

  it('leaves the state unchanged without target', () => {
    const gs = state();
    const result = new RemoveStickerStrategy().apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_STICKER,
      sourceInstanceId: 99,
      stickerIds: [INFECTED],
    });
    expect(result).toBe(gs);
  });
});

describe('Cards discarded from play', () => {
  it('keeps the just discarded cards still in play or blocked by a card in play', () => {
    const gs = makeState({
      board: [1, 3],
      permanents: [4],
      drawPile: [2],
      lastDiscardedCards: [1, 2, 3],
      boardEffects: { 4: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [3] } }] },
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 1, stateId: 1 }),
        3: makeInstance({ id: 3, cardId: 1, stateId: 1 }),
        4: makeInstance({ id: 4, cardId: 1, stateId: 1 }),
      },
    });
    const ids = cardSelector(
      { scope: [TargetScope.DISCARDED_FROM_PLAY] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(ids).toEqual([1, 3]);
  });
});
