import { makeInstance, makeState } from './fixtures';
import { AddGloryStrategy } from '@engine/domain/cardAction/AddGloryStrategy';
import { getProductionChoicesForAction } from '@engine/domain/cards/getProductionChoicesForAction';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { countValuePerElement } from '@engine/domain/cards/selection/countValuePerElement';
import { evaluateCondition } from '@engine/domain/cards/selection/evaluateCondition';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef, GameState, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const KNIGHT_STICKER = 11;
const stickers: Record<number, Sticker> = {
  [KNIGHT_STICKER]: { id: KNIGHT_STICKER, label: 'Knight', tags: [CardTag.KNIGHT] },
};

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Squire',
    states: [
      {
        id: 1,
        name: 'Squire',
        tags: [CardTag.PERSON],
        productions: [{ gold: 1 }],
        glory: { amount: 3 },
      },
    ],
  },
  2: {
    id: 2,
    name: 'Quest',
    states: [
      {
        id: 1,
        name: 'Quest',
        track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 11 }, { id: 12 }] },
      },
    ],
  },
  3: {
    id: 3,
    name: 'Court',
    states: [{ id: 1, name: 'Court', glory: { amount: 0, emptyValues: 4 } }],
  },
};

function stateWith(overrides: Partial<GameState> = {}): GameState {
  return makeState({
    instances: {
      1: makeInstance({ id: 1, cardId: 1 }),
      2: makeInstance({ id: 2, cardId: 2 }),
      3: makeInstance({ id: 3, cardId: 3 }),
      4: makeInstance({ id: 4, cardId: 1 }),
    },
    ...overrides,
  });
}

describe('sticker tags', () => {
  it('give their tags to the card for selectors (Knight sticker)', () => {
    const state = stateWith({ board: [1, 4] });
    state.instances[4].stickers[1] = [KNIGHT_STICKER];
    expect(
      cardSelector(
        { scope: [TargetScope.BOARD], tags: [CardTag.KNIGHT] },
        -1,
        state,
        defs,
        stickers,
      ),
    ).toEqual([4]);
  });
});

describe('MULTIPLY_PRODUCTION', () => {
  it('multiplies the whole production of the selected cards', () => {
    const state = stateWith({
      board: [1],
      boardEffects: {
        9: [{ id: 'p', type: PassiveType.MULTIPLY_PRODUCTION, amount: 2, cards: { ids: [1] } }],
      },
    });
    expect(getProductionChoicesForAction({ gold: 1 }, state, defs, state.instances[1], {})).toEqual(
      [{ gold: 2 }],
    );
  });
});

describe('written medals', () => {
  it('count the glory of the selected cards and write their names', () => {
    const state = stateWith({ board: [1], lastDiscardedCards: [1] });
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.ADD_GLORY,
        cards: { scope: [TargetScope.SELF] },
        valuePerElement: { amount: 1, glory: true, cards: { scope: [TargetScope.DISCARDED] } },
        writeNames: true,
      },
      3,
      state,
      defs,
      {},
    );
    expect(resolved).toMatchObject({ value: 3, names: ['Squire'] });

    const after = new AddGloryStrategy(defs, {}).apply(state, { ...resolved, instanceIds: [3] });
    expect(after.instances[3]).toMatchObject({ glories: [3], writtenNames: ['Squire'] });
    expect(
      cardSelector({ scope: [TargetScope.BOARD], notWrittenHere: true }, 3, after, defs, {}),
    ).toEqual([]);
  });

  it('sum the glory of several cards', () => {
    expect(
      countValuePerElement(
        { amount: 1, glory: true, cards: { ids: [1, 4] } },
        stateWith(),
        -1,
        defs,
        {},
      ),
    ).toBe(6);
  });
});

describe('tracks in order among some steps', () => {
  it('marks the next step among `steps.ids`', () => {
    const state = stateWith({ board: [2] });
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.TRACK_ADVANCE,
        cards: { scope: [TargetScope.SELF] },
        steps: { ids: [11, 12] },
      },
      2,
      state,
      defs,
      {},
    );
    expect(resolved.stepIds).toEqual([11]);
  });

  it('stepsMarked holds once every listed step is marked', () => {
    const state = stateWith();
    state.instances[2].trackProgress = [1];
    expect(evaluateCondition({ type: 'stepsMarked', ids: [1, 2] }, state, 2, defs, {})).toBe(false);
    state.instances[2].trackProgress = [1, 2];
    expect(evaluateCondition({ type: 'stepsMarked', ids: [1, 2] }, state, 2, defs, {})).toBe(true);
  });
});

describe('notStaying', () => {
  it('leaves out the cards that stay in play', () => {
    const state = stateWith({ board: [1, 4] });
    state.instances[4].stickers[1] = [7];
    expect(
      cardSelector({ scope: [TargetScope.BOARD], notStaying: true }, -1, state, defs, {}),
    ).toEqual([1]);
  });
});
