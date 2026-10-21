import { makeInstance, makeState } from './fixtures';
import { countValuePerElement } from '@engine/domain/cards/selection/countValuePerElement';
import { TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = { 1: { id: 1, name: 'C', states: [{ id: 1, name: 'C' }] } };

describe('countValuePerElement with includeSelf', () => {
  const state = makeState({
    board: [2],
    instances: {
      1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
      2: makeInstance({ id: 2, cardId: 1, stateId: 1 }),
    },
  });

  it('counts the card itself once it has left play', () => {
    const value = { amount: 1, cards: { scope: [TargetScope.BOARD] }, includeSelf: true };
    expect(countValuePerElement(value, state, 1, defs, {})).toBe(2);
  });

  it('does not count the card twice when it is still selected', () => {
    const value = {
      amount: 1,
      cards: { scope: [TargetScope.BOARD, TargetScope.SELF] },
      includeSelf: true,
    };
    const inPlay = { ...state, board: [1, 2] };
    expect(countValuePerElement(value, inPlay, 1, defs, {})).toBe(2);
  });
});
